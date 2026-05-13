import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import connect
from ..models import AuthResponse, LoginRequest, RegisterRequest, UpdateUserRequest, UserOut
from ..security import (
    create_access_token,
    get_current_admin,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_to_out(row) -> UserOut:
    keys = row.keys()
    return UserOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        is_admin=bool(row["is_admin"]) if "is_admin" in keys else False,
        created_at=row["created_at"] if "created_at" in keys else None,
    )


@router.get("/users", response_model=list[UserOut])
def list_users(_admin=Depends(get_current_admin)):
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, email, full_name, is_admin, created_at FROM users ORDER BY id"
        ).fetchall()
    return [_user_to_out(r) for r in rows]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(body: RegisterRequest, _admin=Depends(get_current_admin)):
    """Admin-only: provision an account. Public registration is disabled."""
    pw_hash = hash_password(body.password)
    try:
        with connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?)",
                (body.email.lower(), pw_hash, body.full_name, 1 if body.is_admin else 0),
            )
            conn.commit()
            row = conn.execute(
                "SELECT id, email, full_name, is_admin, created_at FROM users WHERE id = ?",
                (cur.lastrowid,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    return _user_to_out(row)


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UpdateUserRequest, admin=Depends(get_current_admin)):
    updates = []
    params: list = []
    if body.is_admin is not None:
        if user_id == admin["id"] and body.is_admin is False:
            raise HTTPException(status_code=400, detail="You can't demote yourself.")
        updates.append("is_admin = ?")
        params.append(1 if body.is_admin else 0)
    if body.password is not None:
        if len(body.password) < 6:
            raise HTTPException(status_code=400, detail="Password too short")
        updates.append("password_hash = ?")
        params.append(hash_password(body.password))
    if body.full_name is not None:
        updates.append("full_name = ?")
        params.append(body.full_name)
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    params.append(user_id)
    with connect() as conn:
        cur = conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        row = conn.execute(
            "SELECT id, email, full_name, is_admin, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    return _user_to_out(row)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin=Depends(get_current_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You can't delete yourself.")
    with connect() as conn:
        cur = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    with connect() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, is_admin, created_at, password_hash FROM users WHERE email = ?",
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
        is_admin=bool(current.get("is_admin", 0)),
        created_at=current.get("created_at"),
    )
