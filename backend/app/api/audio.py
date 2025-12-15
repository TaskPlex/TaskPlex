"""
Audio processing API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.audio import AudioProcessingResponse
from app.services.audio_service import convert_audio
from app.utils.file_handler import delete_file, generate_unique_filename, save_upload_file

router = APIRouter(prefix="/audio", tags=["Audio"])


def validate_audio_format(filename: str) -> bool:
    """
    Validate if the uploaded file is a supported audio format

    Args:
        filename: Name of the uploaded file

    Returns:
        True if format is supported, False otherwise
    """
    if not filename:
        return False

    supported_formats = {
        ".mp3",
        ".wav",
        ".flac",
        ".ogg",
        ".aac",
        ".m4a",
        ".wma",
        ".opus",
        ".mp4",  # Can contain audio
        ".m4v",  # Can contain audio
    }

    file_ext = Path(filename).suffix.lower()
    return file_ext in supported_formats


@router.post("/convert", response_model=AudioProcessingResponse)
async def convert_audio_endpoint(
    file: UploadFile = File(..., description="Audio file to convert"),
    output_format: str = Form(
        ..., description="Output audio format (mp3, wav, flac, ogg, aac, m4a)"
    ),
    quality: str = Form("medium", description="Conversion quality (low, medium, high)"),
    bitrate: str = Form("192k", description="Audio bitrate (e.g., 128k, 192k, 256k, 320k)"),
):
    """
    Convert an audio file to a different format

    - **file**: Audio file to convert
    - **output_format**: Target format (mp3, wav, flac, ogg, aac, m4a)
    - **quality**: Conversion quality preset (low, medium, high)
    - **bitrate**: Audio bitrate for lossy formats (128k, 192k, 256k, 320k)

    Supported input formats: MP3, WAV, FLAC, OGG, AAC, M4A, WMA, OPUS, MP4, M4V
    Supported output formats: MP3, WAV, FLAC, OGG, AAC, M4A
    """
    if not validate_audio_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    allowed_output_formats = {"mp3", "wav", "flac", "ogg", "aac", "m4a"}
    if output_format.lower() not in allowed_output_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format. Allowed formats: {', '.join(allowed_output_formats)}",
        )

    allowed_qualities = {"low", "medium", "high"}
    if quality.lower() not in allowed_qualities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid quality. Allowed values: {', '.join(allowed_qualities)}",
        )

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Build output filename
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}.{output_format}")
        output_path = TEMP_DIR / output_filename

        result = convert_audio(
            input_path=input_path,
            output_path=output_path,
            output_format=output_format,
            quality=quality,
            bitrate=bitrate,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        if input_path:
            delete_file(input_path)
