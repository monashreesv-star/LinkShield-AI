import os
import io
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend.database import (
    init_db, save_case, get_cases_filtered, get_case_by_id,
    add_investigator_note, search_cases_and_identifiers,
    get_dashboard_stats, get_heat_list, get_relationship_graph,
    seed_synthetic_dataset, get_settings, update_settings
)
from backend.analyzer import (
    analyze_message, analyze_url_heuristics,
    analyze_website_content, analyze_apk_metadata,
    analyze_apk_bytes, extract_identifiers, safe_fetch_url
)
from backend.assistant import answer_investigation_query
from backend.pdf_generator import generate_case_pdf

app = FastAPI(
    title="LinkedShield AI — Cyber Fraud Investigation Platform",
    description="Unified API for Scam Message, URL, APK, and Website Analysis with Cross-Case Correlation",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize database and seed realistic synthetic test cases
@app.on_event("startup")
def on_startup():
    reports_dir = "/tmp/reports" if os.environ.get("VERCEL") else "reports"
    os.makedirs(reports_dir, exist_ok=True)
    try:
        os.makedirs("static", exist_ok=True)
    except Exception:
        pass
    init_db()
    seed_synthetic_dataset()

# -------------------------------------------------------------
# PYDANTIC REQUEST SCHEMAS
# -------------------------------------------------------------

class MessageRequest(BaseModel):
    text: str
    title: Optional[str] = ""

class UrlRequest(BaseModel):
    url: str

class WebsiteRequest(BaseModel):
    url: Optional[str] = ""
    content: str
    title: Optional[str] = ""

class WebsiteFetchRequest(BaseModel):
    url: str

class ApkRequest(BaseModel):
    package_name: str
    app_name: str
    permissions: List[str]
    embedded_urls: Optional[List[str]] = []
    embedded_ips: Optional[List[str]] = []

class NoteRequest(BaseModel):
    author: Optional[str] = "Investigator"
    note_text: str

class ChatRequest(BaseModel):
    query: str

class SettingsRequest(BaseModel):
    settings: Dict[str, str]

# -------------------------------------------------------------
# API ROUTES
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": "LinkedShield AI", "version": "2.0.0"}

@app.get("/api/stats")
def api_dashboard_stats():
    """Returns dynamically calculated statistics for the Investigation Dashboard."""
    return get_dashboard_stats()

# Analysis: Message
@app.post("/api/analyze/message")
def api_analyze_message(req: MessageRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    result = analyze_message(req.text)
    case_id = save_case(
        source_type="Message (SMS/WhatsApp)",
        full_input=req.text,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=req.title or f"Message Analysis ({result['risk_level']} Risk)"
    )
    result["case_id"] = case_id
    return result

# Analysis: URL
@app.post("/api/analyze/url")
def api_analyze_url(req: UrlRequest):
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    score, indicators = analyze_url_heuristics(req.url)
    extracted = extract_identifiers(req.url)

    total_score = min(score, 100)
    risk_level = "HIGH" if total_score >= 50 else ("MEDIUM" if total_score >= 25 else "LOW")

    recommendation = (
        "CRITICAL WARNING: Phishing or lookalike domain. Do not submit credentials, OTPs, or passwords."
        if risk_level == "HIGH"
        else ("CAUTION: Suspicious TLD or unverified link." if risk_level == "MEDIUM" else "Low Risk URL.")
    )

    case_id = save_case(
        source_type="URL / Link",
        full_input=req.url,
        risk_score=total_score,
        risk_level=risk_level,
        indicators=indicators,
        recommendation=recommendation,
        extracted_entities=extracted,
        title=f"URL Inspection: {urllib.parse.urlparse(req.url).netloc or req.url[:30]}"
    )

    return {
        "case_id": case_id,
        "risk_score": total_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendation": recommendation,
        "extracted_entities": extracted
    }

# Analysis: Website (Direct Text Content)
@app.post("/api/analyze/website")
def api_analyze_website(req: WebsiteRequest):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Website content text cannot be empty.")

    result = analyze_website_content(req.content, req.url or "")
    case_id = save_case(
        source_type="Fraudulent Website",
        full_input=f"URL: {req.url}\n\nContent:\n{req.content}",
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=req.title or f"Website Analysis ({result['risk_level']} Risk)"
    )
    result["case_id"] = case_id
    return result

# Analysis: Safe Remote Website Fetch (SSRF Protected)
@app.post("/api/analyze/website/fetch")
def api_fetch_and_analyze_website(req: WebsiteFetchRequest):
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    success, html_or_err = safe_fetch_url(req.url)
    if not success:
        raise HTTPException(status_code=400, detail=f"SSRF / Security Block: {html_or_err}")

    result = analyze_website_content(html_or_err, req.url)
    case_id = save_case(
        source_type="Fraudulent Website (Fetched)",
        full_input=f"Target URL: {req.url}\n\nFetched Excerpt:\n{html_or_err[:1500]}",
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=f"Remote Web Audit: {urllib.parse.urlparse(req.url).netloc}"
    )
    result["case_id"] = case_id
    return result

# Analysis: Website Upload (HTML File)
@app.post("/api/analyze/website/upload")
async def api_upload_html_file(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.html', '.htm', '.txt')):
        raise HTTPException(status_code=400, detail="Only .html, .htm, or .txt files are accepted.")

    contents = await file.read()
    if len(contents) > 2_097_152: # 2MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 2MB limit.")

    text = contents.decode("utf-8", errors="ignore")
    result = analyze_website_content(text, "")
    case_id = save_case(
        source_type="Website (Uploaded File)",
        full_input=f"Filename: {file.filename}\n\nContent Excerpt:\n{text[:1500]}",
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=f"Uploaded File: {file.filename}"
    )
    result["case_id"] = case_id
    return result

# Analysis: APK (Metadata)
@app.post("/api/analyze/apk")
def api_analyze_apk_metadata(req: ApkRequest):
    result = analyze_apk_metadata(
        package_name=req.package_name,
        app_name=req.app_name,
        permissions=req.permissions,
        embedded_urls=req.embedded_urls or [],
        embedded_ips=req.embedded_ips or []
    )

    full_desc = f"App: {req.app_name} ({req.package_name})\nPermissions: {', '.join(req.permissions)}\nURLs: {', '.join(req.embedded_urls or [])}"
    case_id = save_case(
        source_type="Android APK",
        full_input=full_desc,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=f"APK Audit: {req.app_name}"
    )
    result["case_id"] = case_id
    return result

# Analysis: APK (File Upload)
@app.post("/api/analyze/apk/upload")
async def api_upload_apk_file(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.apk'):
        raise HTTPException(status_code=400, detail="Only .apk packages are supported.")

    contents = await file.read()
    if len(contents) > 52_428_800: # 50MB limit
        raise HTTPException(status_code=400, detail="APK file exceeds 50MB limit.")

    result = analyze_apk_bytes(contents, file.filename)
    full_desc = f"Uploaded APK: {file.filename}\nExtracted Entities: {result['extracted_entities']}"
    case_id = save_case(
        source_type="Android APK (Binary Upload)",
        full_input=full_desc,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=f"APK Package: {file.filename}"
    )
    result["case_id"] = case_id
    return result

# Case Management
@app.get("/api/cases")
def api_get_cases(
    risk: Optional[str] = None,
    source: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    return get_cases_filtered(risk_level=risk, source_type=source, search_query=q, limit=limit, offset=offset)

@app.get("/api/cases/{case_id}")
def api_get_case(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")
    return case

@app.post("/api/cases/{case_id}/notes")
def api_add_case_note(case_id: str, req: NoteRequest):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")
    if not req.note_text.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")
    return add_investigator_note(case_id, req.author or "Investigator", req.note_text.strip())

@app.get("/api/cases/{case_id}/pdf")
def api_download_case_pdf(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")

    reports_dir = "/tmp/reports" if os.environ.get("VERCEL") else "reports"
    pdf_path = f"{reports_dir}/Case_{case_id}.pdf"
    if not os.path.exists(pdf_path):
        generate_case_pdf(case, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"LinkedShield_Forensic_{case_id}.pdf"
    )

@app.get("/api/search")
def api_search(q: str = Query(..., min_length=1)):
    return search_cases_and_identifiers(q)

@app.get("/api/intel/heat-list")
def api_heat_list(days: Optional[int] = None):
    return get_heat_list(days=days, limit=15)

@app.get("/api/intel/graph")
def api_relationship_graph():
    return get_relationship_graph()

# AI Investigation Assistant
@app.post("/api/assistant/chat")
def api_assistant_chat(req: ChatRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return answer_investigation_query(req.query)

# Seed Synthetic Demo Data
@app.post("/api/demo/seed")
def api_seed_demo_data():
    seed_synthetic_dataset(force=True)
    return {"message": "Synthetic demonstration dataset loaded successfully (30+ cases)."}

# System Settings
@app.get("/api/settings")
def api_get_settings():
    return get_settings()

@app.post("/api/settings")
def api_update_settings(req: SettingsRequest):
    update_settings(req.settings)
    return {"status": "success", "message": "Settings updated."}

# Mount static frontend
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
