# Gymstallations Server

FastAPI + SQLite backend for the Gymstallations report generator. Handles
technician auth, persists submitted reports, and emails an HTML summary
with the raw JSON attached.

## Run

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -e .

cp .env.example .env
# edit .env — at minimum set JWT_SECRET and SMTP_* / REPORT_RECIPIENT

uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

The SQLite file is created on first run at `DB_PATH` (default `./data/app.db`).

## Endpoints

- `POST /auth/register` — `{email, password, full_name}`
- `POST /auth/login` — `{email, password}` → `{access_token, user}`
- `GET  /auth/me` — current user (Bearer token)
- `POST /reports` — submit a report; persists to SQLite and emails the recipient
- `GET  /reports` — list current user's reports
- `GET  /reports/{id}` — full payload for one report

## Email

Uses `smtplib` with `STARTTLS`. Tested with Gmail (app password) and SendGrid SMTP.
If sending fails, the report is still saved with `email_status='failed'` so the
UI can show it and a "resend" can be added later.
