from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class PatientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    age: int | None = Field(default=None, ge=0, le=150)
    gender: str | None = Field(default=None, max_length=30)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = None


class PatientUpdate(PatientCreate):
    name: str | None = Field(default=None, min_length=1, max_length=120)


class PatientPublic(PatientCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    doctor_id: str
    created_at: datetime


class SOAPNote(BaseModel):
    chief_complaint: str
    subjective: str
    objective: str
    assessment: str
    plan: str
    medications_mentioned: list[str]
    urgency_patient: Literal["Routine", "Urgent", "Unknown", "Emergency"]


class DrugSafetyResult(BaseModel):
    drug_name: str
    status: str
    detail: str


class VisitAnalysisResponse(BaseModel):
    soap_note: SOAPNote
    drug_safety: list[DrugSafetyResult]
    disclaimer: str
