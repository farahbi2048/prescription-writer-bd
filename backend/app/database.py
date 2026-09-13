"""SQLAlchemy engine, model base and request-scoped database sessions."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

DATABASE_URL = settings()["database_url"]
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class shared by every SQLAlchemy table."""

    pass


def get_db():
    """Provide one database session and close it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
