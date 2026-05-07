---
description: Pull latest, rebuild frontend, reinstall backend deps, restart the API, reload Caddy. Use this for every update after the initial /setup.
---

Update the running deployment. Assume `/setup` has already been completed —
if `/srv/gymstallations` doesn't exist or the systemd unit isn't installed,
stop and tell the user to run `/setup` first.

## Steps

1. **Pre-flight check**:
   - `[ -d /srv/gymstallations/.git ]` — repo is present
   - `systemctl is-enabled gymstallations.service` — unit is installed
   - `curl -sf http://127.0.0.1:8000/health` — current API is up (so we
     have something to compare against after the deploy)
   If any fail, stop and report.

2. **Run the deploy script** as the `gymstall` user:
   ```bash
   sudo -u gymstall /srv/gymstallations/deploy/deploy.sh
   ```
   Stream the output. The script does: `git pull` → `pip install -e .` →
   `npm ci && npm run build` → `systemctl restart gymstallations` →
   `systemctl reload caddy`.

3. **Post-deploy verification** (don't skip):
   - `systemctl is-active gymstallations.service` should print `active`.
   - `curl -sf http://127.0.0.1:8000/health` should return `{"status":"ok"}`.
   - If you know the public domain (read `/etc/caddy/Caddyfile`), also hit
     `curl -sf https://<domain>/api/health` to confirm Caddy + TLS still work.
   - `sudo journalctl -u gymstallations.service -n 20 --no-pager` — scan for
     stack traces or warnings introduced by the new code.

4. **If anything fails**, do NOT roll back automatically. Surface the failure,
   show the relevant log lines, and ask the user how to proceed. Common
   failures and what they mean:
   - `git pull` rejected → uncommitted local changes on the server. Show
     `git status` and ask before discarding.
   - `pip install` fails → new dep that didn't install. Read the traceback.
   - `npm run build` fails → the just-pulled commit has a frontend bug. The
     fix is in dev, not on the server. Tell the user.
   - systemd `Restart=always` cycling → API crashed on boot, almost always a
     code or env issue. `journalctl -u gymstallations.service -n 50`.

5. After success, summarize what changed: print the short diff with
   `cd /srv/gymstallations && git log --oneline HEAD@{1}..HEAD` so the user
   sees which commits just shipped.
