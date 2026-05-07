import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import connect
from ..models import AuthResponse, LoginRequest, RegisterRequest, UserOut
from ..security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_to_out(row) -> UserOut:
    return UserOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        created_at=row["created_at"] if "created_at" in row.keys() else None,
    )


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    pw_hash = hash_password(body.password)
    try:
        with connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
                (body.email.lower(), pw_hash, body.full_name),
            )
            conn.commit()
            user_id = cur.lastrowid
            row = conn.execute(
                "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    token = create_access_token(user_id)
    return AuthResponse(access_token=token, user=_user_to_out(row))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    with connect() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, created_at, password_hash FROM users WHERE email = ?",
            (body.email.lower(),),
        ).fetchone()

    if row is None or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(row["id"])
    return AuthResponse(access_token=token, user=_user_to_out(row))


@router.get("/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    return UserOut(
        id=current["id"],
        email=current["email"],
        full_name=current["full_name"],
        created_at=current.get("created_at"),
    )
