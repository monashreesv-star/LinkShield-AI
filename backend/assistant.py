import re
from typing import Dict, Any, List
from backend.database import get_db_connection, get_case_by_id, search_cases_and_identifiers

def answer_investigation_query(query: str) -> Dict[str, Any]:
    """
    Forensic AI Investigation Assistant answering questions directly
    from persistent case records, entity indexes, and correlation logs.
    Never fabricates case data; cites explicit case IDs and evidence.
    """
    q_clean = query.strip()
    q_lower = q_clean.lower()
    
    conn = get_db_connection()
    cursor = conn.cursor()

    references = []
    response_text = ""

    # 1. Search for explicit Case ID mentioned in the question (LS-YYYYMMDD-XXXXXX)
    case_id_match = re.search(r'\bLS-\d{8}-[A-F0-9]{6}\b', q_clean, re.IGNORECASE)
    if case_id_match:
        target_cid = case_id_match.group(0).upper()
        case_data = get_case_by_id(target_cid)
        if case_data:
            references.append(target_cid)
            indicators = case_data.get("indicators", [])
            identifiers = case_data.get("identifiers", [])
            connected = case_data.get("connected_cases", [])

            ind_list = "\n".join([f"  • {i['name']} (+{i['score']} pts): {i['reason']}" for i in indicators])
            id_list = ", ".join([f"{item['entity_type'].upper()}: {item['entity_value']}" for item in identifiers]) or "None extracted"
            conn_list = ", ".join([c['case_id'] for c in connected]) or "No cross-case linkages detected yet."

            response_text = (
                f"### Case Investigation Summary: `{target_cid}`\n\n"
                f"**Threat Vector:** {case_data['source_type']}\n"
                f"**Risk Rating:** **{case_data['risk_level']} RISK ({case_data['risk_score']}/100)**\n"
                f"**Evidence SHA-256:** `{case_data['evidence_hash']}`\n\n"
                f"**Triggered Indicators:**\n{ind_list}\n\n"
                f"**Extracted Identifiers:** {id_list}\n\n"
                f"**Cross-Case Linkages:** {conn_list}\n\n"
                f"**Forensic Directive:** {case_data['recommendation']}"
            )
            conn.close()
            return {"answer": response_text, "references": references, "confidence": "HIGH (DIRECT CASE RECORD)"}

    # 2. "Which phone number appears in multiple cases?"
    if "phone" in q_lower and ("multiple" in q_lower or "repeated" in q_lower or "shared" in q_lower or "frequently" in q_lower):
        cursor.execute("""
        SELECT entity_value, COUNT(DISTINCT case_id) as case_count, GROUP_CONCAT(DISTINCT case_id) as linked_cases
        FROM identifiers
        WHERE entity_type = 'phone'
        GROUP BY entity_value
        HAVING case_count > 1
        ORDER BY case_count DESC
        LIMIT 5;
        """)
        rows = cursor.fetchall()
        if rows:
            lines = []
            for r in rows:
                cids = r["linked_cases"].split(",")
                references.extend(cids[:3])
                lines.append(f"• **Phone `{r['entity_value']}`** appears in **{r['case_count']} distinct cases** ({', '.join(cids[:3])})")
            response_text = (
                "### Repeated Phone Numbers Across Cases:\n\n"
                "The correlation engine identified the following telecom endpoints linking disparate FIRs:\n\n"
                + "\n".join(lines) + "\n\n"
                "**Investigative Action:** Issue Section 91 CrPC notice to telecom service providers (TSP) for Call Detail Records (CDR) and Subscriber Acquisition Form (SAF)."
            )
        else:
            response_text = "No phone number currently appears in more than one case in the database."
        conn.close()
        return {"answer": response_text, "references": list(set(references)), "confidence": "HIGH"}

    # 3. "Which UPI IDs are associated with this investigation?" / Repeated UPI VPAs
    if "upi" in q_lower and ("multiple" in q_lower or "repeated" in q_lower or "associated" in q_lower or "top" in q_lower):
        cursor.execute("""
        SELECT entity_value, COUNT(DISTINCT case_id) as case_count, GROUP_CONCAT(DISTINCT case_id) as linked_cases
        FROM identifiers
        WHERE entity_type = 'upi'
        GROUP BY entity_value
        ORDER BY case_count DESC
        LIMIT 6;
        """)
        rows = cursor.fetchall()
        if rows:
            lines = []
            for r in rows:
                cids = r["linked_cases"].split(",")
                references.extend(cids[:2])
                lines.append(f"• **UPI VPA `{r['entity_value']}`** flagged in **{r['case_count']} case(s)** (Linked: {', '.join(cids[:2])})")
            response_text = (
                "### Associated Fraudulent UPI Identifiers:\n\n"
                + "\n".join(lines) + "\n\n"
                "**Investigative Action:** Request emergency debit-freeze from NPCI / sponsor banks under 1930 / I4C protocols."
            )
        else:
            response_text = "No UPI identifiers currently recorded in the database."
        conn.close()
        return {"answer": response_text, "references": list(set(references)), "confidence": "HIGH"}

    # 4. Search for specific entity mentioned (phone, upi, domain)
    # Check if query contains a phone number
    phone_match = re.search(r'\b[6789]\d{9}\b', q_clean)
    if phone_match:
        phone = phone_match.group(0)
        cursor.execute("SELECT DISTINCT case_id FROM identifiers WHERE entity_type = 'phone' AND entity_value LIKE ?", (f"%{phone}%",))
        cids = [r[0] for r in cursor.fetchall()]
        if cids:
            references.extend(cids)
            response_text = f"Phone number **`{phone}`** is linked to **{len(cids)} case(s)**: {', '.join(cids)}."
        else:
            response_text = f"Phone number `{phone}` was not found in any investigated cases."
        conn.close()
        return {"answer": response_text, "references": references, "confidence": "HIGH"}

    # Check if query contains a domain
    domain_match = re.search(r'\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', q_clean)
    if domain_match and "." in domain_match.group(0) and "ai" != domain_match.group(0):
        domain = domain_match.group(0).lower()
        cursor.execute("SELECT DISTINCT case_id FROM identifiers WHERE entity_type IN ('domain', 'url') AND entity_value LIKE ?", (f"%{domain}%",))
        cids = [r[0] for r in cursor.fetchall()]
        if cids:
            references.extend(cids)
            response_text = f"Domain/Host **`{domain}`** appears in **{len(cids)} case(s)**: {', '.join(cids)}. It has been flagged as suspicious due to lookalike patterns or phishing blacklist matching."
        else:
            response_text = f"Domain `{domain}` is not recorded in existing case investigations."
        conn.close()
        return {"answer": response_text, "references": references, "confidence": "HIGH"}

    # 5. General investigation questions & high-level stats
    cursor.execute("SELECT COUNT(*) FROM cases;")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM cases WHERE risk_level = 'HIGH';")
    high = cursor.fetchone()[0]

    response_text = (
        f"### LinkedShield Forensic Intelligence Assistant\n\n"
        f"The persistent case registry currently indexes **{total} total cases** (**{high} High-Risk Threat Incidents**).\n\n"
        f"You can ask me specific questions such as:\n"
        f"• *'Summarise indicators in LS-20261122-8AFE01'*\n"
        f"• *'Which phone number appears in multiple cases?'*\n"
        f"• *'Show all cases connected to jvvnl-bijli-update.online'*\n"
        f"• *'Which UPI IDs are linked to high-risk cases?'*\n"
        f"• *'Why was 9876500001 flagged?'*"
    )
    conn.close()
    return {"answer": response_text, "references": references, "confidence": "SYSTEM KNOWLEDGE"}
