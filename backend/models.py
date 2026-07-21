from typing import List

from pydantic import BaseModel, Field


class SOAPNote(BaseModel):
    """Structured documentation extracted from a recorded visit."""

    chief_complaint: str = Field(description="The patient's stated reason for the visit.")
    subjective: str = Field(description="Symptoms and history reported by the patient.")
    objective: str = Field(description="Only findings, vitals, or test results stated in the transcript.")
    assessment: str = Field(description="Clinical assessment stated in the transcript; do not infer one.")
    plan: str = Field(description="Plan, follow-up, tests, or medications stated in the transcript.")
    medications_mentioned: List[str] = Field(
        description="Medication names explicitly mentioned in the transcript."
    )
    urgency_patient: str = Field(
        description="Use only Routine, Urgent, Unknown, or Emergency when explicitly stated in the transcript."
    )


class DrugSafetyResult(BaseModel):
    drug_name: str
    status: str
    detail: str


class VisitAnalysisResponse(BaseModel):
    soap_note: SOAPNote
    drug_safety: List[DrugSafetyResult]
    disclaimer: str
