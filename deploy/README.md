# Deploying Gymstallations to your own Linux server

Single box, single domain. React static files + FastAPI behind Caddy. SQLite
on disk. Anything Debian/Ubuntu/Rocky-flavored with systemd works.

## Easy mode: let Claude Code do it

If you have an Anthropic API key, the fastest path is to run Claude Code on
the server and use the slash commands shipped in this repo.

```bash
# On the server, as a sudoer:
curl -fsSL https://claude.ai/install.sh | bash    # installs the `claude` CLI
sudo apt install -y git
sudo mkdir -p /srv/gymstallations
sudo chown $USER /srv/gymstallations
git clone https://github.com/reecenward/gymstallations-reports.git /srv/gymstallations
cd /srv/gymstallations

claude                  # launch Claude Code
```

Then in the Claude prompt:

- First time on this server: `/setup` — it walks you through everything below
  interactively, asking only for your domain and pausing while you fill in
  `server/.env`.
- Every update after that: `/deploy` — pulls latest, rebuilds, restarts.

The slash commands and pre-approved permissions are checked into
[.claude/](../.claude/) so they Just Work. You can still do everything by hand
using the steps below if you'd rather.

## What you need before starting

- A Linux server you can SSH into as a sudoer.
- A domain (or subdomain) with an A record pointing at the server's IP.
- Ports 80 and 443 open on the firewall.
- SMTP credentials (Gmail app password, SendGrid, Postmark, Mailgun — anything
  speaking SMTP on 587 with STARTTLS).

## One-time server setup

SSH to the server and run:

```bash
# 1. Install runtimes
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git curl

# Node 20 (for `npm run build`)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Caddy (auto HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# 2. App user + directory
sudo useradd --system --create-home --home-dir /srv/gymstallations \
    --shell /bin/bash gymstall
sudo mkdir -p /srv/gymstallations
sudo chown gymstall:gymstall /srv/gymstallations

# 3. Clone the repo as the app user
sudo -u gymstall git clone https://github.com/reecenward/gymstallations-reports.git /srv/gymstallations
```

## Configure the app

```bash
# 4. Backend env
sudo -u gymstall cp /srv/gymstallations/server/.env.example \
                   /srv/gymstallations/server/.env
sudo -u gymstall nano /srv/gymstallations/server/.env
```

Set at minimum:

- `JWT_SECRET=` → generate with `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
- `SMTP_HOST=`, `SMTP_PORT=587`, `SMTP_USER=`, `SMTP_PASS=`, `SMTP_FROM=`
- `REPORT_RECIPIENT=` → the inbox that should receive submitted reports
- `CORS_ORIGINS=https://yourdomain.com` (no trailing slash)
- `DB_PATH=/srv/gymstallations/server/data/app.db` (default works)

## First build + boot

```bash
# 5. Build everything once (the deploy.sh script does this for updates)
sudo -u gymstall bash -lc 'cd /srv/gymstallations/server && \
    python3 -m venv .venv && \
    ./.venv/bin/pip install --upgrade pip && \
    ./.venv/bin/pip install -e .'

sudo -u gymstall bash -lc 'cd /srv/gymstallations/frontend && \
    npm ci && npm run build'

# 6. Install the systemd unit
sudo cp /srv/gymstallations/deploy/gymstallations.service \
        /etc/systemd/system/gymstallations.service
sudo systemctl daemon-reload
sudo systemctl enable --now gymstallations.service
sudo systemctl status gymstallations.service --no-pager

# 7. Caddy: edit yourdomain.com → your real domain, then install
sudo cp /srv/gymstallations/deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile     # change yourdomain.com
sudo systemctl reload caddy
sudo mkdir -p /var/log/caddy && sudo chown caddy:caddy /var/log/caddy
```

Point your DNS A record at the server, wait a minute, and visit
`https://yourdomain.com`. Caddy will fetch a Let's Encrypt cert automatically
on first request.

## Sudoless deploys (recommended)

Let the `gymstall` user restart its own service without a password prompt.
Run once as root:

```bash
sudo tee /etc/sudoers.d/gymstall-deploy >/dev/null <<'EOF'
gymstall ALL=(root) NOPASSWD: /bin/systemctl restart gymstallations.service, /bin/systemctl reload caddy, /bin/systemctl status gymstallations.service
EOF
sudo chmod 440 /etc/sudoers.d/gymstall-deploy
```

## Updating the app

After this, deploys are one command:

```bash
sudo -u gymstall /srv/gymstallations/deploy/deploy.sh
```

That pulls latest, rebuilds frontend, reinstalls Python deps, restarts the
API, reloads Caddy.

## Backups

Everything important is in two places:

- `/srv/gymstallations/server/data/app.db` — users + reports
- `/srv/gymstallations/server/.env` — secrets

Daily cron, copy off-box:

```bash
sudo crontab -e
```

```
0 3 * * * sqlite3 /srv/gymstallations/server/data/app.db ".backup '/srv/gymstallations/backups/app-$(date +\%F).db'" && find /srv/gymstallations/backups -name 'app-*.db' -mtime +30 -delete
```

(Create `/srv/gymstallations/backups` first, owned by `gymstall`.)

## Troubleshooting

- API not responding: `sudo journalctl -u gymstallations.service -n 100 --no-pager`
- Caddy / TLS issues: `sudo journalctl -u caddy -n 100 --no-pager`
- Frontend looks stale: did `npm run build` succeed? Check `/srv/gymstallations/frontend/dist/` mtime.
- 502 from `/api/*`: API isn't bound on `127.0.0.1:8000` — `sudo ss -ltnp | grep 8000`.
- Email keeps `email_status=failed`: check `app.db` for `email_error`, then verify SMTP creds with `swaks --to you@example.com --server $SMTP_HOST:587 --auth LOGIN --auth-user $SMTP_USER --auth-password $SMTP_PASS -tls`.

## Switching off Vercel (if the React app is currently there)

Nothing to migrate from Vercel — the frontend is just static files built from
this repo. Once `https://yourdomain.com` serves the React app from the server,
remove the Vercel project (or repoint its DNS) and you're done.
