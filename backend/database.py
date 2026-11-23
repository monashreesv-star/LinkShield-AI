import os
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = "/tmp/linkedshield.db" if os.environ.get("VERCEL") else "linkedshield.db"

_db_initialized = False

def ensure_initialized():
    global _db_initialized
    if _db_initialized:
        return
    _db_initialized = True
    try:
        if os.environ.get("VERCEL") and not os.path.exists(DB_PATH):
            if os.path.exists("linkedshield.db"):
                try:
                    import shutil
                    shutil.copyfile("linkedshield.db", DB_PATH)
                except Exception:
                    pass
        init_db()
        seed_synthetic_dataset()
        seed_default_users_and_submissions()
    except Exception as e:
        pass

def get_db_connection():
    if not _db_initialized:
        ensure_initialized()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Cases table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        source_type TEXT NOT NULL,
        title TEXT NOT NULL,
        input_preview TEXT NOT NULL,
        full_input TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        indicators_json TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        raw_metadata_json TEXT NOT NULL,
        evidence_hash TEXT NOT NULL,
        is_synthetic INTEGER DEFAULT 0
    );
    """)

    # Extracted identifiers table (for cross-case linking)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS identifiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases(case_id)
    );
    """)

    # Investigator notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investigator_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        author TEXT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases(case_id)
    );
    """)

    # Users table for RBAC (Citizens & Officers)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        badge_id TEXT,
        station TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Citizen submissions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS citizen_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id TEXT UNIQUE NOT NULL,
        citizen_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        citizen_mobile TEXT,
        submission_type TEXT NOT NULL,
        submitted_content TEXT NOT NULL,
        evidence_filename TEXT,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        indicators_json TEXT NOT NULL,
        extracted_entities_json TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted',
        officer_notes TEXT,
        converted_case_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (citizen_id) REFERENCES users(user_id)
    );
    """)

    # Active sessions table for secure session token lookup
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    # Audit logging table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    );
    """)

    # System settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_identifiers_val ON identifiers(entity_value);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_identifiers_type ON identifiers(entity_type);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_risk ON cases(risk_level);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(created_at);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_citizen_sub_citizen ON citizen_submissions(citizen_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_citizen_sub_status ON citizen_submissions(status);")

    # Seed default settings
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('low_threshold', '24');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('med_threshold', '49');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('agency_name', 'Rajasthan Police Cyber Crime Division');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('auto_archive_days', '90');")

    conn.commit()
    conn.close()

    # Seed default users and sample citizen submissions
    seed_default_users_and_submissions()

def save_case(
    source_type: str,
    full_input: str,
    risk_score: int,
    risk_level: str,
    indicators: List[Dict[str, Any]],
    recommendation: str,
    extracted_entities: Dict[str, List[str]],
    title: str = "",
    raw_metadata: Optional[Dict[str, Any]] = None,
    is_synthetic: bool = False,
    custom_timestamp: Optional[str] = None
) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()

    timestamp = custom_timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hash_obj = hashlib.sha256(f"{full_input}_{timestamp}".encode("utf-8"))
    evidence_hash = hash_obj.hexdigest()
    case_id = f"LS-{datetime.now().strftime('%Y%m%d')}-{evidence_hash[:6].upper()}"

    if not title:
        title = f"{source_type} Investigation ({risk_level} Risk)"

    input_preview = full_input[:140] + ("..." if len(full_input) > 140 else "")

    cursor.execute("""
    INSERT INTO cases (
        case_id, created_at, source_type, title, input_preview, full_input,
        risk_score, risk_level, indicators_json, recommendation,
        raw_metadata_json, evidence_hash, is_synthetic
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        timestamp,
        source_type,
        title,
        input_preview,
        full_input,
        risk_score,
        risk_level,
        json.dumps(indicators),
        recommendation,
        json.dumps(raw_metadata or {}),
        evidence_hash,
        1 if is_synthetic else 0
    ))

    # Insert extracted entities with matching timestamp
    for entity_type, values in extracted_entities.items():
        if isinstance(values, list):
            for val in set(values):
                clean_val = str(val).strip().lower()
                if clean_val:
                    cursor.execute("""
                    INSERT INTO identifiers (case_id, entity_type, entity_value, created_at)
                    VALUES (?, ?, ?, ?)
                    """, (case_id, entity_type, clean_val, timestamp))

    conn.commit()
    conn.close()
    return case_id

def get_cases_filtered(
    risk_level: Optional[str] = None,
    source_type: Optional[str] = None,
    search_query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM cases WHERE 1=1"
    params = []

    if risk_level and risk_level.upper() != "ALL":
        query += " AND risk_level = ?"
        params.append(risk_level.upper())

    if source_type and source_type.upper() != "ALL":
        query += " AND source_type LIKE ?"
        params.append(f"%{source_type}%")

    if search_query:
        clean_q = f"%{search_query.strip().lower()}%"
        query += " AND (case_id LIKE ? OR full_input LIKE ? OR title LIKE ? OR case_id IN (SELECT case_id FROM identifiers WHERE entity_value LIKE ?))"
        params.extend([clean_q, clean_q, clean_q, clean_q])

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["indicators"] = json.loads(d["indicators_json"])
        d["raw_metadata"] = json.loads(d["raw_metadata_json"])
        results.append(d)

    conn.close()
    return results

def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    d["indicators"] = json.loads(d["indicators_json"])
    d["raw_metadata"] = json.loads(d["raw_metadata_json"])

    # Get linked identifiers
    cursor.execute("SELECT entity_type, entity_value FROM identifiers WHERE case_id = ?", (case_id,))
    d["identifiers"] = [dict(r) for r in cursor.fetchall()]

    ents = {"phones": [], "upis": [], "domains": [], "urls": [], "emails": [], "crypto_wallets": []}
    for item in d["identifiers"]:
        etype = item.get("entity_type", "")
        eval_ = item.get("entity_value", "")
        if etype in ["phone", "telephony"]:
            ents["phones"].append(eval_)
        elif etype in ["upi", "vpa"]:
            ents["upis"].append(eval_)
        elif etype in ["domain"]:
            ents["domains"].append(eval_)
        elif etype in ["url"]:
            ents["urls"].append(eval_)
        elif etype in ["email"]:
            ents["emails"].append(eval_)
        elif etype in ["crypto", "crypto_wallet"]:
            ents["crypto_wallets"].append(eval_)
    d["extracted_entities"] = ents

    # Get notes
    cursor.execute("SELECT id, author, note_text, created_at FROM investigator_notes WHERE case_id = ? ORDER BY id DESC", (case_id,))
    d["notes"] = [dict(r) for r in cursor.fetchall()]

    # Find connected cases (cases sharing any identifier with this case)
    cursor.execute("""
    SELECT DISTINCT i2.case_id, c.risk_level, c.source_type, c.created_at, c.input_preview, i1.entity_type, i1.entity_value
    FROM identifiers i1
    JOIN identifiers i2 ON i1.entity_value = i2.entity_value AND i1.entity_type = i2.entity_type
    JOIN cases c ON i2.case_id = c.case_id
    WHERE i1.case_id = ? AND i2.case_id != ?
    ORDER BY c.id DESC LIMIT 10
    """, (case_id, case_id))
    d["connected_cases"] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return d

def add_investigator_note(case_id: str, author: str, note_text: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO investigator_notes (case_id, author, note_text, created_at)
    VALUES (?, ?, ?, ?)
    """, (case_id, author or "Investigator", note_text, timestamp))

    note_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": note_id, "case_id": case_id, "author": author, "note_text": note_text, "created_at": timestamp}

def search_cases_and_identifiers(query: str) -> Dict[str, Any]:
    query_clean = query.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Search in identifiers
    cursor.execute("""
    SELECT i.entity_type, i.entity_value, i.case_id, c.risk_level, c.source_type, c.created_at, c.input_preview
    FROM identifiers i
    JOIN cases c ON i.case_id = c.case_id
    WHERE i.entity_value LIKE ?
    ORDER BY c.id DESC LIMIT 30
    """, (f"%{query_clean}%",))
    matched_identifiers = [dict(r) for r in cursor.fetchall()]

    # Search in cases
    cursor.execute("""
    SELECT * FROM cases
    WHERE full_input LIKE ? OR case_id LIKE ? OR indicators_json LIKE ? OR title LIKE ?
    ORDER BY id DESC LIMIT 30
    """, (f"%{query_clean}%", f"%{query_clean}%", f"%{query_clean}%", f"%{query_clean}%"))
    matched_cases = []
    for r in cursor.fetchall():
        d = dict(r)
        d["indicators"] = json.loads(d["indicators_json"])
        matched_cases.append(d)

    conn.close()
    return {
        "query": query,
        "matched_identifiers": matched_identifiers,
        "matched_cases": matched_cases,
        "total_results": len(matched_identifiers) + len(matched_cases)
    }

def get_dashboard_stats() -> Dict[str, Any]:
    """Dynamically calculates high-level metrics and distributions from persistent SQLite storage."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total & risk level counts
    cursor.execute("SELECT COUNT(*) FROM cases;")
    total_cases = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE risk_level = 'HIGH';")
    high_cases = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE risk_level = 'MEDIUM';")
    medium_cases = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE risk_level = 'LOW';")
    low_cases = cursor.fetchone()[0]

    # Unique entities
    cursor.execute("SELECT COUNT(DISTINCT entity_value) FROM identifiers WHERE entity_type = 'domain';")
    suspicious_domains = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT entity_value) FROM identifiers WHERE entity_type = 'phone';")
    flagged_phones = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT entity_value) FROM identifiers WHERE entity_type = 'upi';")
    flagged_upis = cursor.fetchone()[0]

    # Repeated entities (appearing in >1 case)
    cursor.execute("""
    SELECT COUNT(*) FROM (
        SELECT entity_value FROM identifiers GROUP BY entity_value HAVING COUNT(DISTINCT case_id) > 1
    );
    """)
    repeated_identifiers = cursor.fetchone()[0]

    # Distribution by threat vector
    cursor.execute("""
    SELECT source_type, COUNT(*) as count FROM cases GROUP BY source_type ORDER BY count DESC;
    """)
    vector_distribution = [dict(r) for r in cursor.fetchall()]

    # Recent cases
    cursor.execute("SELECT case_id, created_at, source_type, title, risk_score, risk_level, input_preview FROM cases ORDER BY id DESC LIMIT 8;")
    recent_cases = [dict(r) for r in cursor.fetchall()]

    # Identifier frequencies (Top 5 across types)
    cursor.execute("""
    SELECT entity_value, entity_type, COUNT(DISTINCT case_id) as cases_count
    FROM identifiers
    GROUP BY entity_value, entity_type
    ORDER BY cases_count DESC
    LIMIT 6;
    """)
    top_repeat_entities = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "total_cases": total_cases,
        "high_risk_cases": high_cases,
        "medium_risk_cases": medium_cases,
        "low_risk_cases": low_cases,
        "suspicious_domains": suspicious_domains,
        "flagged_phones": flagged_phones,
        "flagged_upis": flagged_upis,
        "repeated_identifiers": repeated_identifiers,
        "risk_breakdown": [
            {"name": "High Risk", "value": high_cases, "color": "#EF4444"},
            {"name": "Medium Risk", "value": medium_cases, "color": "#F59E0B"},
            {"name": "Low Risk", "value": low_cases, "color": "#10B981"}
        ],
        "vector_distribution": vector_distribution,
        "recent_cases": recent_cases,
        "top_repeat_entities": top_repeat_entities
    }

def get_heat_list(days: Optional[int] = None, limit: int = 15) -> Dict[str, List[Dict[str, Any]]]:
    """Returns top reported domains, phones, UPIs, emails, and apps across distinct cases."""
    conn = get_db_connection()
    cursor = conn.cursor()

    time_clause = ""
    params = []
    if days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        time_clause = "AND created_at >= ?"
        params.append(cutoff)

    categories = ["domain", "phone", "upi", "url", "email", "crypto"]
    heat_list = {}

    for cat in categories:
        cat_params = [cat] + params + [limit]
        cursor.execute(f"""
        SELECT entity_value, COUNT(DISTINCT case_id) as case_count, MAX(created_at) as last_seen
        FROM identifiers
        WHERE entity_type = ? {time_clause}
        GROUP BY entity_value
        ORDER BY case_count DESC
        LIMIT ?
        """, cat_params)
        raw_rows = cursor.fetchall()
        heat_list[cat] = [
            {
                "entity_value": r["entity_value"],
                "value": r["entity_value"],
                "case_count": r["case_count"],
                "count": r["case_count"],
                "last_seen": r["last_seen"]
            }
            for r in raw_rows
        ]

    conn.close()
    return heat_list

def get_relationship_graph() -> Dict[str, Any]:
    """Constructs a node-edge graph connecting cases and shared actionable identifiers."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT case_id, risk_level, source_type, risk_score, title FROM cases ORDER BY id DESC LIMIT 40;")
    cases = cursor.fetchall()

    cursor.execute("""
    SELECT entity_type, entity_value, case_id
    FROM identifiers
    WHERE case_id IN (SELECT case_id FROM cases ORDER BY id DESC LIMIT 40);
    """)
    links = cursor.fetchall()

    nodes = []
    edges = []
    case_ids = set()

    for c in cases:
        cid = c["case_id"]
        case_ids.add(cid)
        nodes.append({
            "id": cid,
            "label": cid,
            "title": c["title"],
            "type": "case",
            "risk": c["risk_level"],
            "score": c["risk_score"],
            "source": c["source_type"]
        })

    entity_map = {}
    for link in links:
        eval_key = f"{link['entity_type']}:{link['entity_value']}"
        if eval_key not in entity_map:
            entity_map[eval_key] = {
                "id": eval_key,
                "label": link['entity_value'],
                "type": link['entity_type'],
                "cases": []
            }
        entity_map[eval_key]["cases"].append(link["case_id"])

    # Add entity nodes and edges
    for e_key, data in entity_map.items():
        node_id = data["id"]
        case_count = len(set(data["cases"]))
        nodes.append({
            "id": node_id,
            "label": data["label"],
            "type": data["type"],
            "case_count": case_count,
            "cases": list(set(data["cases"]))
        })
        for cid in set(data["cases"]):
            edges.append({
                "id": f"{cid}->{node_id}",
                "from": cid,
                "to": node_id,
                "type": data["type"]
            })

    conn.close()
    return {"nodes": nodes, "edges": edges}

def seed_synthetic_dataset(force: bool = False):
    """Loads all 30+ labeled synthetic cases with staggered realistic historical dates."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases;")
    count = cursor.fetchone()[0]
    conn.close()

    if count > 5 and not force:
        return

    from backend.synthetic_data import SYNTHETIC_DATASET
    from backend.analyzer import analyze_message, analyze_url_heuristics, analyze_website_content

    for i, item in enumerate(SYNTHETIC_DATASET):
        src = item["source_type"]
        content = item["content"]

        # Stagger dates across recent (1-5 days), medium (10-25 days), and older (35-70 days)
        if i < 10:
            case_date = (datetime.now() - timedelta(days=(i % 4) + 1, hours=i * 2)).strftime("%Y-%m-%d %H:%M:%S")
        elif i < 20:
            case_date = (datetime.now() - timedelta(days=12 + (i % 12), hours=i * 3)).strftime("%Y-%m-%d %H:%M:%S")
        else:
            case_date = (datetime.now() - timedelta(days=35 + (i % 30), hours=i * 4)).strftime("%Y-%m-%d %H:%M:%S")

        if "Message" in src:
            res = analyze_message(content)
        elif "URL" in src:
            score, ind = analyze_url_heuristics(content)
            res = {
                "risk_score": score,
                "risk_level": "HIGH" if score >= 50 else ("MEDIUM" if score >= 25 else "LOW"),
                "indicators": ind,
                "recommendation": "Phishing domain detected." if score >= 50 else "Standard domain.",
                "extracted_entities": item.get("entities", {})
            }
        else:
            res = analyze_website_content(content)

        # Merge pre-defined entities
        all_entities = res.get("extracted_entities", {})
        for k, v in item.get("entities", {}).items():
            if k not in all_entities:
                all_entities[k] = []
            all_entities[k].extend(v)

        save_case(
            source_type=src,
            full_input=content,
            risk_score=res["risk_score"],
            risk_level=res["risk_level"],
            indicators=res["indicators"],
            recommendation=res["recommendation"],
            extracted_entities=all_entities,
            title=item.get("label", ""),
            is_synthetic=True,
            custom_timestamp=case_date
        )

def get_settings() -> Dict[str, str]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM system_settings;")
    settings = {r["key"]: r["value"] for r in cursor.fetchall()}
    conn.close()
    return settings

def update_settings(new_settings: Dict[str, str]):
    conn = get_db_connection()
    cursor = conn.cursor()
    for k, v in new_settings.items():
        cursor.execute("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?);", (k, str(v)))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# USER MANAGEMENT & CITIZEN SUBMISSION ENGINE
# -------------------------------------------------------------

def seed_default_users_and_submissions():
    """Initializes default demo Citizen and Officer accounts, and seed citizen submissions."""
    from backend.auth import hash_password
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Seed Demo Citizen
    cursor.execute("SELECT id FROM users WHERE email = 'citizen@rajasthan.gov.in';")
    if not cursor.fetchone():
        citizen_pwd = hash_password("Citizen@2026")
        cursor.execute("""
        INSERT INTO users (user_id, name, email, mobile, password_hash, role, created_at)
        VALUES ('CIT-USER-001', 'Rajesh Sharma', 'citizen@rajasthan.gov.in', '+91 9876543210', ?, 'citizen', datetime('now'))
        """, (citizen_pwd,))

    # 2. Seed Demo Officer
    cursor.execute("SELECT id FROM users WHERE email = 'cyber.officer@rajasthan.gov.in';")
    if not cursor.fetchone():
        officer_pwd = hash_password("Officer@2026")
        cursor.execute("""
        INSERT INTO users (user_id, name, email, mobile, password_hash, role, badge_id, station, created_at)
        VALUES ('OFF-USER-001', 'Insp. Devendra Singh', 'cyber.officer@rajasthan.gov.in', '+91 9876500001', ?, 'officer', 'RJ-CYBER-8842', 'State Cyber Police Station, Jaipur HQ', datetime('now'))
        """, (officer_pwd,))

    # 3. Seed Sample Citizen Submissions for CIT-USER-001
    cursor.execute("SELECT COUNT(*) FROM citizen_submissions;")
    count = cursor.fetchone()[0]
    if count == 0:
        sample_subs = [
            {
                "id": "CIT-20261122-001",
                "type": "Message",
                "content": "Dear Consumer, your electricity will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at +91 9876500001 or pay at http://jvvnl-bijli-update.online.",
                "risk_score": 95,
                "risk_level": "HIGH",
                "indicators": [
                    {"name": "Urgent Coercion Trigger", "score": 30, "reason": "Immediate service disconnection deadline to induce panic."},
                    {"name": "Impersonation of Discom", "score": 35, "reason": "Pretending to be JVVNL power corporation official."},
                    {"name": "Phishing Link & Personal Mobile", "score": 30, "reason": "Directing victim to unverified .online link and 10-digit mobile."}
                ],
                "entities": {"phones": ["9876500001"], "urls": ["http://jvvnl-bijli-update.online"], "upis": []},
                "recommendation": "DO NOT pay or call the number. Verify pending electricity bills exclusively on the official Rajasthan government portal.",
                "status": "Under Review",
                "notes": "Assigned to Jaipur Cyber Unit for Telco CDR subpoena under Section 91 CrPC."
            },
            {
                "id": "CIT-20261122-002",
                "type": "URL",
                "content": "http://sbi-kyc-verify.cc/login",
                "risk_score": 100,
                "risk_level": "HIGH",
                "indicators": [
                    {"name": "Banking Typosquatting", "score": 40, "reason": "Domain impersonates State Bank of India netbanking."},
                    {"name": "High-Risk Ephemeral TLD (.cc)", "score": 30, "reason": "TLD frequently used by phishing syndicates for rapid takedown evasion."},
                    {"name": "Missing HTTPS", "score": 30, "reason": "Unencrypted communication used to harvest banking credentials."}
                ],
                "entities": {"domains": ["sbi-kyc-verify.cc"], "urls": ["http://sbi-kyc-verify.cc/login"]},
                "recommendation": "CRITICAL PHISHING LINK: Never enter passwords, usernames, or OTPs on this portal.",
                "status": "Analysed",
                "notes": "Domain flagged on state-wide threat heat list."
            },
            {
                "id": "CIT-20261121-003",
                "type": "Website",
                "content": "Daman Win Club: India's No. 1 Color Prediction Game! Predict Red or Green and double your money in 30 seconds! Recharge your wallet now: Min deposit Rs 500. Direct UPI recharge to: damanpay@okaxis.",
                "risk_score": 85,
                "risk_level": "HIGH",
                "indicators": [
                    {"name": "Illegal Gambling Operation", "score": 45, "reason": "Color prediction betting platform prohibited under Rajasthan Public Gambling laws."},
                    {"name": "Mule UPI Endpoint", "score": 40, "reason": "Rotational UPI handle used for money laundering."}
                ],
                "entities": {"upis": ["damanpay@okaxis"], "urls": ["http://damanwin-club.online"]},
                "recommendation": "Illegal gambling and financial fraud trap. Cease all transactions.",
                "status": "Under Review",
                "notes": "Lien directive issued to Axis Bank nodal officer."
            },
            {
                "id": "CIT-20261120-004",
                "type": "Message",
                "content": "Dear Customer, INR 2,500.00 debited from your HDFC Bank A/c ending 4589 on 20-NOV-26 to SWIGGY. Available Bal: INR 34,120.00. If not done by you, call official toll-free 18002026161.",
                "risk_score": 10,
                "risk_level": "LOW",
                "indicators": [],
                "entities": {"phones": ["18002026161"]},
                "recommendation": "Legitimate banking transaction confirmation notification. No action required.",
                "status": "Closed",
                "notes": "Verified authentic transactional alert from authorized banking SMS header."
            }
        ]

        for s in sample_subs:
            cursor.execute("""
            INSERT INTO citizen_submissions (
                submission_id, citizen_id, citizen_name, citizen_mobile,
                submission_type, submitted_content, risk_score, risk_level,
                indicators_json, extracted_entities_json, recommendation,
                status, officer_notes, created_at
            ) VALUES (?, 'CIT-USER-001', 'Rajesh Sharma', '+91 9876543210', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 day'))
            """, (
                s["id"], s["type"], s["content"], s["risk_score"], s["risk_level"],
                json.dumps(s["indicators"]), json.dumps(s["entities"]), s["recommendation"],
                s["status"], s.get("notes", "")
            ))

    conn.commit()
    conn.close()

def register_user(name: str, email: str, mobile: str, password: str, role: str = "citizen") -> Dict[str, Any]:
    """Registers a new citizen with input validation and duplicate prevention."""
    from backend.auth import hash_password
    clean_email = email.strip().lower()
    clean_name = name.strip()
    clean_mobile = mobile.strip()

    if not clean_email or "@" not in clean_email:
        raise ValueError("Please provide a valid email address.")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    if not clean_name:
        raise ValueError("Full name is required.")

    # Strictly enforce that public registration cannot grant 'officer' role
    assigned_role = "citizen" if role.lower() != "officer" else "citizen"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?;", (clean_email,))
    if cursor.fetchone():
        conn.close()
        raise ValueError(f"An account with email '{clean_email}' already exists. Please log in.")

    user_id = f"CIT-USER-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    pwd_hash = hash_password(password)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO users (user_id, name, email, mobile, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, clean_name, clean_email, clean_mobile, pwd_hash, assigned_role, now))

    conn.commit()
    conn.close()

    return {
        "user_id": user_id,
        "name": clean_name,
        "email": clean_email,
        "mobile": clean_mobile,
        "role": assigned_role
    }

def authenticate_user(email: str, password: str, role: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Validates user credentials and role for session issuance."""
    from backend.auth import verify_password
    clean_email = email.strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT user_id, name, email, mobile, password_hash, role, badge_id, station
    FROM users WHERE email = ?;
    """, (clean_email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    if not verify_password(password, row["password_hash"]):
        return None

    # If specific role requested, verify it matches
    if role and row["role"].lower() != role.lower():
        return None

    return {
        "user_id": row["user_id"],
        "name": row["name"],
        "email": row["email"],
        "mobile": row["mobile"],
        "role": row["role"],
        "badge_id": row["badge_id"],
        "station": row["station"]
    }

def save_citizen_submission(
    citizen_id: str,
    citizen_name: str,
    citizen_mobile: str,
    submission_type: str,
    submitted_content: str,
    risk_score: int,
    risk_level: str,
    indicators: List[Dict[str, Any]],
    extracted_entities: Dict[str, List[str]],
    recommendation: str,
    evidence_filename: Optional[str] = None
) -> str:
    """Saves a citizen fraud submission and indexes extracted identifiers."""
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hash_val = hashlib.sha256(f"{citizen_id}_{submitted_content}_{now}".encode('utf-8')).hexdigest()[:6].upper()
    sub_id = f"CIT-{datetime.now().strftime('%Y%m%d')}-{hash_val}"

    cursor.execute("""
    INSERT INTO citizen_submissions (
        submission_id, citizen_id, citizen_name, citizen_mobile,
        submission_type, submitted_content, evidence_filename,
        risk_score, risk_level, indicators_json, extracted_entities_json,
        recommendation, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)
    """, (
        sub_id, citizen_id, citizen_name, citizen_mobile,
        submission_type, submitted_content, evidence_filename,
        risk_score, risk_level, json.dumps(indicators),
        json.dumps(extracted_entities), recommendation, now
    ))

    # Index extracted entities into global identifiers table for syndicate cross-correlation
    for entity_type, values in extracted_entities.items():
        if isinstance(values, list):
            for val in set(values):
                clean_val = str(val).strip().lower()
                if clean_val:
                    cursor.execute("""
                    INSERT INTO identifiers (case_id, entity_type, entity_value, created_at)
                    VALUES (?, ?, ?, ?)
                    """, (sub_id, entity_type, clean_val, now))

    conn.commit()
    conn.close()
    return sub_id

def get_citizen_submissions(
    citizen_id: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Fetches citizen submissions with strict citizen scoping or officer oversight."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM citizen_submissions WHERE 1=1"
    params = []

    if citizen_id:
        query += " AND citizen_id = ?"
        params.append(citizen_id)

    if status and status.upper() != "ALL":
        query += " AND status = ?"
        params.append(status)

    if risk_level and risk_level.upper() != "ALL":
        query += " AND risk_level = ?"
        params.append(risk_level.upper())

    if search:
        clean_s = f"%{search.strip().lower()}%"
        query += " AND (submission_id LIKE ? OR submitted_content LIKE ? OR citizen_name LIKE ?)"
        params.extend([clean_s, clean_s, clean_s])

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    results = []

    for r in rows:
        d = dict(r)
        d["indicators"] = json.loads(d["indicators_json"])
        d["extracted_entities"] = json.loads(d["extracted_entities_json"])
        results.append(d)

    conn.close()
    return results

def get_citizen_submission_by_id(submission_id: str, citizen_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieves a single citizen submission, ensuring citizen cannot access other users' data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if citizen_id:
        cursor.execute("SELECT * FROM citizen_submissions WHERE submission_id = ? AND citizen_id = ?;", (submission_id, citizen_id))
    else:
        cursor.execute("SELECT * FROM citizen_submissions WHERE submission_id = ?;", (submission_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    d = dict(row)
    d["indicators"] = json.loads(d["indicators_json"])
    d["extracted_entities"] = json.loads(d["extracted_entities_json"])
    return d

def update_citizen_submission_status(submission_id: str, new_status: str, officer_notes: str = "") -> bool:
    """Officers update the investigation status and append review notes."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE citizen_submissions
    SET status = ?, officer_notes = ?
    WHERE submission_id = ?
    """, (new_status, officer_notes, submission_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def convert_submission_to_case(submission_id: str, officer_name: str) -> Optional[str]:
    """Escalates a citizen submission into an official Rajasthan Police Case Dossier."""
    sub = get_citizen_submission_by_id(submission_id)
    if not sub:
        return None

    case_id = save_case(
        source_type=f"Citizen Report ({sub['submission_type']})",
        full_input=f"Citizen Complainant: {sub['citizen_name']} ({sub['citizen_mobile']})\nSubmission Ref: {submission_id}\n\nContent:\n{sub['submitted_content']}",
        risk_score=sub["risk_score"],
        risk_level=sub["risk_level"],
        indicators=sub["indicators"],
        recommendation=sub["recommendation"],
        extracted_entities=sub["extracted_entities"],
        title=f"FIR Requisition from Citizen Report: {sub['submission_type']}"
    )

    # Link back to citizen submission and mark status
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE citizen_submissions
    SET converted_case_id = ?, status = 'Under Review',
        officer_notes = COALESCE(officer_notes || ' | ', '') || 'Escalated to formal Case FIR ' || ? || ' by ' || ?
    WHERE submission_id = ?
    """, (case_id, case_id, officer_name, submission_id))
    conn.commit()
    conn.close()

    return case_id

def get_citizen_dashboard_stats(citizen_id: str) -> Dict[str, Any]:
    """Computes personal statistics and triage status breakdown for the logged-in citizen."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM citizen_submissions WHERE citizen_id = ?;", (citizen_id,))
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_submissions WHERE citizen_id = ? AND status = 'Under Review';", (citizen_id,))
    under_review = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_submissions WHERE citizen_id = ? AND status = 'Analysed';", (citizen_id,))
    analysed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_submissions WHERE citizen_id = ? AND status = 'Closed';", (citizen_id,))
    closed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM citizen_submissions WHERE citizen_id = ? AND risk_level = 'HIGH';", (citizen_id,))
    high_threats = cursor.fetchone()[0]

    cursor.execute("""
    SELECT submission_id, submission_type, submitted_content, risk_level, risk_score, status, created_at
    FROM citizen_submissions
    WHERE citizen_id = ?
    ORDER BY id DESC LIMIT 5;
    """, (citizen_id,))
    recent = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "total_reports": total,
        "under_review": under_review,
        "analysed": analysed,
        "closed": closed,
        "high_threats_flagged": high_threats,
        "recent_submissions": recent
    }
