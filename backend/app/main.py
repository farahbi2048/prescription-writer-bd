from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, patients

Base.metadata.create_all(bind=engine)
config = settings()
app = FastAPI(title="Prescription Writer BD API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in config["cors_origins"].split(",")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth.router)
app.include_router(patients.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
