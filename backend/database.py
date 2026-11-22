import sqlite3
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = "linkedshield.db"

def get_db_connection():
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
        input_preview TEXT NOT NULL,
        full_input TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        indicators_json TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        raw_metadata_json TEXT NOT NULL,
        evidence_hash TEXT NOT NULL
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

    # Create indexes for rapid search
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_identifiers_val ON identifiers(entity_value);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_identifiers_type ON identifiers(entity_type);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_risk ON cases(risk_level);")

    conn.commit()
    conn.close()

def save_case(
    source_type: str,
    full_input: str,
    risk_score: int,
    risk_level: str,
    indicators: List[Dict[str, Any]],
    recommendation: str,
    extracted_entities: Dict[str, List[str]],
    raw_metadata: Optional[Dict[str, Any]] = None
) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hash_obj = hashlib.sha256(f"{full_input}_{timestamp}".encode("utf-8"))
    evidence_hash = hash_obj.hexdigest()
    case_id = f"LS-{datetime.now().strftime('%Y%m%d')}-{evidence_hash[:6].upper()}"

    input_preview = full_input[:120] + ("..." if len(full_input) > 120 else "")

    cursor.execute("""
    INSERT INTO cases (
        case_id, created_at, source_type, input_preview, full_input,
        risk_score, risk_level, indicators_json, recommendation,
        raw_metadata_json, evidence_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        timestamp,
        source_type,
        input_preview,
        full_input,
        risk_score,
        risk_level,
        json.dumps(indicators),
        recommendation,
        json.dumps(raw_metadata or {}),
        evidence_hash
    ))

    # Insert extracted entities
    for entity_type, values in extracted_entities.items():
        for val in set(values):
            clean_val = val.strip().lower()
            if clean_val:
                cursor.execute("""
                INSERT INTO identifiers (case_id, entity_type, entity_value, created_at)
                VALUES (?, ?, ?, ?)
                """, (case_id, entity_type, clean_val, timestamp))

    conn.commit()
    conn.close()
    return case_id

def get_all_cases(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases ORDER BY id DESC LIMIT ?", (limit,))
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

    conn.close()
    return d

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
    ORDER BY c.id DESC
    """, (f"%{query_clean}%",))
    matched_identifiers = [dict(r) for r in cursor.fetchall()]

    # Search in cases
    cursor.execute("""
    SELECT * FROM cases
    WHERE full_input LIKE ? OR case_id LIKE ? OR indicators_json LIKE ?
    ORDER BY id DESC LIMIT 20
    """, (f"%{query_clean}%", f"%{query_clean}%", f"%{query_clean}%"))
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

def get_heat_list(limit: int = 10) -> Dict[str, List[Dict[str, Any]]]:
    """Returns top reported domains, phones, and UPI accounts across all cases."""
    conn = get_db_connection()
    cursor = conn.cursor()

    categories = ["phone", "upi", "domain", "bank_account"]
    heat_list = {}

    for cat in categories:
        cursor.execute("""
        SELECT entity_value, COUNT(DISTINCT case_id) as case_count
        FROM identifiers
        WHERE entity_type = ?
        GROUP BY entity_value
        ORDER BY case_count DESC
        LIMIT ?
        """, (cat, limit))
        heat_list[cat] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return heat_list

def get_relationship_graph() -> Dict[str, Any]:
    """Builds a node-edge graph linking cases with shared identifiers."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT case_id, risk_level, source_type, risk_score FROM cases ORDER BY id DESC LIMIT 30")
    cases = cursor.fetchall()

    cursor.execute("""
    SELECT entity_type, entity_value, case_id
    FROM identifiers
    WHERE case_id IN (SELECT case_id FROM cases ORDER BY id DESC LIMIT 30)
    """)
    links = cursor.fetchall()

    nodes = []
    edges = []
    seen_nodes = set()

    for c in cases:
        cid = c["case_id"]
        seen_nodes.add(cid)
        nodes.append({
            "id": cid,
            "label": cid,
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
        # Only highlight if shared across cases OR high value
        node_id = data["id"]
        nodes.append({
            "id": node_id,
            "label": data["label"],
            "type": data["type"],
            "case_count": len(data["cases"])
        })
        for cid in data["cases"]:
            edges.append({
                "from": cid,
                "to": node_id,
                "type": data["type"]
            })

    conn.close()
    return {"nodes": nodes, "edges": edges}

def seed_sample_data():
    """Populates realistic demo cases if database is empty."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases;")
    count = cursor.fetchone()[0]
    conn.close()

    if count > 0:
        return

    # Seed Case 1: Electricity Cutoff Scam
    save_case(
        source_type="Message (SMS)",
        full_input="Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at 9876543210 or update bill at http://jvvnl-bijli-update.online. Urgently pay pending Rs. 450.",
        risk_score=85,
        risk_level="HIGH",
        indicators=[
            {"name": "Urgent Threat & Disconnection Language", "score": 25, "reason": "Threatens electricity cutoff tonight at 9:30 PM to trigger panic."},
            {"name": "Lookalike Utility Domain (JVVNL)", "score": 25, "reason": "Impersonates Jaipur Vidyut Vitran Nigam with suspicious TLD .online."},
            {"name": "Unverified Contact Officer", "score": 15, "reason": "Provides personal mobile number 9876543210 instead of official discom IVR."},
            {"name": "Missing HTTPS / Insecure Link", "score": 20, "reason": "Uses plain unencrypted HTTP protocol."}
        ],
        recommendation="DO NOT call the number or pay. Discoms never disconnect power via personal SMS. Verify at energy.rajasthan.gov.in.",
        extracted_entities={
            "phone": ["9876543210"],
            "domain": ["jvvnl-bijli-update.online"],
            "upi": ["jvvnlpower@okaxis"]
        }
    )

    # Seed Case 2: Fake High-Return Ponzi Website
    save_case(
        source_type="Website",
        full_input="Welcome to RoyalGrow Wealth! Invest Rs. 5000 today and get guaranteed 35% weekly returns! Invite 5 friends to unlock VIP Level 3 bonus. Transfer funds directly to UPI ID: royalwealth@ybl or support WhatsApp +91 9876543210.",
        risk_score=90,
        risk_level="HIGH",
        indicators=[
            {"name": "Guaranteed Unrealistic ROI Claim", "score": 25, "reason": "Claims 35% weekly return, mathematically characteristic of Ponzi fraud."},
            {"name": "Multi-Level Referral Lure (MLM)", "score": 20, "reason": "Encourages member recruitment chain to sustain payout scheme."},
            {"name": "Direct Unregulated UPI Ingestion", "score": 25, "reason": "Directs investment capital to personal VPA royalwealth@ybl."},
            {"name": "Shared Phone Number (Linked to Case 1)", "score": 20, "reason": "Reuses phone number 9876543210 identified in electricity scam!"}
        ],
        recommendation="High risk Ponzi / illegal deposit scheme. Warn public and freeze receiving UPI VPA.",
        extracted_entities={
            "phone": ["9876543210"],
            "upi": ["royalwealth@ybl", "jvvnlpower@okaxis"],
            "domain": ["royalgrow-vip.top"]
        }
    )

    # Seed Case 3: Fake Instant Loan APK
    save_case(
        source_type="Android APK",
        full_input="App: RupeeQuick Express Loan (com.fastcash.rupeeloan). Discovered downloading from suspicious link: http://download.rupeeloan.cc/app.apk. Requests invasive permissions.",
        risk_score=95,
        risk_level="HIGH",
        indicators=[
            {"name": "Excessive Sensitive Permissions", "score": 30, "reason": "Requests READ_CONTACTS, READ_SMS, and CAMERA for a simple loan calculator."},
            {"name": "Predatory Loan Extortion Profile", "score": 25, "reason": "Permissions indicate contact harvesting for harassment & extortion."},
            {"name": "Non-PlayStore Hosting (.cc TLD)", "score": 20, "reason": "Distributed via unverified domain download.rupeeloan.cc."},
            {"name": "Embedded Suspicious Backend C2 IP", "score": 20, "reason": "Hardcoded communications to offshore server 194.26.29.112."}
        ],
        recommendation="CRITICAL THREAT: Immediately uninstall. Do not grant permissions. Block APK SHA-256 hash across police registries.",
        extracted_entities={
            "phone": ["9123456789"],
            "domain": ["download.rupeeloan.cc"],
            "upi": ["fastcashloan@paytm"]
        }
    )

    # Seed Case 4: Genuine Bank Transaction Alert (Low Risk Baseline)
    save_case(
        source_type="Message (SMS)",
        full_input="Dear Customer, INR 2,500.00 debited from your HDFC Bank A/c ending 4589 on 22-NOV-26 to SWIGGY. Available Bal: INR 34,120.00. If not done by you, call 18002026161.",
        risk_score=10,
        risk_level="LOW",
        indicators=[
            {"name": "Standard Banking Transaction Format", "score": 5, "reason": "Matches official Reserve Bank of India mandated transaction debit template."},
            {"name": "Official Toll-Free Number", "score": 5, "reason": "Uses verified HDFC Bank customer care toll-free helpline 18002026161."}
        ],
        recommendation="Legitimate transaction alert. No suspicious markers or phishing links detected.",
        extracted_entities={
            "phone": ["18002026161"]
        }
    )
