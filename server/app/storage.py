"""Local "object storage" for photos uploaded with reports.

Photos arrive from the browser as base64 `data:` URLs embedded in the
report JSON. Storing megabytes of base64 inside SQLite cells works but
makes the DB huge and slow to read. Instead we strip every data URL out
of the payload before persisting, write the bytes to
`data/uploads/{report_id}/{uuid}.{ext}`, and replace the field with a
`/uploads/...` URL that the SPA can request directly.

The function is idempotent: fields that are already plain URLs (e.g.
during an admin edit where most photos weren't touched) pass through
unchanged.
"""

from __future__ import annotations

import base64
import os
import re
import uuid
from pathlib import Path
from typing import Optional

from .config import settings

DATA_DIR = Path(os.path.dirname(os.path.abspath(settings.db_path)))
UPLOADS_DIR = DATA_DIR / "uploads"

_DATA_URL_RE = re.compile(r"^data:image/(?P<ext>[a-zA-Z0-9+.-]+);base64,(?P<b64>.+)$", re.DOTALL)

_EXT_FIX = {"jpeg": "jpg", "svg+xml": "svg"}


def _ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def _maybe_save(value: Optional[str], report_dir: Path, url_prefix: str) -> Optional[str]:
    """If value is a data URL, write it to disk and return its public URL.
    Otherwise return it unchanged (covers None, empty strings, and previously
    persisted URLs from earlier edits)."""
    if not isinstance(value, str) or not value:
        return value
    m = _DATA_URL_RE.match(value)
    if not m:
        return value
    ext = m.group("ext").lower()
    ext = _EXT_FIX.get(ext, ext)
    try:
        blob = base64.b64decode(m.group("b64"), validate=False)
    except Exception:
        return value
    _ensure_dir(report_dir)
    name = f"{uuid.uuid4().hex}.{ext}"
    (report_dir / name).write_bytes(blob)
    return f"{url_prefix}/{name}"


def persist_photos(report_id: int, payload: dict) -> dict:
    """Walk the report payload and replace every embedded data URL with a
    stored-file URL. Returns the rewritten payload — the caller is
    responsible for writing it back to `payload_json`."""
    report_dir = UPLOADS_DIR / str(report_id)
    url_prefix = f"/uploads/{report_id}"

    items = payload.get("items") or []
    new_items = []
    for it in items:
        if not isinstance(it, dict):
            new_items.append(it)
            continue
        it = dict(it)
        it["distancePhoto"] = _maybe_save(it.get("distancePhoto"), report_dir, url_prefix)
        it["serialPhoto"] = _maybe_save(it.get("serialPhoto"), report_dir, url_prefix)

        checklist = it.get("checklist") or {}
        new_checklist = {}
        for key, cell in checklist.items():
            if isinstance(cell, dict) and cell.get("photo"):
                cell = dict(cell)
                cell["photo"] = _maybe_save(cell.get("photo"), report_dir, url_prefix)
            new_checklist[key] = cell
        it["checklist"] = new_checklist

        issue_photos = it.get("issuePhotos") or []
        it["issuePhotos"] = [
            _maybe_save(p, report_dir, url_prefix) if isinstance(p, str) else p
            for p in issue_photos
        ]
        new_items.append(it)
    payload = dict(payload)
    payload["items"] = new_items
    return payload
