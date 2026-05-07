---
description: First-time deploy to this Linux server. Installs system deps, creates the app user, scaffolds the app, configures systemd + Caddy, and brings the service up.
---

You are running on a fresh Linux server (Debian/Ubuntu family). Walk the user
through one-time setup, asking the **minimum** number of questions and
running each step as a separate confirmable command. If a step has already
been done (e.g. user exists, repo cloned), detect it and skip.

## Pre-flight — gather these before starting

Ask the user **only if you can't infer them**:

1. **Domain** they want the app at (e.g. `reports.example.com`). Required.
2. **GitHub repo URL** — default `https://github.com/reecenward/gymstallations-reports.git`.
   Confirm before using.
3. **SMTP / app secrets** — do NOT collect these here. They go directly into
   `/srv/gymstallations/server/.env` after the clone. Tell the user you'll
   pause for them to fill that file.

## Steps (run sequentially, confirm before each `sudo`)

1. **Detect OS family**: `cat /etc/os-release`. If not Debian/Ubuntu, stop and
   tell the user this script targets apt-based distros — they'll need to
   adapt package install commands.

2. **Install base packages**:
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-venv python3-pip git curl ca-certificates sqlite3
   ```

3. **Install Node 20** if `node --version` is missing or below v20:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Install Caddy** if `caddy version` fails. Use the commands in
   [deploy/README.md](deploy/README.md). Don't reinvent.

5. **Create the `gymstall` system user** if `id gymstall` fails:
   ```bash
   sudo useradd --system --create-home --home-dir /srv/gymstallations --shell /bin/bash gymstall
   sudo mkdir -p /srv/gymstallations
   sudo chown gymstall:gymstall /srv/gymstallations
   ```

6. **Clone the repo** as gymstall if `/srv/gymstallations/.git` doesn't exist:
   ```bash
   sudo -u gymstall git clone <REPO_URL> /srv/gymstallations
   ```

7. **Backend env**: if `/srv/gymstallations/server/.env` doesn't exist, copy
   `.env.example` over and **STOP**. Tell the user:
   > "Edit `/srv/gymstallations/server/.env` now — set `JWT_SECRET`, all
   > `SMTP_*` vars, `REPORT_RECIPIENT`, and set `CORS_ORIGINS=https://<domain>`.
   > Reply 'done' when finished."
   Suggest generating the JWT secret with:
   `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
   Wait for the user to confirm before continuing.

8. **First build**:
   ```bash
   sudo -u gymstall bash -lc 'cd /srv/gymstallations/server && python3 -m venv .venv && ./.venv/bin/pip install --upgrade pip && ./.venv/bin/pip install -e .'
   sudo -u gymstall bash -lc 'cd /srv/gymstallations && npm ci && npm run build'
   ```

9. **systemd unit**:
   ```bash
   sudo cp /srv/gymstallations/deploy/gymstallations.service /etc/systemd/system/gymstallations.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now gymstallations.service
   sudo systemctl status gymstallations.service --no-pager --lines=5
   ```
   Confirm `active (running)` before continuing.

10. **Caddy config**: copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile`,
    then replace `yourdomain.com` with the domain from step 1 in-place
    (use `sudo sed`). Then:
    ```bash
    sudo mkdir -p /var/log/caddy && sudo chown caddy:caddy /var/log/caddy
    sudo systemctl reload caddy
    ```

11. **Sudoless deploy permissions** (so `/deploy` doesn't need passwords).
    Write `/etc/sudoers.d/gymstall-deploy` with the contents from
    [deploy/README.md](deploy/README.md). chmod 440.

12. **Verify end-to-end**:
    - DNS A record points at this server (ask the user to confirm; if not yet,
      tell them to do it now and we'll wait).
    - `curl -sf https://<domain>/api/health` returns `{"status":"ok"}`.
    - Visit `https://<domain>` in a browser, register the first account.

If any step fails, stop and surface the error — do **not** keep going hoping
it'll resolve. After success, tell the user that future updates are just
`/deploy`.
