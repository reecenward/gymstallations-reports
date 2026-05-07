# Gymstallations Reports — repo guide for Claude

This repo is a small full-stack app. You may be running locally for development
or on the production Linux server to deploy it. **Detect which one before
acting** by checking for `/srv/gymstallations` — if that path exists and matches
the current repo, you're on the deploy server.

## Stack

- **Frontend**: React + Vite + Tailwind + shadcn/ui (in `src/`). Builds to `dist/`.
- **Backend**: FastAPI + SQLite + JWT + SMTP (in `server/`). Runs as `uvicorn app.main:app`.
- **Hosting**: single Linux box. Caddy reverse-proxies `/api/*` to uvicorn on
  127.0.0.1:8000 and serves `dist/` as the SPA root.

## Deploy contract

The server is laid out exactly like this — assume nothing else:

- App root: `/srv/gymstallations` (this repo, owned by user `gymstall`)
- Backend venv: `/srv/gymstallations/server/.venv`
- Backend env: `/srv/gymstallations/server/.env` (already populated by the
  human; do not overwrite)
- SQLite DB: `/srv/gymstallations/server/data/app.db` (NEVER delete)
- Frontend build output: `/srv/gymstallations/dist`
- systemd unit: `gymstallations.service`
- Reverse proxy: `caddy` reading `/etc/caddy/Caddyfile`

## Slash commands

- `/setup` — first-time install on a fresh server. Use only when the server
  has never run this app.
- `/deploy` — pull latest, rebuild, restart. Use for every update.

If the user just says "deploy" without a slash, run `/deploy`.

## Hard rules

1. **Never delete or overwrite `app.db`**. If you think you need to, stop and
   ask the human first.
2. **Never overwrite `server/.env`**. It contains secrets the human set up
   manually. If a value looks wrong, surface it and ask.
3. **Never run destructive git commands** (`reset --hard`, `clean -fd`,
   `push --force`) without explicit permission.
4. **Always run as the `gymstall` user** when on the server (use `sudo -u
   gymstall` if you started as root). The systemd unit runs as `gymstall` and
   file ownership matters.
5. **Do not write code changes from the deploy server.** If a deploy fails
   because of a bug, report the bug and stop — fixes happen in development,
   commit + push from there, then re-run `/deploy`.
6. After any deploy, verify with: `curl -sf https://<domain>/api/health`
   returns `{"status":"ok"}` and the systemd unit is `active (running)`.

## Local development (not the deploy server)

```bash
# backend
cd server && python3 -m venv .venv && source .venv/bin/activate && pip install -e .
cp .env.example .env   # only if missing
uvicorn app.main:app --reload

# frontend (separate terminal)
npm install
npm run dev
```
