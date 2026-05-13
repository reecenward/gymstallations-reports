from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    is_admin: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateUserRequest(BaseModel):
    is_admin: Optional[bool] = None
    password: Optional[str] = None
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ChecklistItem(BaseModel):
    grade: Optional[str] = None
    notes: Optional[str] = ""


class ReportSubmission(BaseModel):
    clientName: str = ""
    siteAddress: str = ""
    date: Optional[str] = None
    jobNumber: str
    technicianName: str = ""
    equipmentType: str = ""
    brand: str = ""
    model: str = ""
    serialNumber: str = ""
    assetId: str = ""
    location: str = ""
    manufacturingDate: str = ""
    installDate: str = ""
    hoursOnUnit: str = ""
    ageYears: str = ""
    serialPhoto: Optional[str] = None
    checklist: dict[str, ChecklistItem] = {}
    issuesFound: str = ""
    partsReplaced: str = ""
    recommendations: str = ""

    model_config = {"extra": "allow"}


class ReportSummary(BaseModel):
    id: int
    job_number: str
    client_name: Optional[str]
    equipment_type: Optional[str]
    submitted_at: str
    email_status: str
    created_by_email: Optional[str] = None
    created_by_name: Optional[str] = None


class ReportDetail(ReportSummary):
    payload: dict[str, Any]
    email_error: Optional[str] = None


class SubmitReportResponse(BaseModel):
    id: int
    submitted_at: str
    email_status: str
    email_error: Optional[str] = None
