import os
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = "/tmp/linkedshield.db" if os.environ.get("VERCEL") else "linkedshield.db"

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

    # Seed default settings
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('low_threshold', '24');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('med_threshold', '49');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('agency_name', 'Rajasthan Police Cyber Crime Division');")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('auto_archive_days', '90');")

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
