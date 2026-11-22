import os
import io
import urllib.parse
import zipfile
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
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

class NoticeRequest(BaseModel):
    notice_type: str  # "sec_91_crpc" or "sec_102_lien"
    officer_name: Optional[str] = "Inspector Devendra Singh"
    officer_rank: Optional[str] = "Inspector of Police (Cyber Crime)"
    police_station: Optional[str] = "State Cyber Police Station, Jaipur"
    fir_number: Optional[str] = "FIR No. 42/2026 u/s 66D IT Act & 318(4) BNS"
    target_entity: Optional[str] = ""

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
    filename = file.filename or "unknown.file"
    if not filename.lower().endswith('.apk'):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format: '{filename}' is not an Android Package (.apk). Please upload a valid .apk file."
        )

    contents = await file.read()
    if len(contents) > 52_428_800: # 50MB limit
        raise HTTPException(status_code=400, detail="APK file exceeds 50MB limit.")

    if not contents.startswith(b"PK\x03\x04"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid APK structure: '{filename}' does not contain a valid Android package ZIP header (PK\\x03\\x04)."
        )

    result = analyze_apk_bytes(contents, filename)
    full_desc = f"Uploaded APK: {filename}\nExtracted Entities: {result['extracted_entities']}"
    case_id = save_case(
        source_type="Android APK (Binary Upload)",
        full_input=full_desc,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        indicators=result["indicators"],
        recommendation=result["recommendation"],
        extracted_entities=result["extracted_entities"],
        title=f"APK Package: {filename}"
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

@app.post("/api/cases/{case_id}/notice")
def api_generate_case_notice(case_id: str, req: NoticeRequest):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")

    entities = case.get("extracted_entities", {})
    phones = entities.get("phones", [])
    upis = entities.get("upis", [])
    urls = entities.get("urls", [])
    domains = entities.get("domains", [])

    target = req.target_entity or (phones[0] if phones else (upis[0] if upis else (domains[0] if domains else "Identified Scam Endpoint")))

    if req.notice_type == "sec_91_crpc":
        notice_text = f"""================================================================================
OFFICE OF THE INSPECTOR OF POLICE, CYBER CRIME POLICE STATION
{req.police_station.upper()}
RAJASTHAN POLICE HEADQUARTERS, JAIPUR
================================================================================

LEGAL REQUISITION NOTICE UNDER SECTION 91 Cr.P.C. / SECTION 94 BNSS, 2023
URGENT - CYBER FRAUD / FINANCIAL SCAM INVESTIGATION

Date: {case.get("created_at", "2026-11-22")[:10]}
Case Reference ID: {case_id}
FIR / Crime No: {req.fir_number}
Offences U/s: 66D IT Act, 2000 & 318(4), 336(3), 61(2) Bharatiya Nyaya Sanhita (BNS), 2023

TO:
The Nodal Officer / Law Enforcement Liaison Officer,
Telecom Service Provider (Airtel / Jio / Vodafone-Idea / BSNL) / Intermediary
Rajasthan Circle / Corporate Compliance

SUBJECT: Requisition of Subscriber Details (CAF), CDR, IPDR, and Tower Location for target identifier [{target}].

WHEREAS an investigation into a sophisticated cyber fraud syndicate is being conducted under the supervision of the undersigned regarding fraudulent activities linked to Case ID: {case_id}.

AND WHEREAS during technical triage conducted via the LinkedShield AI Forensic Engine, the following actionable technical indicators were recovered:
- Target Identifier: {target}
- All Extracted Telephony: {', '.join(phones) if phones else 'N/A'}
- All Associated UPI / Banking VPAs: {', '.join(upis) if upis else 'N/A'}
- Phishing / Malicious Endpoints: {', '.join(domains or urls) if (domains or urls) else 'N/A'}
- Forensic Risk Assessment: {case.get('risk_score')}/100 ({case.get('risk_level')} RISK)

NOW THEREFORE, by virtue of powers conferred under Section 91 of the Code of Criminal Procedure, 1973 (read with Section 94 of BNSS, 2023), you are hereby directed to provide the following certified records within 24 HOURS of receipt of this notice:
1. Certified Customer Application Form (CAF) along with complete KYC documents, Aadhaar/ID proof, and alternate contact numbers.
2. Complete Call Detail Records (CDR) with Cell ID, IMEI history, and Tower Location from origin date to present.
3. Internet Protocol Detail Records (IPDR) corresponding to all sessions established by the subscriber.
4. Certificate under Section 65B of the Indian Evidence Act (read with Section 63 BSA, 2023) for admissibility in court.

Please transmit records securely to cybercrime.{req.police_station.lower().replace(' ', '')}@rajasthan.gov.in.
Failure to comply shall attract penal action under Section 175 of the Indian Penal Code / Section 222 BNS, 2023.

Issued under my Hand and Official Seal:

({req.officer_name})
{req.officer_rank}
{req.police_station}
Rajasthan Police
================================================================================
"""
    else:
        notice_text = f"""================================================================================
OFFICE OF THE INSPECTOR OF POLICE, CYBER CRIME POLICE STATION
{req.police_station.upper()}
RAJASTHAN POLICE HEADQUARTERS, JAIPUR
================================================================================

DIRECTIVE FOR FREEZING OF ACCOUNTS & LIEN MARKING UNDER SECTION 102 Cr.P.C. / SEC 106 BNSS
URGENT FINANCIAL CYBER CRIME RESTRAINING ORDER

Date: {case.get("created_at", "2026-11-22")[:10]}
Case Reference ID: {case_id}
FIR / Crime No: {req.fir_number}
Offences U/s: 66D IT Act, 2000 & 318(4) Bharatiya Nyaya Sanhita (BNS), 2023

TO:
The Nodal Officer / Chief Risk Officer,
National Payments Corporation of India (NPCI) / Concerned Bank / Payment Aggregator
(State Bank of India / HDFC Bank / ICICI / Paytm Payments Bank / Axis Bank)

SUBJECT: Immediate Debit Freeze and Lien Marking on Mule Account / UPI VPA: [{target}]

WHEREAS the Rajasthan Police State Cyber Crime Command is investigating a continuous cyber scam syndicate tracked under LinkedShield AI Dossier #{case_id}.

AND WHEREAS technical evidence indicates that the following UPI VPA / Account has received illicit proceeds of cyber crime:
- Target Beneficiary Identifier: {target}
- Connected Telephony: {', '.join(phones) if phones else 'N/A'}
- Flagged UPI VPAs: {', '.join(upis) if upis else 'N/A'}
- Scam Modus Operandi: {case.get('title', 'Cyber Fraud')}
- System Risk Score: {case.get('risk_score')}/100 ({case.get('risk_level')})

NOW THEREFORE, in exercise of powers vested under Section 102 of the Code of Criminal Procedure, 1973 (read with Section 106 of BNSS, 2023), you are hereby DIRECTED to:
1. IMMEDIATELY MARK DEBIT FREEZE / LIEN on the balance held in the bank account linked to UPI VPA [{target}].
2. Provide complete Account Statement (CSV/PDF) from opening date to till date.
3. Furnish complete KYC details, PAN, registered mobile number, email ID, IP address used for net banking / UPI onboarding.
4. If funds have been further layered or transferred, furnish the Next-Hop Account Numbers, IFSC, and receiving bank details.
5. Provide Section 65B Indian Evidence Act certificate for the electronic ledger extracts.

Compliance report must be submitted within 6 HOURS of this transmission. Non-compliance will be viewed as obstruction of justice under Section 186/212 IPC / Section 223 BNS.

Issued under my Hand and Official Seal:

({req.officer_name})
{req.officer_rank}
{req.police_station}
Rajasthan Police
================================================================================
"""

    return {
        "case_id": case_id,
        "notice_type": req.notice_type,
        "target_entity": target,
        "notice_text": notice_text,
        "officer": req.officer_name,
        "station": req.police_station
    }

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
