"""
Video processing API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.video import VideoProcessingResponse
from app.services.video_service import compress_video, convert_video
from app.utils.file_handler import (
    delete_file,
    generate_unique_filename,
    save_upload_file,
)
from app.utils.validators import validate_video_format

router = APIRouter(prefix="/video", tags=["Video"])


@router.post("/compress", response_model=VideoProcessingResponse)
async def compress_video_endpoint(
    file: UploadFile = File(..., description="Video file to compress"),
    quality: str = Form("medium", description="Compression quality (low, medium, high)"),
):
    """
    Compress a video file

    Supported formats: MP4, AVI, MOV, MKV, FLV, WMV

    Note: This operation may take some time depending on video size
    """
    # Validate file format
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"compressed_{file.filename}")
        output_path = TEMP_DIR / output_filename

        # Compress video
        result = compress_video(input_path, output_path, quality)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/convert", response_model=VideoProcessingResponse)
async def convert_video_endpoint(
    file: UploadFile = File(..., description="Video file to convert"),
    output_format: str = Form(..., description="Target format (mp4, avi, mov, etc.)"),
    quality: str = Form("medium", description="Conversion quality (low, medium, high)"),
):
    """
    Convert a video to a different format

    Supported formats: MP4, AVI, MOV, MKV, FLV, WMV

    Note: This operation may take some time depending on video size
    """
    # Validate input file format
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported input video format")

    # Validate output format
    if output_format.lower() not in ["mp4", "avi", "mov", "mkv", "flv", "wmv"]:
        raise HTTPException(status_code=400, detail="Unsupported output format")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path with new extension
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}_converted.{output_format}")
        output_path = TEMP_DIR / output_filename

        # Convert video
        result = convert_video(input_path, output_path, output_format, quality)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)
