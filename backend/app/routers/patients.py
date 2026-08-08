from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import AuditLog, Patient, User
from ..schemas import PatientCreate, PatientPublic, PatientUpdate

router = APIRouter(prefix="/api/patients", tags=["patients"])


def owned_patient(patient_id: str, user: User, db: Session) -> Patient:
    patient = db.get(Patient, patient_id)
    if not patient or (user.role != "admin" and patient.doctor_id != user.id):
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("", response_model=list[PatientPublic])
def list_patients(q: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[Patient]:
    query = db.query(Patient)
    if user.role != "admin":
        query = query.filter(Patient.doctor_id == user.id)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(or_(Patient.name.ilike(term), Patient.phone.ilike(term)))
    return query.order_by(Patient.created_at.desc()).all()


@router.post("", response_model=PatientPublic, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Patient:
    patient = Patient(**payload.model_dump(), doctor_id=user.id)
    db.add(patient)
    db.flush()
    db.add(AuditLog(actor_id=user.id, action="patient.created", entity_type="patient", entity_id=patient.id))
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=PatientPublic)
def get_patient(patient_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Patient:
    return owned_patient(patient_id, user, db)


@router.patch("/{patient_id}", response_model=PatientPublic)
def update_patient(patient_id: str, payload: PatientUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Patient:
    patient = owned_patient(patient_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.add(AuditLog(actor_id=user.id, action="patient.updated", entity_type="patient", entity_id=patient.id))
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Response:
    patient = owned_patient(patient_id, user, db)
    db.add(AuditLog(actor_id=user.id, action="patient.deleted", entity_type="patient", entity_id=patient.id))
    db.delete(patient)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
