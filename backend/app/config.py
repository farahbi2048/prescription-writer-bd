"""Environment settings used by the FastAPI application."""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache
def settings() -> dict[str, str]:
    """Load backend settings once and return their configured values."""
    return {
        "database_url": os.getenv("DATABASE_URL", "sqlite:///./database.db"),
        "secret_key": os.getenv("JWT_SECRET_KEY", "change-this-development-secret"),
        "algorithm": os.getenv("JWT_ALGORITHM", "HS256"),
        "access_token_minutes": os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"),
        "cors_origins": os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"),
    }
