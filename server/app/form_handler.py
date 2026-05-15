import json
import urllib.error
import urllib.request
from typing import Any, Optional, Tuple

from .config import settings


def _count_needs_replacement(items: list[dict[str, Any]]) -> int:
    n = 0
    for it in items or []:
        checklist = it.get("checklist") or {}
        for c in checklist.values():
            if isinstance(c, dict) and c.get("grade") == "Needs Replacement":
                n += 1
    return n


def _items_summary(items: list[dict[str, Any]]) -> str:
    parts = []
    for it in items or []:
        bits = [
            it.get("equipmentType"),
            it.get("brand"),
            it.get("model"),
        ]
        label = " ".join(b for b in bits if b)
        if label:
            parts.append(label)
    return "; ".join(parts)


def notify_new_report(
    report_id: int,
    created_by: Optional[str],
    submitted_at: str,
    payload: dict[str, Any],
) -> Tuple[bool, Optional[str]]:
    """POST a flat "new report" notification to the configured webhook.

    Errors do not raise; callers persist the submission regardless so
    nothing is lost if the webhook is down.
    """
    url = settings.form_handler_url
    if not url:
        return False, "FORM_HANDLER_URL not configured"

    base = settings.app_base_url.rstrip("/")
    link = f"{base}/?report={report_id}" if base else ""

    items = payload.get("items") or []
    needs_replacement = _count_needs_replacement(items)

    body = json.dumps(
        {
            "Event": "report.created",
            "Report ID": str(report_id),
            "Created By": created_by or "",
            "Created At": submitted_at or "",
            "Job Number": payload.get("jobNumber") or "",
            "Client Name": payload.get("clientName") or "",
            "Site Address": payload.get("siteAddress") or "",
            "Service Date": payload.get("date") or "",
            "Technician": payload.get("technicianName") or "",
            "Equipment": _items_summary(items),
            "Item Count": str(len(items)),
            "Needs Replacement": str(needs_replacement),
            "Issues Found": payload.get("issuesFound") or "",
            "Parts Replaced": payload.get("partsReplaced") or "",
            "Recommendations": payload.get("recommendations") or "",
            "View Report": link,
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
