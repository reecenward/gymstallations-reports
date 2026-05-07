import json
import smtplib
from email.message import EmailMessage
from pathlib import Path
from typing import Optional, Tuple

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .config import settings

_TEMPLATE_DIR = Path(__file__).parent / "templates"
_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)),
    autoescape=select_autoescape(["html"]),
)


def render_html(payload: dict) -> str:
    template = _env.get_template("report_email.html")
    return template.render(p=payload)


def send_report_email(payload: dict, technician_email: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    if not (settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.report_recipient):
        return False, "SMTP not configured"

    job_number = payload.get("jobNumber") or "report"
    subject = f"Equipment report {job_number} — {payload.get('clientName') or 'client'}"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = settings.report_recipient
    if technician_email:
        msg["Reply-To"] = technician_email

    msg.set_content(
        f"Equipment maintenance report {job_number}.\n"
        "View this email in HTML for the full summary; raw JSON attached."
    )
    msg.add_alternative(render_html(payload), subtype="html")

    json_bytes = json.dumps(payload, indent=2).encode("utf-8")
    msg.add_attachment(
        json_bytes,
        maintype="application",
        subtype="json",
        filename=f"report-{job_number}.json",
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.smtp_user, settings.smtp_pass)
            smtp.send_message(msg)
        return True, None
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"
