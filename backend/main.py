import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend.database import (
    init_db, save_case, get_all_cases, get_case_by_id,
    search_cases_and_identifiers, get_heat_list, get_relationship_graph,
    seed_sample_data
)
from backend.analyzer import (
    analyze_message, analyze_url_heuristics,
    analyze_website_content, analyze_apk_metadata,
    extract_identifiers
)
from backend.pdf_generator import generate_case_pdf

app = FastAPI(
    title="LinkedShield AI — Cyber Fraud Investigation Platform",
    description="Unified API for Scam Message, URL, APK, and Website Analysis with Cross-Case Correlation",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize database and seed sample cases
@app.on_event("startup")
def on_startup():
    init_db()
    seed_sample_data()
    os.makedirs("reports", exist_ok=True)
    os.makedirs("static", exist_ok=True)

# Request Models
class MessageRequest(BaseModel):
    text: str

class UrlRequest(BaseModel):
    url: str

class WebsiteRequest(BaseModel):
    url: Optional[str] = ""
    content: str

class ApkRequest(BaseModel):
    package_name: str
    app_name: str
    permissions: List[str]
    embedded_urls: Optional[List[str]] = []

@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": "LinkedShield AI"}

@app.post("/api/analyze/message")
def api_analyze_message(req: MessageRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    result = analyze_message(req.text)
    case_id = save_case(
        source_type="Message (SMS/WhatsApp)",
        full_input=req.text,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"]
    )
    result["case_id"] = case_id
    return result

@app.post("/api/analyze/url")
def api_analyze_url(req: UrlRequest):
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    score, indicators = analyze_url_heuristics(req.url)
    extracted = extract_identifiers(req.url)
    
    total_score = min(score, 100)
    risk_level = "HIGH" if total_score >= 50 else ("MEDIUM" if total_score >= 25 else "LOW")

    recommendation = (
        "CRITICAL WARNING: Phishing or lookalike domain. Do not submit credentials or OTPs."
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
        extracted_entities=extracted
    )

    return {
        "case_id": case_id,
        "risk_score": total_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendation": recommendation,
        "extracted_entities": extracted
    }

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
        extracted_entities=result["extracted_entities"]
    )
    result["case_id"] = case_id
    return result

@app.post("/api/analyze/apk")
def api_analyze_apk(req: ApkRequest):
    result = analyze_apk_metadata(
        package_name=req.package_name,
        app_name=req.app_name,
        permissions=req.permissions,
        embedded_urls=req.embedded_urls or []
    )

    full_desc = f"App: {req.app_name} ({req.package_name})\nPermissions: {', '.join(req.permissions)}\nURLs: {', '.join(req.embedded_urls or [])}"
    case_id = save_case(
        source_type="Android APK",
        full_input=full_desc,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"]
    )
    result["case_id"] = case_id
    return result

@app.get("/api/cases")
def api_get_cases(limit: int = 50):
    return get_all_cases(limit)

@app.get("/api/cases/{case_id}")
def api_get_case(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case

@app.get("/api/cases/{case_id}/pdf")
def api_download_case_pdf(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    pdf_path = f"reports/Case_{case_id}.pdf"
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
def api_heat_list():
    return get_heat_list(limit=10)

@app.get("/api/intel/graph")
def api_relationship_graph():
    return get_relationship_graph()

# Mount frontend static files if directory exists
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
