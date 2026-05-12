import json
import urllib.error
import urllib.request
from typing import Optional, Tuple

from .config import settings


def forward_report(payload: dict, technician_email: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """POST the report payload to the configured form-handler webhook.

    Returns (ok, error_message). Errors do not raise — callers persist the
    submission regardless so nothing is lost if the webhook is down.
    """
    url = settings.form_handler_url
    if not url:
        return False, "FORM_HANDLER_URL not configured"

    body = json.dumps({"technician_email": technician_email, "report": payload}).encode("utf-8")
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
