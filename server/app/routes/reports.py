import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import connect
from ..form_handler import notify_new_report
from ..models import (
    ReportDetail,
    ReportSubmission,
    ReportSummary,
    ReportUpdate,
    SubmitReportResponse,
)
from ..security import get_current_user
from ..storage import persist_photos

router = APIRouter(prefix="/reports", tags=["reports"])


VALID_REVIEW_STATES = {"pending", "reviewed", "sent_to_client"}


def _normalize_payload(payload: dict) -> dict:
    """Ensure payload has an `items` list. If legacy single-equipment fields
    are present, wrap them into a 1-item array so the rest of the app can
    assume the new shape without a DB migration."""
    if isinstance(payload.get("items"), list) and payload["items"]:
        return payload
    legacy_keys = (
        "equipmentType",
        "brand",
        "model",
        "serialNumber",
        "assetId",
        "location",
        "manufacturingDate",
        "installDate",
        "hoursOnUnit",
        "ageYears",
        "serialPhoto",
        "checklist",
    )
    if any(payload.get(k) for k in legacy_keys):
        item = {k: payload.get(k) for k in legacy_keys if payload.get(k) is not None}
        item.setdefault("checklist", payload.get("checklist") or {})
        payload = {**payload, "items": [item]}
    else:
        payload = {**payload, "items": []}
    return payload


def _primary_item(payload: dict) -> dict:
    items = payload.get("items") or []
    return items[0] if items else {}


def _count_needs_replacement(payload: dict) -> int:
    n = 0
    for it in payload.get("items") or []:
        checklist = it.get("checklist") or {}
        for c in checklist.values():
            if isinstance(c, dict) and c.get("grade") == "Needs Replacement":
                n += 1
    return n


@router.post("", response_model=SubmitReportResponse)
def submit_report(body: ReportSubmission, current=Depends(get_current_user)):
    payload = _normalize_payload(body.model_dump())
    primary = _primary_item(payload)

    # Insert first so we have a report_id to namespace photo files under,
    # then strip embedded base64 photos out to disk and overwrite the row
    # with the URL-only version. The original (with base64) is still
    # forwarded to the webhook so downstream services don't change.
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO reports (user_id, job_number, client_name, site_address,
                                 equipment_type, payload_json, email_status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
            """,
            (
                current["id"],
                body.jobNumber,
                body.clientName or None,
                body.siteAddress or None,
                primary.get("equipmentType") or None,
                "{}",
            ),
        )
        conn.commit()
        report_id = cur.lastrowid

        stored = persist_photos(report_id, payload)
        conn.execute(
            "UPDATE reports SET payload_json = ? WHERE id = ?",
            (json.dumps(stored), report_id),
        )
        conn.commit()

        row = conn.execute(
            "SELECT submitted_at FROM reports WHERE id = ?", (report_id,)
        ).fetchone()

    ok, err = notify_new_report(
        report_id=report_id,
        created_by=current["email"],
        submitted_at=row["submitted_at"],
        payload=stored,
    )
    new_status = "sent" if ok else "failed"

    with connect() as conn:
        conn.execute(
            "UPDATE reports SET email_status = ?, email_error = ? WHERE id = ?",
            (new_status, err, report_id),
        )
        conn.commit()

    return SubmitReportResponse(
        id=report_id,
        submitted_at=row["submitted_at"],
        email_status=new_status,
        email_error=err,
    )


_SUMMARY_COLUMNS = """
    r.id, r.job_number, r.client_name, r.equipment_type,
    r.submitted_at, r.email_status, r.payload_json,
    r.review_status, r.reviewed_at,
    u.email AS created_by_email, u.full_name AS created_by_name,
    ru.email AS reviewed_by_email
"""

_FROM_REPORTS = """
    FROM reports r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN users ru ON ru.id = r.reviewed_by
"""


def _row_to_summary(r) -> ReportSummary:
    brand = None
    model = None
    equipment_type = r["equipment_type"]
    needs_replacement = 0
    item_count = 0
    if r["payload_json"]:
        try:
            payload = _normalize_payload(json.loads(r["payload_json"]))
            primary = _primary_item(payload)
            brand = primary.get("brand") or None
            model = primary.get("model") or None
            equipment_type = primary.get("equipmentType") or equipment_type
            item_count = len(payload.get("items") or [])
            needs_replacement = _count_needs_replacement(payload)
        except (json.JSONDecodeError, AttributeError):
            pass
    return ReportSummary(
        id=r["id"],
        job_number=r["job_number"],
        client_name=r["client_name"],
        equipment_type=equipment_type,
        submitted_at=r["submitted_at"],
        email_status=r["email_status"],
        brand=brand,
        model=model,
        item_count=item_count,
        needs_replacement_count=needs_replacement,
        created_by_email=r["created_by_email"],
        created_by_name=r["created_by_name"],
        review_status=r["review_status"] or "pending",
        reviewed_by_email=r["reviewed_by_email"],
        reviewed_at=r["reviewed_at"],
    )


@router.get("", response_model=list[ReportSummary])
def list_reports(current=Depends(get_current_user)):
    is_admin = bool(current.get("is_admin"))
    with connect() as conn:
        if is_admin:
            rows = conn.execute(
                f"SELECT {_SUMMARY_COLUMNS} {_FROM_REPORTS} ORDER BY r.id DESC"
            ).fetchall()
        else:
            rows = conn.execute(
                f"SELECT {_SUMMARY_COLUMNS} {_FROM_REPORTS} WHERE r.user_id = ? ORDER BY r.id DESC",
                (current["id"],),
            ).fetchall()
    return [_row_to_summary(r) for r in rows]


def _fetch_report_row(conn, report_id: int, user_id: int, is_admin: bool):
    if is_admin:
        return conn.execute(
            f"SELECT {_SUMMARY_COLUMNS}, r.email_error {_FROM_REPORTS} WHERE r.id = ?",
            (report_id,),
        ).fetchone()
    return conn.execute(
        f"SELECT {_SUMMARY_COLUMNS}, r.email_error {_FROM_REPORTS} WHERE r.id = ? AND r.user_id = ?",
        (report_id, user_id),
    ).fetchone()


def _row_to_detail(row) -> ReportDetail:
    summary = _row_to_summary(row)
    payload = _normalize_payload(json.loads(row["payload_json"])) if row["payload_json"] else {}
    return ReportDetail(
        **summary.model_dump(),
        payload=payload,
        email_error=row["email_error"],
    )


@router.get("/{report_id}", response_model=ReportDetail)
def get_report(report_id: int, current=Depends(get_current_user)):
    with connect() as conn:
        row = _fetch_report_row(conn, report_id, current["id"], bool(current.get("is_admin")))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return _row_to_detail(row)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: int, current=Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    with connect() as conn:
        cur = conn.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Report not found")
    # Best-effort cleanup of uploaded photos for this report.
    import shutil
    from ..storage import UPLOADS_DIR
    try:
        shutil.rmtree(UPLOADS_DIR / str(report_id), ignore_errors=True)
    except Exception:
        pass
    return None


@router.patch("/{report_id}", response_model=ReportDetail)
def update_report(report_id: int, body: ReportUpdate, current=Depends(get_current_user)):
    if not current.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    if body.review_status is not None and body.review_status not in VALID_REVIEW_STATES:
        raise HTTPException(status_code=400, detail="Invalid review_status")

    with connect() as conn:
        existing = conn.execute(
            "SELECT payload_json, review_status FROM reports WHERE id = ?",
            (report_id,),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Report not found")

        sets = []
        args = []
        if body.payload is not None:
            payload = _normalize_payload(body.payload)
            # Persist any newly-attached base64 photos to disk. Fields that
            # are already URL strings pass through unchanged.
            payload = persist_photos(report_id, payload)
            primary = _primary_item(payload)
            sets.append("payload_json = ?")
            args.append(json.dumps(payload))
            sets.append("client_name = ?")
            args.append(payload.get("clientName") or None)
            sets.append("site_address = ?")
            args.append(payload.get("siteAddress") or None)
            sets.append("equipment_type = ?")
            args.append(primary.get("equipmentType") or None)
            sets.append("job_number = ?")
            args.append(payload.get("jobNumber") or "")

        if body.review_status is not None and body.review_status != existing["review_status"]:
            sets.append("review_status = ?")
            args.append(body.review_status)
            sets.append("reviewed_by = ?")
            args.append(current["id"])
            sets.append("reviewed_at = ?")
            args.append(datetime.now(timezone.utc).isoformat(timespec="seconds"))

        if sets:
            args.append(report_id)
            conn.execute(f"UPDATE reports SET {', '.join(sets)} WHERE id = ?", args)
            conn.commit()

        row = _fetch_report_row(conn, report_id, current["id"], True)
    return _row_to_detail(row)
