import json
import urllib.error
import urllib.request
from typing import Optional, Tuple

from .config import settings


def notify_new_report(
    report_id: int,
    created_by: Optional[str],
    submitted_at: str,
    job_number: Optional[str] = None,
    client_name: Optional[str] = None,
) -> Tuple[bool, Optional[str]]:
    """POST a simple "new report" notification to the configured webhook.

    Payload is intentionally tiny — just who/when and a link back to view
    the full report in the app. Errors do not raise; callers persist the
    submission regardless so nothing is lost if the webhook is down.
    """
    url = settings.form_handler_url
    if not url:
        return False, "FORM_HANDLER_URL not configured"

    base = settings.app_base_url.rstrip("/")
    link = f"{base}/?report={report_id}" if base else None

    body = json.dumps(
        {
            "event": "report.created",
            "report_id": report_id,
            "created_by": created_by,
            "created_at": submitted_at,
            "job_number": job_number,
            "client_name": client_name,
            "link": link,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "User-Agent": "gymstallations-server"},
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if 200 <= resp.status < 300:
                return True, None
            return False, f"HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        return False, f"HTTPError {exc.code}: {exc.reason}"
    except urllib.error.URLError as exc:
        return False, f"URLError: {exc.reason}"
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"
