"""Password hashing and JWT creation helpers."""

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from .config import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Create a bcrypt hash suitable for database storage."""
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plain password against its stored hash."""
    return password_context.verify(password, password_hash)


def create_access_token(subject: str) -> str:
    """Create an expiring JWT for the supplied user identifier."""
    config = settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=int(config["access_token_minutes"]))
    return jwt.encode({"sub": subject, "exp": expires}, config["secret_key"], algorithm=config["algorithm"])
