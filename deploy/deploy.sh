#!/usr/bin/env bash
# Deploy / update Gymstallations on the server.
# Run as the gymstall user from /srv/gymstallations:
#   ./deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/gymstallations}"
cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> backend deps"
cd "$APP_DIR/server"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
./.venv/bin/pip install --upgrade pip >/dev/null
./.venv/bin/pip install -e . >/dev/null

echo "==> frontend build"
cd "$APP_DIR"
npm ci --no-audit --no-fund
npm run build

echo "==> restart api"
sudo systemctl restart gymstallations.service
sudo systemctl status gymstallations.service --no-pager --lines=3

echo "==> reload caddy"
sudo systemctl reload caddy

echo "Deployed."
