import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def uuid_value() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_value)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="doctor")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_value)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Prescription(Base):
    __tablename__ = "prescriptions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_value)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), index=True)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    medicines: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AISession(Base):
    __tablename__ = "ai_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_value)
    patient_id: Mapped[str | None] = mapped_column(ForeignKey("patients.id"), nullable=True)
    doctor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    soap_note: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_value)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(100))
    entity_type: Mapped[str] = mapped_column(String(50))
    entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
