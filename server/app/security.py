from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from .config import settings
from .db import connect

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=True)

ALGORITHM = "HS256"


def _to_bytes(password: str) -> bytes:
    # bcrypt only hashes the first 72 bytes; truncate to avoid ValueError
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_to_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_to_bytes(password), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    creds_err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise creds_err
        user_id = int(sub)
    except (JWTError, ValueError):
        raise creds_err

    with connect() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    if row is None:
        raise creds_err
    return dict(row)
