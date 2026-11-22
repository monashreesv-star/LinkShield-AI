import re
import urllib.parse
from typing import Dict, List, Any, Tuple

# Pre-compiled regex patterns for Indian cyber fraud investigations
REGEX_PHONE = re.compile(r'(?:\+?91[\-\s]?)?[6789]\d{9}\b')
REGEX_UPI = re.compile(r'\b[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}\b')
REGEX_URL = re.compile(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*', re.IGNORECASE)
REGEX_IFSC = re.compile(r'\b[A-Z]{4}0[A-Z0-9]{6}\b')
REGEX_CRYPTO_BTC = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
REGEX_CRYPTO_ETH = re.compile(r'\b0x[a-fA-F0-9]{40}\b')
REGEX_CRYPTO_TRON = re.compile(r'\bT[A-Za-z1-9]{33}\b')

# Known legitimate entities for lookalike comparison
OFFICIAL_DOMAINS = {
    "sbi": "onlinesbi.sbi",
    "hdfc": "hdfcbank.com",
    "icici": "icicibank.com",
    "pnb": "pnbindia.in",
    "jvvnl": "energy.rajasthan.gov.in",
    "avvnl": "energy.rajasthan.gov.in",
    "bijli": "energy.rajasthan.gov.in",
    "incometax": "incometax.gov.in",
    "indiapost": "indiapost.gov.in",
    "paytm": "paytm.com",
    "phonepe": "phonepe.com",
    "gpay": "pay.google.com"
}

SUSPICIOUS_TLDS = {
    "xyz", "top", "cc", "online", "site", "club", "buzz", "vip", "pw", 
    "icu", "work", "loan", "win", "bid", "rest", "bar", "live", "link"
}

KNOWN_BLACKLISTED_DOMAINS = {
    "jvvnl-bijli-update.online", "sbi-kyc-verify.cc", "rupeeloan-fast.top",
    "speedpost-customs-clear.xyz", "lottery-rbi-winner.site", "royalwealth-vip.top"
}

# Suspicious keyword dictionaries
URGENCY_KEYWORDS = [
    "disconnected", "cutoff", "block", "deactivate", "suspended", "expire",
    "immediate", "urgently", "legal action", "police", "fir", "arrest", 
    "warrant", "penalty", "last warning", "tonight at", "within 24 hours"
]

KYC_KEYWORDS = [
    "kyc", "pan card", "aadhaar", "update details", "verify details",
    "account blocked", "sim blocked", "unblock account", "submit pan",
    "kyc suspended", "link pan"
]

IMPERSONATION_TARGETS = [
    "sbi", "hdfc", "icici", "pnb", "axis bank", "jvvnl", "avvnl", "jdvvnl",
    "bijli", "electricity", "india post", "income tax", "rbi", "cyber cell"
]

PONZI_KEYWORDS = [
    "guaranteed return", "guaranteed profit", "double your money", "daily return",
    "weekly return", "30% return", "50% return", "100% safe", "vip investment",
    "invite friends", "referral bonus", "mlm", "team income", "daily withdrawal"
]

BETTING_KEYWORDS = [
    "color prediction", "colour prediction", "teen patti", "dragon tiger",
    "aviator", "casino", "roulette", "online betting", "win cash instantly",
    "recharge and earn", "game withdrawal"
]

DANGEROUS_PERMISSIONS = {
    "android.permission.READ_CONTACTS": ("Steals contact list for extortion and family harassment", 30),
    "android.permission.READ_SMS": ("Intercepts incoming OTPs and private bank SMS", 30),
    "android.permission.SEND_SMS": ("Sends background SMS for premium rate billing / malware spread", 25),
    "android.permission.CAMERA": ("Secretly captures photos/videos for blackmail", 20),
    "android.permission.RECORD_AUDIO": ("Records ambient audio/calls", 20),
    "android.permission.ACCESS_FINE_LOCATION": ("Tracks exact GPS coordinates", 15),
    "android.permission.WRITE_EXTERNAL_STORAGE": ("Scans private photos and gallery for extortion", 20)
}

def extract_identifiers(text: str) -> Dict[str, List[str]]:
    """Extracts actionable cyber forensic identifiers from any unstructured text."""
    phones = list(set(REGEX_PHONE.findall(text)))
    upis = list(set(REGEX_UPI.findall(text)))
    urls = list(set(REGEX_URL.findall(text)))
    ifscs = list(set(REGEX_IFSC.findall(text)))
    
    # Filter crypto
    crypto = []
    crypto.extend(REGEX_CRYPTO_BTC.findall(text))
    crypto.extend(REGEX_CRYPTO_ETH.findall(text))
    crypto.extend(REGEX_CRYPTO_TRON.findall(text))
    crypto = list(set(crypto))

    domains = []
    for u in urls:
        try:
            parsed = urllib.parse.urlparse(u)
            if parsed.netloc:
                domains.append(parsed.netloc.lower())
        except Exception:
            pass
    domains = list(set(domains))

    return {
        "phone": phones,
        "upi": upis,
        "url": urls,
        "domain": domains,
        "ifsc": ifscs,
        "crypto": crypto
    }

def analyze_url_heuristics(url_str: str) -> Tuple[int, List[Dict[str, Any]]]:
    """Inspects a URL for typosquatting, suspicious TLDs, missing SSL, and blacklist matches."""
    score = 0
    indicators = []

    try:
        parsed = urllib.parse.urlparse(url_str)
        hostname = (parsed.netloc or "").lower()
        scheme = parsed.scheme.lower()
    except Exception:
        return 10, [{"name": "Malformed URL", "score": 10, "reason": "URL could not be parsed."}]

    # Insecure HTTP
    if scheme == "http":
        score += 15
        indicators.append({
            "name": "Missing HTTPS / Insecure Connection",
            "score": 15,
            "reason": f"URL '{url_str}' uses plain HTTP without cryptographic encryption."
        })

    # Blacklist check
    for bl in KNOWN_BLACKLISTED_DOMAINS:
        if bl in hostname:
            score += 40
            indicators.append({
                "name": "Known Phishing Domain Match",
                "score": 40,
                "reason": f"Domain '{hostname}' is on the reported cyber threat registry."
            })

    # Suspicious TLD check
    parts = hostname.split(".")
    if len(parts) >= 2:
        tld = parts[-1]
        if tld in SUSPICIOUS_TLDS:
            score += 20
            indicators.append({
                "name": f"Suspicious / Cheap TLD (.{tld})",
                "score": 20,
                "reason": f"TLD '.{tld}' is heavily exploited by ephemeral phishing campaigns."
            })

    # Typosquatting & Lookalike Check
    for brand, legit in OFFICIAL_DOMAINS.items():
        if brand in hostname and legit not in hostname:
            score += 25
            indicators.append({
                "name": f"Lookalike Domain / Brand Impersonation ({brand.upper()})",
                "score": 25,
                "reason": f"Host '{hostname}' mimics official {brand.upper()} ({legit})."
            })

    # IP address as hostname
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
        score += 25
        indicators.append({
            "name": "Direct IP Address URL",
            "score": 25,
            "reason": f"URL directs to naked IP '{hostname}' instead of registered domain name."
        })

    return score, indicators

def analyze_message(text: str) -> Dict[str, Any]:
    """Analyzes an SMS, WhatsApp, Telegram, or Email message."""
    text_lower = text.lower()
    score = 0
    indicators = []

    # 1. Check Urgency / Threats
    urgent_matches = [w for w in URGENCY_KEYWORDS if w in text_lower]
    if urgent_matches:
        pts = 20 if len(urgent_matches) == 1 else 25
        score += pts
        indicators.append({
            "name": "Urgent Threat / Fear Coercion",
            "score": pts,
            "reason": f"Detected high-pressure phrasing: {', '.join(urgent_matches[:4])}."
        })

    # 2. Check Fake KYC
    kyc_matches = [w for w in KYC_KEYWORDS if w in text_lower]
    if kyc_matches:
        pts = 20
        score += pts
        indicators.append({
            "name": "Fake KYC / Verification Lure",
            "score": pts,
            "reason": f"Unsolicited request to update sensitive credentials ({', '.join(kyc_matches[:3])})."
        })

    # 3. Check Impersonation
    impersonations = [t for t in IMPERSONATION_TARGETS if t in text_lower]
    if impersonations:
        pts = 20
        score += pts
        indicators.append({
            "name": f"Institutional Impersonation ({', '.join([i.upper() for i in impersonations[:2]])})",
            "score": pts,
            "reason": "Claims to represent official financial or state infrastructure."
        })

    # 4. Extract and analyze embedded URLs
    extracted = extract_identifiers(text)
    for u in extracted["url"]:
        u_score, u_indicators = analyze_url_heuristics(u)
        score += u_score
        indicators.extend(u_indicators)

    # 5. Check presence of personal mobile for official complaints
    if impersonations and extracted["phone"]:
        score += 15
        indicators.append({
            "name": "Personal Phone Masked as Official Helpline",
            "score": 15,
            "reason": f"Directs victim to private mobile number {extracted['phone'][0]}."
        })

    # Calculate final risk level
    total_score = min(score, 100)
    risk_level = "HIGH" if total_score >= 50 else ("MEDIUM" if total_score >= 25 else "LOW")

    # Generate citizen advisory
    if risk_level == "HIGH":
        recommendation = "CRITICAL ALERT: High probability of cyber fraud. DO NOT click links, call the numbers, or share OTP/credentials. Block the sender."
    elif risk_level == "MEDIUM":
        recommendation = "CAUTION: Message contains suspicious urgency or unverified domains. Verify independently on official state/bank portals."
    else:
        recommendation = "Low Risk: No malicious patterns detected. Maintain standard cyber hygiene."

    return {
        "risk_score": total_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendation": recommendation,
        "extracted_entities": extracted
    }

def analyze_website_content(content_text: str, url: str = "") -> Dict[str, Any]:
    """Analyzes text scraped or pasted from fraudulent investment, betting, or loan websites."""
    text_lower = content_text.lower()
    score = 0
    indicators = []

    # 1. URL analysis if provided
    if url:
        u_score, u_ind = analyze_url_heuristics(url)
        score += u_score
        indicators.extend(u_ind)

    # 2. Ponzi & Guaranteed ROI checks
    ponzi_matches = [w for w in PONZI_KEYWORDS if w in text_lower]
    if ponzi_matches:
        pts = 30
        score += pts
        indicators.append({
            "name": "Guaranteed Unrealistic ROI / Ponzi Lure",
            "score": pts,
            "reason": f"Promises unrealistic or guaranteed returns: {', '.join(ponzi_matches[:3])}."
        })

    # 3. Betting & Color Prediction indicators
    betting_matches = [w for w in BETTING_KEYWORDS if w in text_lower]
    if betting_matches:
        pts = 25
        score += pts
        indicators.append({
            "name": "Illegal Gambling & Betting Indicators",
            "score": pts,
            "reason": f"Contains illegal casino/prediction game triggers: {', '.join(betting_matches[:3])}."
        })

    # 4. Extract Financial Identifiers (UPI, Crypto, Phone)
    extracted = extract_identifiers(content_text)
    if extracted["upi"]:
        score += 20
        indicators.append({
            "name": "Unregulated Peer-to-Peer UPI Ingestion",
            "score": 20,
            "reason": f"Diverts user investments directly to personal UPI VPAs: {', '.join(extracted['upi'][:3])}."
        })

    if extracted["crypto"]:
        score += 15
        indicators.append({
            "name": "Cryptocurrency Payment Gateways",
            "score": 15,
            "reason": "Accepts untraceable cryptocurrency payments (USDT/BTC)."
        })

    total_score = min(score, 100)
    risk_level = "HIGH" if total_score >= 50 else ("MEDIUM" if total_score >= 25 else "LOW")

    if risk_level == "HIGH":
        recommendation = "FRAUDULENT PLATFORM: Highly indicative of Ponzi/MLM or illegal gambling ring. Advise freezing associated UPI VPAs."
    elif risk_level == "MEDIUM":
        recommendation = "SUSPICIOUS PLATFORM: High risk financial claims. Check SEBI / RBI registration before transferring capital."
    else:
        recommendation = "Low Risk: No high-yield scam indicators detected."

    return {
        "risk_score": total_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendation": recommendation,
        "extracted_entities": extracted
    }

def analyze_apk_metadata(package_name: str, app_name: str, permissions: List[str], embedded_urls: List[str] = None) -> Dict[str, Any]:
    """Performs static security audit on Android APK manifest permissions and embedded strings."""
    score = 0
    indicators = []
    dangerous_found = []

    for perm in permissions:
        clean_perm = perm.strip()
        for d_perm, (reason, pts) in DANGEROUS_PERMISSIONS.items():
            if d_perm.lower() in clean_perm.lower():
                score += pts
                dangerous_found.append((clean_perm, reason, pts))

    if dangerous_found:
        indicators.append({
            "name": f"Dangerous Invasive Permissions ({len(dangerous_found)} Detected)",
            "score": min(score, 50),
            "reason": f"Requests sensitive device privileges: {', '.join([d[0].split('.')[-1] for d in dangerous_found[:4]])}."
        })

    # Check for predatory loan app signature
    perm_names = " ".join(permissions).lower()
    is_loan_app = any(k in (package_name + " " + app_name).lower() for k in ["loan", "credit", "cash", "rupee", "paisa", "finance"])
    has_contact_sms = "contact" in perm_names and "sms" in perm_names

    if is_loan_app and has_contact_sms:
        score += 35
        indicators.append({
            "name": "Predatory Loan Blackmail Signature",
            "score": 35,
            "reason": "Loan calculator app requests SMS and Contact access for contact-harvesting & extortion."
        })

    # Inspect embedded URLs
    extracted_urls = embedded_urls or []
    for u in extracted_urls:
        u_score, u_ind = analyze_url_heuristics(u)
        score += u_score
        indicators.extend(u_ind)

    total_score = min(score, 100)
    risk_level = "HIGH" if total_score >= 50 else ("MEDIUM" if total_score >= 25 else "LOW")

    if risk_level == "HIGH":
        recommendation = "MALICIOUS APK: Do not install. Known spyware / predatory extortion vector. Immediate blacklist required."
    elif risk_level == "MEDIUM":
        recommendation = "SUSPICIOUS APK: Excessive permissions requested beyond application scope."
    else:
        recommendation = "Low Risk: Standard non-invasive permission set."

    return {
        "risk_score": total_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "recommendation": recommendation,
        "extracted_entities": {
            "url": extracted_urls,
            "permission": [d[0] for d in dangerous_found]
        }
    }
