import os
import shutil
import tempfile
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai

from models import DrugSafetyResult, SOAPNote, VisitAnalysisResponse


load_dotenv()

app = FastAPI(title="Prescription Writer BD - AI Scribe API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing. Add it to backend/.env before starting the API.",
        )
    return genai.Client(api_key=api_key)


def check_drug_warning(drug_name: str) -> DrugSafetyResult:
    """Read the OpenFDA boxed-warning field; this is informational, not clinical advice."""
    try:
        response = requests.get(
            "https://api.fda.gov/drug/label.json",
            params={"search": f'openfda.brand_name:"{drug_name}"', "limit": 1},
            timeout=10,
        )
        if response.status_code == 404:
            return DrugSafetyResult(
                drug_name=drug_name,
                status="not_found",
                detail="No matching OpenFDA label was found. Verify the medicine name manually.",
            )
        response.raise_for_status()
        result = response.json()["results"][0]
        boxed_warning = result.get("boxed_warning", [])
        if boxed_warning:
            return DrugSafetyResult(
                drug_name=drug_name,
                status="boxed_warning",
                detail=boxed_warning[0],
            )
        return DrugSafetyResult(
            drug_name=drug_name,
            status="no_boxed_warning_found",
            detail="No boxed warning was found in the returned OpenFDA label.",
        )
    except requests.RequestException:
        return DrugSafetyResult(
            drug_name=drug_name,
            status="lookup_unavailable",
            detail="OpenFDA could not be reached. Do not treat this as a safety clearance.",
        )
    except (KeyError, IndexError, ValueError):
        return DrugSafetyResult(
            drug_name=drug_name,
            status="lookup_unavailable",
            detail="The returned OpenFDA data could not be interpreted. Verify manually.",
        )


def extract_soap_note(audio_path: str) -> SOAPNote:
    client = get_client()
    uploaded_file = None
    try:
        uploaded_file = client.files.upload(file=audio_path)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                uploaded_file,
                "Transcribe this doctor-patient visit and extract the requested structured documentation.",
            ],
            config={
                "system_instruction": (
                    "You are a clinical documentation assistant, not a diagnostic or prescribing system. "
                    "Extract only what is explicitly present in the recording. Never invent facts, diagnoses, "
                    "medicines, doses, urgency, or treatment. Use 'Not mentioned' when information is absent. "
                    "The resulting draft always requires clinician review."
                ),
                "response_mime_type": "application/json",
                "response_schema": SOAPNote,
            },
        )
        return SOAPNote.model_validate_json(response.text)
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"AI scribe processing failed: {error}") from error
    finally:
        if uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/visit-audio", response_model=VisitAnalysisResponse)
def analyse_visit_audio(audio: UploadFile = File(...)) -> VisitAnalysisResponse:
    if audio.content_type not in {"audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"}:
        raise HTTPException(status_code=415, detail="Upload an MP3 or WAV audio file.")

    suffix = Path(audio.filename or "visit.mp3").suffix or ".mp3"
    temporary_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
            shutil.copyfileobj(audio.file, temporary_file)
            temporary_path = temporary_file.name

        soap_note = extract_soap_note(temporary_path)
        drug_safety = [check_drug_warning(drug) for drug in soap_note.medications_mentioned]
        return VisitAnalysisResponse(
            soap_note=soap_note,
            drug_safety=drug_safety,
            disclaimer=(
                "AI-generated documentation draft only. A qualified clinician must review and confirm all "
                "content. OpenFDA results do not replace local formularies, contraindication checks, or clinical judgment."
            ),
        )
    finally:
        awaitable_close = audio.file.close()
        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)
