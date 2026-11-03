from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.tts_service import generate_audio

router = APIRouter()


class TTSRequest(BaseModel):
    text: str


@router.post("/tts/generate")
async def create_audio(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        audio_path = await generate_audio(request.text)

        return {
            "audio_url": f"/api/audio/{audio_path.name}",
            "text": request.text,
            "message": "Audio generated successfully"
        }

    except Exception:
        return {
            "audio_url": None,
            "text": request.text,
            "message": "Audio generation failed. Please use the text response."
        }


@router.get("/audio/{filename}")
async def get_audio(filename: str):
    audio_dir = Path(__file__).resolve().parents[2] / "data" / "audio"
    audio_path = audio_dir / filename

    if not audio_path.is_file() or audio_path.parent != audio_dir:
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=filename
    )