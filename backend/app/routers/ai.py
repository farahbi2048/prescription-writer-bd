import os
import tempfile

import requests
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from google import genai

from ..dependencies import get_current_user
from ..models import User
from ..schemas import DrugSafetyResult, SOAPNote, VisitAnalysisResponse

router = APIRouter(prefix="/api", tags=["ai-scribe"])

MAX_AUDIO_BYTES = 15 * 1024 * 1024
SUPPORTED_SUFFIXES = {".mp3", ".wav"}
SYSTEM_PROMPT = (
    "You are a clinical documentation assistant. Extract only information explicitly stated in the "
    "transcript. Never diagnose, recommend treatment, or invent missing details. Use Unknown when "
    "urgency is not explicitly stated."
)
DISCLAIMER = (
    "AI-generated documentation draft for clinician review only. Not for diagnosis, prescribing, "
    "dose selection, or emergency triage."
)


def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI provider is not configured")
    return genai.Client(api_key=api_key)


def _drug_safety(drug_name: str) -> DrugSafetyResult:
    try:
        response = requests.get(
            "https://api.fda.gov/drug/label.json",
            params={"search": f'openfda.brand_name:"{drug_name}"', "limit": 1},
            timeout=10,
        )
        if response.status_code == 404:
            return DrugSafetyResult(drug_name=drug_name, status="not_found", detail="No matching OpenFDA label was found.")
        response.raise_for_status()
        result = response.json()["results"][0]
        boxed_warning = result.get("boxed_warning", [])
        if boxed_warning:
            return DrugSafetyResult(
                drug_name=drug_name,
                status="boxed_warning",
                detail=str(boxed_warning[0])[:1200],
            )
        return DrugSafetyResult(
            drug_name=drug_name,
            status="no_boxed_warning",
            detail="No boxed warning was present in the matching OpenFDA label.",
        )
    except (KeyError, IndexError, requests.RequestException, ValueError):
        return DrugSafetyResult(
            drug_name=drug_name,
            status="unavailable",
            detail="OpenFDA lookup was unavailable; verify the official label independently.",
        )


@router.post("/visit-audio", response_model=VisitAnalysisResponse)
async def analyse_visit_audio(
    audio: UploadFile = File(...),
    _current_user: User = Depends(get_current_user),
) -> VisitAnalysisResponse:
    suffix = os.path.splitext(audio.filename or "")[1].lower()
    if suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(status_code=400, detail="Upload an MP3 or WAV recording")

    audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file must be 15 MB or smaller")
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty")

    client = _client()
    temporary_path = ""
    uploaded_file = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
            temporary_file.write(audio_bytes)
            temporary_path = temporary_file.name

        uploaded_file = client.files.upload(file=temporary_path)
        transcript_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                uploaded_file,
                "Transcribe this synthetic doctor-patient recording. Label speakers where possible.",
            ],
        )
        transcript = (transcript_response.text or "").strip()
        if not transcript:
            raise HTTPException(status_code=502, detail="The AI provider returned an empty transcript")

        soap_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Create a structured SOAP documentation draft from this transcript:\n\n{transcript}",
            config={
                "system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "response_schema": SOAPNote,
            },
        )
        soap_note = SOAPNote.model_validate_json(soap_response.text)
        unique_drugs = list(dict.fromkeys(soap_note.medications_mentioned))[:10]
        return VisitAnalysisResponse(
            soap_note=soap_note,
            drug_safety=[_drug_safety(drug) for drug in unique_drugs],
            disclaimer=DISCLAIMER,
        )
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"AI processing failed: {error}") from error
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)
        if uploaded_file is not None:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass
