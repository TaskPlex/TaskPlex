"""
Audio processing API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.audio import AudioProcessingResponse
from app.services.audio_service import compress_audio, convert_audio, merge_audio
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


@router.post("/compress", response_model=AudioProcessingResponse)
async def compress_audio_endpoint(
    file: UploadFile = File(..., description="Audio file to compress"),
    quality: str = Form("medium", description="Compression quality (low, medium, high)"),
    target_bitrate: str = Form(
        "128k", description="Target audio bitrate (e.g., 64k, 96k, 128k, 160k, 192k)"
    ),
):
    """
    Compress an audio file to reduce its size

    - **file**: Audio file to compress
    - **quality**: Compression quality preset (low, medium, high)
    - **target_bitrate**: Target audio bitrate for compression (64k, 96k, 128k, 160k, 192k)

    Supported input formats: MP3, WAV, FLAC, OGG, AAC, M4A, WMA, OPUS, MP4, M4V

    The compression will:
    - Convert lossless formats (WAV, FLAC) to MP3
    - Reduce bitrate for lossy formats (MP3, OGG, AAC)
    - Maintain the original format when possible
    """
    if not validate_audio_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    allowed_qualities = {"low", "medium", "high"}
    if quality.lower() not in allowed_qualities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid quality. Allowed values: {', '.join(allowed_qualities)}",
        )

    # Validate bitrate format (should end with 'k' or be a number)
    if not target_bitrate.endswith("k"):
        raise HTTPException(
            status_code=400,
            detail="Bitrate must be in format like '128k', '192k', etc.",
        )

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Build output filename (keep original extension or use mp3 for lossless)
        base_name = Path(file.filename).stem
        input_ext = Path(file.filename).suffix.lower()

        # Determine output format
        if input_ext in [".wav", ".flac"]:
            output_ext = "mp3"
        else:
            output_ext = input_ext.lstrip(".")

        output_filename = generate_unique_filename(f"{base_name}_compressed.{output_ext}")
        output_path = TEMP_DIR / output_filename

        result = compress_audio(
            input_path=input_path,
            output_path=output_path,
            quality=quality,
            target_bitrate=target_bitrate,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        if input_path:
            delete_file(input_path)


@router.post("/merge", response_model=AudioProcessingResponse)
async def merge_audio_endpoint(
    files: list[UploadFile] = File(..., description="Audio files to merge (in order)"),
    output_format: str = Form("mp3", description="Output format (mp3, wav, flac, ogg, aac, m4a)"),
    quality: str = Form("medium", description="Output quality (low, medium, high)"),
    bitrate: str = Form("192k", description="Audio bitrate (e.g., 128k, 192k, 256k, 320k)"),
):
    """
    Merge multiple audio files into one

    - **files**: Audio files to merge (in order)
    - **output_format**: Target format (mp3, wav, flac, ogg, aac, m4a)
    - **quality**: Output quality preset (low, medium, high)
    - **bitrate**: Audio bitrate for lossy formats (128k, 192k, 256k, 320k)

    Supported input formats: MP3, WAV, FLAC, OGG, AAC, M4A, WMA, OPUS, MP4, M4V
    Supported output formats: MP3, WAV, FLAC, OGG, AAC, M4A
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 audio files are required for merging"
        )

    # Validate all files
    for file in files:
        if not validate_audio_format(file.filename):
            raise HTTPException(
                status_code=400, detail=f"Unsupported audio format: {file.filename}"
            )

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

    input_paths = []
    output_path = None

    try:
        # Save all uploaded files
        for file in files:
            input_path = await save_upload_file(file)
            input_paths.append(input_path)

        # Build output filename
        base_name = Path(files[0].filename).stem
        output_filename = generate_unique_filename(f"{base_name}_merged.{output_format}")
        output_path = TEMP_DIR / output_filename

        result = merge_audio(
            input_paths=input_paths,
            output_path=output_path,
            output_format=output_format,
            quality=quality,
            bitrate=bitrate,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up all input files
        for input_path in input_paths:
            if input_path:
                delete_file(input_path)
