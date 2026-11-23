import hashlib
import secrets
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from backend.database import get_db_connection

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

def create_session(user_id: str, role: str) -> str:
    """Generates a secure cryptographic session token with 7-day expiration."""
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    expires_at = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sessions (token, user_id, role, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
    """, (token, user_id, role, now, expires_at))
    conn.commit()
    conn.close()
    return token

def get_user_by_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Retrieves authenticated user details from active session token."""
    if not token:
        return None
    if token.startswith("Bearer "):
        token = token[7:].strip()
    token = token.strip()
    if not token:
        return None

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
    return None

def delete_session(token: str) -> bool:
    """Revokes active session on logout."""
    if not token:
        return False
    if token.startswith("Bearer "):
        token = token[7:].strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token.strip(),))
    conn.commit()
    conn.close()
    return True

def log_audit(user_id: str, role: str, action: str, details: str = ""):
    """Appends to immutable audit trail for governance and oversight."""
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO audit_logs (user_id, role, action, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, role, action, details, now))
    conn.commit()
    conn.close()
