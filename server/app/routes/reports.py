import json

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import connect
from ..email_sender import send_report_email
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

    ok, err = send_report_email(payload, technician_email=current["email"])
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


@router.get("", response_model=list[ReportSummary])
def list_reports(current=Depends(get_current_user)):
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT id, job_number, client_name, equipment_type, submitted_at, email_status
            FROM reports WHERE user_id = ? ORDER BY id DESC
            """,
            (current["id"],),
        ).fetchall()
    return [
        ReportSummary(
            id=r["id"],
            job_number=r["job_number"],
            client_name=r["client_name"],
            equipment_type=r["equipment_type"],
            submitted_at=r["submitted_at"],
            email_status=r["email_status"],
        )
        for r in rows
    ]


@router.get("/{report_id}", response_model=ReportDetail)
def get_report(report_id: int, current=Depends(get_current_user)):
    with connect() as conn:
        row = conn.execute(
            """
            SELECT id, job_number, client_name, equipment_type, submitted_at,
                   email_status, email_error, payload_json
            FROM reports WHERE id = ? AND user_id = ?
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
    )
