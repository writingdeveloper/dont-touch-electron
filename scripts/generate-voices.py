"""Generate voice alert clips using Microsoft Edge TTS.

Free, no API key required, high-quality Azure Neural voices.

Usage:
    pip install edge-tts
    python scripts/generate-voices.py
"""
import asyncio
import edge_tts
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "sounds"

# Each entry: (filename, text, voice, rate, volume)
# Female voices selected for clarity. Rate/volume tuned to sound urgent but not shouty.
VOICES = [
    ("voice-en-stop.mp3",       "Stop!",                  "en-US-AriaNeural",     "+5%",  "+10%"),
    ("voice-en-handsdown.mp3",  "Hands down.",            "en-US-JennyNeural",    "+0%",  "+10%"),
    ("voice-ko-sondaejima.mp3", "손대지마!",              "ko-KR-SunHiNeural",    "+5%",  "+10%"),
    ("voice-ja-sawaranai.mp3",  "触らないで!",            "ja-JP-NanamiNeural",   "+5%",  "+10%"),
    ("voice-zh-bie.mp3",        "别碰!",                  "zh-CN-XiaoxiaoNeural", "+5%",  "+10%"),
    ("voice-es-no.mp3",         "¡No toques!",            "es-ES-ElviraNeural",   "+5%",  "+10%"),
    ("voice-ru-stop.mp3",       "Стоп! Опусти руки.",     "ru-RU-SvetlanaNeural", "+0%",  "+10%"),
]


async def generate_one(filename, text, voice, rate, volume):
    out_path = OUT_DIR / filename
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
    await communicate.save(str(out_path))
    size_kb = out_path.stat().st_size / 1024
    print(f"  {filename:30s}  {size_kb:6.1f} KB  ({voice})")


async def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Generating into {OUT_DIR}")
    for entry in VOICES:
        await generate_one(*entry)
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
