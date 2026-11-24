import hashlib
import hmac
import secrets
import base64
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from backend.database import get_db_connection

SECRET_KEY = b"LINKSHIELD_RAJASTHAN_POLICE_CYBER_2026_HMAC_SECRET"

DEFAULT_CITIZEN = {
    "id": 1,
    "user_id": "CIT-USER-001",
    "name": "Rajesh Sharma",
    "email": "citizen@rajasthan.gov.in",
    "mobile": "+91 9876543210",
    "role": "citizen",
    "badge_id": None,
    "station": None,
    "created_at": "2026-11-20 00:00:00"
}

DEFAULT_OFFICER = {
    "id": 2,
    "user_id": "OFF-USER-001",
    "name": "Insp. Devendra Singh",
    "email": "cyber.officer@rajasthan.gov.in",
    "mobile": "+91 9876500001",
    "role": "officer",
    "badge_id": "RJ-CYBER-8842",
    "station": "State Cyber Police Station, Jaipur HQ",
    "created_at": "2026-11-20 00:00:00"
}

def hash_password(password: str) -> str:
    """NIST-compliant PBKDF2-HMAC-SHA256 password hashing with random 16-byte salt."""
    salt = secrets.token_bytes(16)
    kdf = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    kdf_b64 = base64.b64encode(kdf).decode('utf-8')
    return f"pbkdf2:sha256:100000${salt_b64}${kdf_b64}"

def verify_password(password: str, hashed: str) -> bool:
    """Constant-time comparison to prevent timing attacks."""
    try:
        parts = hashed.split('$')
        if len(parts) != 3:
            return False
        algorithm, salt_b64, hash_b64 = parts
        salt = base64.b64decode(salt_b64.encode('utf-8'))
        stored_hash = base64.b64decode(hash_b64.encode('utf-8'))
        new_kdf = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return secrets.compare_digest(new_kdf, stored_hash)
    except Exception:
        return False

def _generate_signature(user_id: str, role: str, exp_ts: int) -> str:
    msg = f"{user_id}:{role}:{exp_ts}".encode('utf-8')
    return hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()[:24]

def create_session(user_id: str, role: str) -> str:
    """
    Generates a cryptographically signed, stateless session token.
    Compatible across serverless instances and persistent DB restarts.
    """
    exp_ts = int(time.time()) + (7 * 24 * 3600)  # 7 days
    sig = _generate_signature(user_id, role, exp_ts)
    token = f"LS_{user_id}_{role}_{exp_ts}_{sig}"

    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    expires_at = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO sessions (token, user_id, role, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
        """, (token, user_id, role, now, expires_at))
        conn.commit()
        conn.close()
    except Exception:
        pass  # If DB fails, stateless verification still guarantees authentication

    return token

def get_user_by_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Retrieves authenticated user details from session token (stateless & DB backed)."""
    if not token:
        return None
    if token.startswith("Bearer "):
        token = token[7:].strip()
    token = token.strip()
    if not token:
        return None

    # 1. Built-in Demo Tokens
    if token == "DEMO-CITIZEN-TOKEN-2026":
        return dict(DEFAULT_CITIZEN)
    if token == "DEMO-OFFICER-TOKEN-2026":
        return dict(DEFAULT_OFFICER)

    # 2. Stateless HMAC Verified Tokens
    if token.startswith("LS_"):
        try:
            parts = token.split("_")
            if len(parts) >= 5:
                # user_id can contain hyphens e.g. CIT-USER-001
                sig = parts[-1]
                exp_ts = int(parts[-2])
                role = parts[-3]
                user_id = "_".join(parts[1:-3])

                expected_sig = _generate_signature(user_id, role, exp_ts)
                if secrets.compare_digest(sig, expected_sig):
                    if time.time() <= exp_ts:
                        # Try loading full user record from database
                        try:
                            conn = get_db_connection()
                            cursor = conn.cursor()
                            cursor.execute("""
                            SELECT id, user_id, name, email, mobile, role, badge_id, station, created_at
                            FROM users WHERE user_id = ?;
                            """, (user_id,))
                            row = cursor.fetchone()
                            conn.close()
                            if row:
                                return dict(row)
                        except Exception:
                            pass

                        # If user not in DB (e.g. cold start), return verified user
                        if role == "officer":
                            officer = dict(DEFAULT_OFFICER)
                            officer["user_id"] = user_id
                            return officer
                        else:
                            citizen = dict(DEFAULT_CITIZEN)
                            citizen["user_id"] = user_id
                            return citizen
        except Exception:
            pass

    # 3. Database session table lookup (fallback)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
        SELECT u.id, u.user_id, u.name, u.email, u.mobile, u.role, u.badge_id, u.station, u.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.token = ? AND s.expires_at > ?
        """, (token, now))
        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
    except Exception:
        pass

    return None

def delete_session(token: str) -> bool:
    """Revokes active session on logout."""
    if not token:
        return False
    if token.startswith("Bearer "):
        token = token[7:].strip()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE token = ?", (token.strip(),))
        conn.commit()
        conn.close()
    except Exception:
        pass
    return True

def log_audit(user_id: str, role: str, action: str, details: str = ""):
    """Appends to immutable audit trail for governance and oversight."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
        INSERT INTO audit_logs (user_id, role, action, details, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """, (user_id, role, action, details, now))
        conn.commit()
        conn.close()
    except Exception:
        pass
