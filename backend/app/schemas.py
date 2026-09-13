"""Pydantic request and response models exposed by the API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Authentication ----------


class UserRegister(BaseModel):
    """Fields accepted when a doctor creates an account."""

    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    """Account fields safe to return to the frontend."""

    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    """Login response containing the token and current user."""

    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ---------- Patients ----------


class PatientCreate(BaseModel):
    """Patient fields accepted by the create endpoint."""

    name: str = Field(min_length=1, max_length=120)
    age: int | None = Field(default=None, ge=0, le=150)
    gender: str | None = Field(default=None, max_length=30)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = None


class PatientUpdate(PatientCreate):
    """Optional patient fields accepted by the update endpoint."""

    name: str | None = Field(default=None, min_length=1, max_length=120)


class PatientPublic(PatientCreate):
    """Patient response with ownership and creation metadata."""

    model_config = ConfigDict(from_attributes=True)
    id: str
    doctor_id: str
    created_at: datetime


# ---------- AI Scribe response ----------


class SOAPNote(BaseModel):
    """Structured clinical draft extracted from a visit recording."""

    chief_complaint: str
    subjective: str
    objective: str
    assessment: str
    plan: str
    medications_mentioned: list[str]
    urgency_patient: Literal["Routine", "Urgent", "Unknown", "Emergency"]


class DrugSafetyResult(BaseModel):
    """Informational label lookup result for one mentioned medicine."""

    drug_name: str
    status: str
    detail: str


class VisitAnalysisResponse(BaseModel):
    """Complete response expected by the AI Scribe frontend."""

    soap_note: SOAPNote
    drug_safety: list[DrugSafetyResult]
    disclaimer: str
