
import edge_tts
import uuid
from pathlib import Path

AUDIO_DIR = Path(__file__).resolve().parents[2] / "data" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


async def generate_audio(text: str):
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")

    filename = f"{uuid.uuid4()}.mp3"
    filepath = AUDIO_DIR / filename

    communicate = edge_tts.Communicate(
        text,
        voice="en-US-AriaNeural"
    )

    await communicate.save(str(filepath))

    return filepath
