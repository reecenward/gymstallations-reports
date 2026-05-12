# Gymstallations Server

FastAPI + SQLite backend for the Gymstallations report generator. Handles
technician auth, persists submitted reports, and forwards each submission to
a configurable form-handler webhook (the webhook owns email / Slack / etc.).

## Run

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -e .

cp .env.example .env
# edit .env — at minimum set JWT_SECRET and FORM_HANDLER_URL

uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

The SQLite file is created on first run at `DB_PATH` (default `./data/app.db`).

## Endpoints

- `POST /auth/register` — `{email, password, full_name}`
- `POST /auth/login` — `{email, password}` → `{access_token, user}`
- `GET  /auth/me` — current user (Bearer token)
- `POST /reports` — submit a report; persists to SQLite and POSTs to `FORM_HANDLER_URL`
- `GET  /reports` — list current user's reports
- `GET  /reports/{id}` — full payload for one report

## Form-handler webhook

On `POST /reports` the backend sends a JSON POST to `FORM_HANDLER_URL` with:

```json
{ "technician_email": "tech@example.com", "report": { ...full payload... } }
```

If the webhook returns non-2xx (or is unreachable), the report is still saved
to SQLite with `email_status='failed'` and `email_error` populated, so nothing
is lost. The column names are kept for backwards compatibility — they now mean
"forwarded to webhook" rather than "emailed".
