import os
import io
import urllib.parse
import zipfile
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend.database import (
    init_db, save_case, get_cases_filtered, get_case_by_id,
    add_investigator_note, search_cases_and_identifiers,
    get_dashboard_stats, get_heat_list, get_relationship_graph,
    seed_synthetic_dataset, get_settings, update_settings,
    register_user, authenticate_user, save_citizen_submission,
    get_citizen_submissions, get_citizen_submission_by_id,
    update_citizen_submission_status, convert_submission_to_case,
    get_citizen_dashboard_stats, check_threat_registry
)
from backend.auth import (
    create_session, get_user_by_token, delete_session, log_audit
)
from backend.analyzer import (
    analyze_message, analyze_url_heuristics,
    analyze_website_content, analyze_apk_metadata,
    analyze_apk_bytes, extract_identifiers, safe_fetch_url
)
from backend.assistant import answer_investigation_query, answer_citizen_query
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

# Role-Based Auth Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    mobile: Optional[str] = ""
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class DemoLoginRequest(BaseModel):
    role: str  # "citizen" or "officer"

class CitizenReportRequest(BaseModel):
    submission_type: str  # "Message", "URL", "Website"
    content: str
    citizen_name: Optional[str] = ""
    citizen_mobile: Optional[str] = ""

class CitizenQueryRequest(BaseModel):
    query: str

class UpdateStatusRequest(BaseModel):
    status: str
    officer_notes: Optional[str] = ""

# -------------------------------------------------------------
# RBAC SECURITY DEPENDENCIES
# -------------------------------------------------------------

def require_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Requires valid session token for any authenticated user."""
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    return user

def require_officer(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Strictly enforces Authorised Cyber Officer credentials."""
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required. Officer credentials required.")
    if user["role"] != "officer":
        raise HTTPException(
            status_code=403,
            detail="Access Forbidden: Officer authorization required. Citizens cannot access investigative intelligence."
        )
    return user

def block_citizen_if_token_present(authorization: Optional[str] = Header(None)):
    """Blocks citizens from restricted police intelligence endpoints."""
    if authorization:
        user = get_user_by_token(authorization)
        if user and user["role"] == "citizen":
            raise HTTPException(
                status_code=403,
                detail="Access Forbidden: Citizens cannot access internal police intelligence or case records."
            )

# -------------------------------------------------------------
# AUTHENTICATION ROUTES
# -------------------------------------------------------------

@app.post("/api/auth/register")
def api_register(req: RegisterRequest):
    try:
        user = register_user(req.name, req.email, req.mobile or "", req.password, role="citizen")
        token = create_session(user["user_id"], "citizen")
        log_audit(user["user_id"], "citizen", "CITIZEN_REGISTRATION", f"Registered: {user['email']}")
        return {
            "token": token,
            "user": user,
            "message": "Citizen account created successfully."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
def api_login(req: LoginRequest):
    user = authenticate_user(req.email, req.password, role=req.role)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials or unauthorized role access.")

    token = create_session(user["user_id"], user["role"])
    log_audit(user["user_id"], user["role"], "LOGIN_SUCCESS", f"Email: {user['email']}")
    return {
        "token": token,
        "user": user,
        "message": f"Welcome back, {user['name']}."
    }

@app.post("/api/auth/demo-login")
def api_demo_login(req: DemoLoginRequest):
    role = req.role.lower().strip()
    if role == "citizen":
        user = authenticate_user("citizen@rajasthan.gov.in", "Citizen@2026", role="citizen")
    elif role == "officer":
        user = authenticate_user("cyber.officer@rajasthan.gov.in", "Officer@2026", role="officer")
    else:
        raise HTTPException(status_code=400, detail="Invalid demo role. Must be 'citizen' or 'officer'.")

    if not user:
        raise HTTPException(status_code=500, detail="Demo account not found in registry.")

    token = create_session(user["user_id"], user["role"])
    log_audit(user["user_id"], user["role"], "DEMO_LOGIN", f"Role: {role}")
    return {
        "token": token,
        "user": user,
        "message": f"Demo {role.capitalize()} authentication successful."
    }

@app.get("/api/auth/me")
def api_auth_me(user: Dict[str, Any] = Depends(require_current_user)):
    return {"user": user}

@app.post("/api/auth/logout")
def api_auth_logout(authorization: Optional[str] = Header(None)):
    delete_session(authorization)
    return {"message": "Logged out successfully."}

# -------------------------------------------------------------
# CITIZEN PORTAL ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/citizen/dashboard")
def api_citizen_dashboard(user: Dict[str, Any] = Depends(require_current_user)):
    return get_citizen_dashboard_stats(user["user_id"])

@app.post("/api/citizen/report")
def api_citizen_submit_report(req: CitizenReportRequest, user: Dict[str, Any] = Depends(require_current_user)):
    content = req.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Submission content cannot be empty.")

    sub_type = req.submission_type
    if sub_type == "URL":
        score, indicators = analyze_url_heuristics(content)
        extracted = extract_identifiers(content)
        risk_level = "HIGH" if score >= 50 else ("MEDIUM" if score >= 25 else "LOW")
        rec = "Phishing domain detected. Avoid opening or submitting credentials." if risk_level == "HIGH" else "Standard domain. Exercise standard web hygiene."
    elif sub_type == "Website":
        res = analyze_website_content(content)
        score = res["risk_score"]
        risk_level = res["risk_level"]
        indicators = res["indicators"]
        extracted = res["extracted_entities"]
        rec = res["recommendation"]
    else: # Message
        res = analyze_message(content)
        score = res["risk_score"]
        risk_level = res["risk_level"]
        indicators = res["indicators"]
        extracted = res["extracted_entities"]
        rec = res["recommendation"]

    sub_id = save_citizen_submission(
        citizen_id=user["user_id"],
        citizen_name=user["name"],
        citizen_mobile=user.get("mobile") or req.citizen_mobile or "",
        submission_type=sub_type,
        submitted_content=content,
        risk_score=score,
        risk_level=risk_level,
        indicators=indicators,
        extracted_entities=extracted,
        recommendation=rec
    )

    log_audit(user["user_id"], user["role"], "CITIZEN_REPORT_SUBMITTED", f"Submission Ref: {sub_id}")

    return {
        "submission_id": sub_id,
        "status": "Submitted",
        "risk_score": score,
        "risk_level": risk_level,
        "indicators": indicators,
        "extracted_entities": extracted,
        "recommendation": rec,
        "disclaimer": "Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels."
    }

@app.post("/api/citizen/upload-evidence")
async def api_citizen_upload_evidence(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(""),
    user: Dict[str, Any] = Depends(require_current_user)
):
    allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.txt', '.html']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File format '{ext}' is not supported. Allowed formats: PNG, JPG, PDF, TXT, HTML."
        )

    contents = await file.read()
    if len(contents) > 10_485_760: # 10MB limit
        raise HTTPException(status_code=400, detail="Evidence file exceeds 10MB limit.")

    evidence_dir = "/tmp/evidence" if os.environ.get("VERCEL") else "evidence"
    os.makedirs(evidence_dir, exist_ok=True)
    saved_filename = f"{user['user_id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    filepath = os.path.join(evidence_dir, saved_filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    extracted_text = ""
    if ext in ['.txt', '.html']:
        extracted_text = contents.decode("utf-8", errors="ignore")
    else:
        extracted_text = f"[Binary Evidence File: {file.filename} ({len(contents)} bytes)]\nCitizen Notes: {notes}"

    extracted = extract_identifiers(extracted_text)
    sub_id = save_citizen_submission(
        citizen_id=user["user_id"],
        citizen_name=user["name"],
        citizen_mobile=user.get("mobile") or "",
        submission_type="Evidence Upload",
        submitted_content=extracted_text,
        risk_score=20,
        risk_level="MEDIUM" if extracted.get("phones") or extracted.get("urls") else "LOW",
        indicators=[{"name": "Citizen Evidence Captured", "score": 20, "reason": f"Digital screenshot/document uploaded: {file.filename}"}],
        extracted_entities=extracted,
        recommendation="Evidence preserved under secure chain of custody. Cyber crime unit will examine attached files.",
        evidence_filename=file.filename
    )

    log_audit(user["user_id"], user["role"], "CITIZEN_EVIDENCE_UPLOADED", f"Submission Ref: {sub_id}")

    return {
        "submission_id": sub_id,
        "status": "Submitted",
        "evidence_filename": file.filename,
        "extracted_entities": extracted,
        "disclaimer": "Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels."
    }

@app.get("/api/citizen/my-reports")
def api_citizen_my_reports(
    status: Optional[str] = None,
    user: Dict[str, Any] = Depends(require_current_user)
):
    return get_citizen_submissions(citizen_id=user["user_id"], status=status)

@app.get("/api/citizen/my-reports/{submission_id}")
def api_citizen_get_single_report(submission_id: str, user: Dict[str, Any] = Depends(require_current_user)):
    sub = get_citizen_submission_by_id(submission_id, citizen_id=user["user_id"])
    if not sub:
        raise HTTPException(status_code=404, detail="Report not found or access unauthorized.")
    return sub

@app.post("/api/citizen/assistant")
def api_citizen_assistant(req: CitizenQueryRequest, user: Dict[str, Any] = Depends(require_current_user)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return answer_citizen_query(req.query, citizen_name=user.get("name", "Citizen"))

@app.get("/api/citizen/check-threat")
def api_citizen_check_threat(q: str = Query(...), user: Dict[str, Any] = Depends(require_current_user)):
    return check_threat_registry(q)

# -------------------------------------------------------------
# OFFICER REVIEW ENDPOINTS (CITIZEN SUBMISSIONS)
# -------------------------------------------------------------

@app.get("/api/officer/citizen-submissions")
def api_officer_list_submissions(
    status: Optional[str] = None,
    risk: Optional[str] = None,
    q: Optional[str] = None,
    user: Dict[str, Any] = Depends(require_officer)
):
    return get_citizen_submissions(status=status, risk_level=risk, search=q)

@app.get("/api/officer/citizen-submissions/{submission_id}")
def api_officer_get_submission(submission_id: str, user: Dict[str, Any] = Depends(require_officer)):
    sub = get_citizen_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return sub

@app.patch("/api/officer/citizen-submissions/{submission_id}/status")
def api_officer_update_status(
    submission_id: str,
    req: UpdateStatusRequest,
    user: Dict[str, Any] = Depends(require_officer)
):
    valid_statuses = ["Submitted", "Analysed", "Under Review", "Closed"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    ok = update_citizen_submission_status(submission_id, req.status, req.officer_notes or "")
    if not ok:
        raise HTTPException(status_code=404, detail="Submission not found.")
    log_audit(user["user_id"], user["role"], "SUBMISSION_STATUS_UPDATED", f"Ref: {submission_id} -> {req.status}")
    return {"message": "Status updated successfully.", "status": req.status}

@app.post("/api/officer/citizen-submissions/{submission_id}/convert-to-case")
def api_officer_convert_to_case(submission_id: str, user: Dict[str, Any] = Depends(require_officer)):
    case_id = convert_submission_to_case(submission_id, user["name"])
    if not case_id:
        raise HTTPException(status_code=404, detail="Submission not found.")
    log_audit(user["user_id"], user["role"], "CONVERTED_TO_FIR_CASE", f"Ref: {submission_id} -> Case: {case_id}")
    return {"message": "Escalated to formal FIR Case.", "case_id": case_id}

# -------------------------------------------------------------
# OFFICER INVESTIGATION ROUTES (PROTECTED)
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

    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL Analysis error: {str(e)}")

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
    offset: int = 0,
    _auth = Depends(block_citizen_if_token_present)
):
    return get_cases_filtered(risk_level=risk, source_type=source, search_query=q, limit=limit, offset=offset)

@app.get("/api/cases/{case_id}")
def api_get_case(case_id: str, _auth = Depends(block_citizen_if_token_present)):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")
    return case

@app.post("/api/cases/{case_id}/notes")
def api_add_case_note(case_id: str, req: NoteRequest, _auth = Depends(block_citizen_if_token_present)):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case record not found.")
    if not req.note_text.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")
    return add_investigator_note(case_id, req.author or "Investigator", req.note_text.strip())

@app.get("/api/cases/{case_id}/pdf")
def api_download_case_pdf(case_id: str, _auth = Depends(block_citizen_if_token_present)):
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
def api_generate_case_notice(case_id: str, req: NoticeRequest, _auth = Depends(block_citizen_if_token_present)):
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
def api_relationship_graph(_auth = Depends(block_citizen_if_token_present)):
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
