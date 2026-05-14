import json

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import connect
from ..form_handler import forward_report
from ..models import ReportDetail, ReportSubmission, ReportSummary, SubmitReportResponse
from ..security import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=SubmitReportResponse)
def submit_report(body: ReportSubmission, current=Depends(get_current_user)):
    payload = body.model_dump()

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
                body.equipmentType or None,
                json.dumps(payload),
            ),
        )
        conn.commit()
        report_id = cur.lastrowid
        row = conn.execute(
            "SELECT submitted_at FROM reports WHERE id = ?", (report_id,)
        ).fetchone()

    ok, err = forward_report(payload, technician_email=current["email"])
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
    u.email AS created_by_email, u.full_name AS created_by_name
"""


def _row_to_summary(r) -> ReportSummary:
    brand = None
    model = None
    needs_replacement = 0
    if r["payload_json"]:
        try:
            payload = json.loads(r["payload_json"])
            brand = payload.get("brand") or None
            model = payload.get("model") or None
            checklist = payload.get("checklist") or {}
            needs_replacement = sum(
                1 for c in checklist.values() if isinstance(c, dict) and c.get("grade") == "Needs Replacement"
            )
        except (json.JSONDecodeError, AttributeError):
            pass
    return ReportSummary(
        id=r["id"],
        job_number=r["job_number"],
        client_name=r["client_name"],
        equipment_type=r["equipment_type"],
        submitted_at=r["submitted_at"],
        email_status=r["email_status"],
        brand=brand,
        model=model,
        needs_replacement_count=needs_replacement,
        created_by_email=r["created_by_email"],
        created_by_name=r["created_by_name"],
    )


@router.get("", response_model=list[ReportSummary])
def list_reports(current=Depends(get_current_user)):
    is_admin = bool(current.get("is_admin"))
    with connect() as conn:
        if is_admin:
            rows = conn.execute(
                f"""
                SELECT {_SUMMARY_COLUMNS}
                FROM reports r LEFT JOIN users u ON u.id = r.user_id
                ORDER BY r.id DESC
                """
            ).fetchall()
        else:
            rows = conn.execute(
                f"""
                SELECT {_SUMMARY_COLUMNS}
                FROM reports r LEFT JOIN users u ON u.id = r.user_id
                WHERE r.user_id = ? ORDER BY r.id DESC
                """,
                (current["id"],),
            ).fetchall()
    return [_row_to_summary(r) for r in rows]


@router.get("/{report_id}", response_model=ReportDetail)
def get_report(report_id: int, current=Depends(get_current_user)):
    is_admin = bool(current.get("is_admin"))
    with connect() as conn:
        if is_admin:
            row = conn.execute(
                f"""
                SELECT {_SUMMARY_COLUMNS}, r.email_error
                FROM reports r LEFT JOIN users u ON u.id = r.user_id
                WHERE r.id = ?
                """,
                (report_id,),
            ).fetchone()
        else:
            row = conn.execute(
                f"""
                SELECT {_SUMMARY_COLUMNS}, r.email_error
                FROM reports r LEFT JOIN users u ON u.id = r.user_id
                WHERE r.id = ? AND r.user_id = ?
                """,
                (report_id, current["id"]),
            ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return ReportDetail(
        id=row["id"],
        job_number=row["job_number"],
        client_name=row["client_name"],
        equipment_type=row["equipment_type"],
        submitted_at=row["submitted_at"],
        email_status=row["email_status"],
        email_error=row["email_error"],
        payload=json.loads(row["payload_json"]),
        created_by_email=row["created_by_email"],
        created_by_name=row["created_by_name"],
    )
