"""Admin CLI for user management.

Run from /srv/gymstallations/server as the gymstall user:

    ./.venv/bin/python -m scripts.manage_users create <email> --admin
    ./.venv/bin/python -m scripts.manage_users list
    ./.venv/bin/python -m scripts.manage_users password <email>
    ./.venv/bin/python -m scripts.manage_users delete <email>
    ./.venv/bin/python -m scripts.manage_users promote <email>
"""
import argparse
import getpass
import sqlite3
import sys

from app.db import connect, init_db
from app.security import hash_password


def _prompt_password() -> str:
    pw = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm:  ")
    if pw != confirm:
        sys.exit("Passwords don't match.")
    if len(pw) < 6:
        sys.exit("Password must be at least 6 characters.")
    return pw


def cmd_create(args: argparse.Namespace) -> None:
    pw = args.password or _prompt_password()
    try:
        with connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?)",
                (args.email.lower(), hash_password(pw), args.name, 1 if args.admin else 0),
            )
            conn.commit()
            print(f"Created user id={cur.lastrowid} email={args.email} admin={args.admin}")
    except sqlite3.IntegrityError:
        sys.exit(f"User {args.email} already exists.")


def cmd_list(_args: argparse.Namespace) -> None:
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, email, full_name, is_admin, created_at FROM users ORDER BY id"
        ).fetchall()
    if not rows:
        print("(no users)")
        return
    for r in rows:
        flag = " [admin]" if r["is_admin"] else ""
        print(f"{r['id']:>3}  {r['email']:<40}  {r['full_name'] or '-':<25}  {r['created_at']}{flag}")


def cmd_password(args: argparse.Namespace) -> None:
    pw = args.password or _prompt_password()
    with connect() as conn:
        cur = conn.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            (hash_password(pw), args.email.lower()),
        )
        conn.commit()
    if cur.rowcount == 0:
        sys.exit(f"No user with email {args.email}.")
    print(f"Password reset for {args.email}.")


def cmd_delete(args: argparse.Namespace) -> None:
    with connect() as conn:
        cur = conn.execute("DELETE FROM users WHERE email = ?", (args.email.lower(),))
        conn.commit()
    if cur.rowcount == 0:
        sys.exit(f"No user with email {args.email}.")
    print(f"Deleted {args.email}.")


def cmd_promote(args: argparse.Namespace) -> None:
    with connect() as conn:
        cur = conn.execute(
            "UPDATE users SET is_admin = ? WHERE email = ?",
            (0 if args.demote else 1, args.email.lower()),
        )
        conn.commit()
    if cur.rowcount == 0:
        sys.exit(f"No user with email {args.email}.")
    print(f"{args.email} is now {'a regular user' if args.demote else 'an admin'}.")


def main() -> None:
    init_db()
    parser = argparse.ArgumentParser(description="Manage Gymstallations users.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_create = sub.add_parser("create", help="Create a user")
    p_create.add_argument("email")
    p_create.add_argument("--name", default=None)
    p_create.add_argument("--password", default=None, help="Skip prompt (insecure on shared shell history)")
    p_create.add_argument("--admin", action="store_true")
    p_create.set_defaults(func=cmd_create)

    p_list = sub.add_parser("list", help="List users")
    p_list.set_defaults(func=cmd_list)

    p_pw = sub.add_parser("password", help="Reset a user's password")
    p_pw.add_argument("email")
    p_pw.add_argument("--password", default=None)
    p_pw.set_defaults(func=cmd_password)

    p_del = sub.add_parser("delete", help="Delete a user")
    p_del.add_argument("email")
    p_del.set_defaults(func=cmd_delete)

    p_promo = sub.add_parser("promote", help="Make a user admin (or --demote)")
    p_promo.add_argument("email")
    p_promo.add_argument("--demote", action="store_true")
    p_promo.set_defaults(func=cmd_promote)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
