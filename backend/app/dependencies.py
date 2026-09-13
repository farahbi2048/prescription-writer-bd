"""FastAPI dependencies shared by protected routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode the bearer token and return its user or raise HTTP 401."""
    config = settings()
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    try:
        user_id = jwt.decode(token, config["secret_key"], algorithms=[config["algorithm"]]).get("sub")
    except JWTError as exception:
        raise error from exception
    user = db.get(User, user_id) if user_id else None
    if not user:
        raise error
    return user
