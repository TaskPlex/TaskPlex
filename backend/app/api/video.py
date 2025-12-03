"""
Video processing API endpoints
"""

import asyncio
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.video import VideoProcessingResponse
from app.services.video_service import compress_video, convert_video, rotate_video
from app.services.video_service_async import (
    compress_video_with_progress,
    convert_video_with_progress,
)
from app.tasks import task_store
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


@router.post("/rotate", response_model=VideoProcessingResponse)
async def rotate_video_endpoint(
    file: UploadFile = File(..., description="Video file to rotate"),
    angle: int = Form(..., description="Rotation angle in degrees (90, 180, or 270)"),
):
    """
    Rotate a video by a specified angle

    Supported formats: MP4, AVI, MOV, MKV, FLV, WMV
    Supported angles: 90, 180, 270 degrees

    Note: This operation may take some time depending on video size
    """
    # Validate file format
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Validate angle
    if angle not in [90, 180, 270]:
        raise HTTPException(status_code=400, detail="Invalid angle. Supported angles: 90, 180, 270")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"rotated_{angle}_{file.filename}")
        output_path = TEMP_DIR / output_filename

        # Rotate video
        result = rotate_video(input_path, output_path, angle)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


# ============================================
# ASYNC ENDPOINTS WITH SSE PROGRESS TRACKING
# ============================================


async def run_compress_task(task_id: str, input_path: Path, output_path: Path, quality: str):
    """Background task for video compression with progress"""
    try:
        await compress_video_with_progress(task_id, input_path, output_path, quality)
    finally:
        # Clean up input file after processing
        delete_file(input_path)


async def run_convert_task(
    task_id: str, input_path: Path, output_path: Path, output_format: str, quality: str
):
    """Background task for video conversion with progress"""
    try:
        await convert_video_with_progress(task_id, input_path, output_path, output_format, quality)
    finally:
        delete_file(input_path)


@router.post("/compress/async")
async def compress_video_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to compress"),
    quality: str = Form("medium", description="Compression quality (low, medium, high)"),
):
    """
    Start async video compression with progress tracking

    Returns a task_id that can be used to:
    - Poll status: GET /api/v1/tasks/{task_id}/status
    - Stream progress: GET /api/v1/tasks/{task_id}/stream (SSE)

    Progress events include: analyzing, encoding, finalizing stages
    """
    # Validate file format
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save uploaded file
    input_path = await save_upload_file(file)

    # Create output path
    output_filename = generate_unique_filename(f"compressed_{file.filename}")
    output_path = TEMP_DIR / output_filename

    # Create task
    task = task_store.create_task(
        task_type="video_compress",
        metadata={
            "filename": file.filename,
            "quality": quality,
        },
    )

    # Start background processing
    asyncio.create_task(run_compress_task(task.id, input_path, output_path, quality))

    return {"task_id": task.id}


@router.post("/convert/async")
async def convert_video_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video file to convert"),
    output_format: str = Form(..., description="Target format (mp4, avi, mov, etc.)"),
    quality: str = Form("medium", description="Conversion quality (low, medium, high)"),
):
    """
    Start async video conversion with progress tracking

    Returns a task_id for progress tracking via SSE
    """
    # Validate input file format
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported input video format")

    # Validate output format
    if output_format.lower() not in ["mp4", "avi", "mov", "mkv", "flv", "wmv"]:
        raise HTTPException(status_code=400, detail="Unsupported output format")

    # Save uploaded file
    input_path = await save_upload_file(file)

    # Create output path
    base_name = Path(file.filename).stem
    output_filename = generate_unique_filename(f"{base_name}_converted.{output_format}")
    output_path = TEMP_DIR / output_filename

    # Create task
    task = task_store.create_task(
        task_type="video_convert",
        metadata={
            "filename": file.filename,
            "output_format": output_format,
            "quality": quality,
        },
    )

    # Start background processing
    asyncio.create_task(run_convert_task(task.id, input_path, output_path, output_format, quality))

    return {"task_id": task.id}
