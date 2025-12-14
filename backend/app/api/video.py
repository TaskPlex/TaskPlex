"""
Video processing API endpoints
"""

import asyncio
from pathlib import Path
from typing import List

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.video import VideoProcessingResponse
from app.services.video_service import (
    compress_video,
    convert_video,
    extract_audio,
    merge_videos,
    rotate_video,
    video_to_gif,
)
from app.services.video_service_async import (
    compress_video_with_progress,
    convert_video_with_progress,
    merge_videos_with_progress,
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


@router.post("/to-gif", response_model=VideoProcessingResponse)
async def video_to_gif_endpoint(
    file: UploadFile = File(..., description="Video file to convert to GIF"),
    start_time: float = Form(0.0, description="Start time in seconds"),
    duration: float | None = Form(None, description="Duration in seconds"),
    width: int | None = Form(None, description="Target width in pixels"),
    fps: int = Form(12, description="Frames per second for GIF"),
    loop: bool = Form(True, description="Loop GIF indefinitely"),
):
    """
    Convert a segment of a video to an animated GIF.

    Supports common video formats: MP4, AVI, MOV, MKV, FLV, WMV
    """
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    if start_time < 0:
        raise HTTPException(status_code=400, detail="start_time must be non-negative")

    if duration is not None and duration <= 0:
        raise HTTPException(status_code=400, detail="duration must be greater than 0")

    if fps < 1 or fps > 60:
        raise HTTPException(status_code=400, detail="fps must be between 1 and 60")

    if width is not None and width < 32:
        raise HTTPException(status_code=400, detail="width must be at least 32 pixels")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"gif_{Path(file.filename).stem}.gif")
        output_path = TEMP_DIR / output_filename

        # Convert video to GIF
        result = video_to_gif(
            input_path=input_path,
            output_path=output_path,
            start_time=start_time,
            duration=duration,
            width=width,
            fps=fps,
            loop=loop,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        if input_path:
            delete_file(input_path)


@router.post("/extract-audio", response_model=VideoProcessingResponse)
async def extract_audio_endpoint(
    file: UploadFile = File(..., description="Video file to extract audio from"),
    output_format: str = Form("mp3", description="Output audio format (mp3, wav, flac, ogg)"),
    bitrate: str = Form("192k", description="Audio bitrate, e.g., 128k, 192k"),
):
    """
    Extract the audio track from a video and export it to an audio file.
    """
    if not validate_video_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    allowed_formats = {"mp3", "wav", "flac", "ogg"}
    if output_format.lower() not in allowed_formats:
        raise HTTPException(status_code=400, detail="Unsupported output audio format")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Build output filename
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}_audio.{output_format}")
        output_path = TEMP_DIR / output_filename

        result = extract_audio(
            input_path=input_path,
            output_path=output_path,
            output_format=output_format,
            bitrate=bitrate,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        if input_path:
            delete_file(input_path)


@router.post("/merge", response_model=VideoProcessingResponse)
async def merge_videos_endpoint(
    files: List[UploadFile] = File(..., description="Video files to merge (in order)"),
    output_format: str = Form("mp4", description="Output format (mp4, avi, mov, etc.)"),
    quality: str = Form("medium", description="Output quality (low, medium, high)"),
    merge_mode: str = Form(
        "quality",
        description="Merge mode: 'fast' (copy without re-encoding) or 'quality' (re-encode for compatibility)",
    ),
):
    """
    Merge multiple video files into one

    Supported formats: MP4, AVI, MOV, MKV, FLV, WMV

    Merge modes:
    - 'fast': Copies streams without re-encoding (very fast, but requires identical video parameters)
    - 'quality': Re-encodes for compatibility (slower but more reliable)
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 video files are required for merging"
        )

    # Validate merge_mode
    if merge_mode not in ["fast", "quality"]:
        raise HTTPException(status_code=400, detail="merge_mode must be 'fast' or 'quality'")

    # Validate all files
    for file in files:
        if not validate_video_format(file.filename):
            raise HTTPException(
                status_code=400, detail=f"File {file.filename} is not a valid video format"
            )

    # Validate output format
    if output_format.lower() not in ["mp4", "avi", "mov", "mkv", "flv", "wmv"]:
        raise HTTPException(status_code=400, detail="Unsupported output format")

    input_paths = []
    output_path = None

    try:
        # Save all uploaded files
        for file in files:
            input_path = await save_upload_file(file)
            input_paths.append(input_path)

        # Create output path
        output_filename = generate_unique_filename(f"merged.{output_format}")
        output_path = TEMP_DIR / output_filename

        # Merge videos
        result = merge_videos(input_paths, output_path, output_format, quality, merge_mode)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input files
        for input_path in input_paths:
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


async def run_merge_task(
    task_id: str,
    input_paths: list[Path],
    output_path: Path,
    output_format: str,
    quality: str,
    merge_mode: str,
):
    """Background task for video merging with progress"""
    try:
        await merge_videos_with_progress(
            task_id, input_paths, output_path, output_format, quality, merge_mode
        )
    finally:
        # Clean up input files
        for input_path in input_paths:
            if input_path:
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


@router.post("/merge/async")
async def merge_videos_async(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Video files to merge (in order)"),
    output_format: str = Form("mp4", description="Output format (mp4, avi, mov, etc.)"),
    quality: str = Form("medium", description="Output quality (low, medium, high)"),
    merge_mode: str = Form(
        "quality",
        description="Merge mode: 'fast' (copy without re-encoding) or 'quality' (re-encode for compatibility)",
    ),
):
    """
    Start async video merging with progress tracking

    Returns a task_id that can be used to:
    - Poll status: GET /api/v1/tasks/{task_id}/status
    - Stream progress: GET /api/v1/tasks/{task_id}/stream (SSE)

    Merge modes:
    - 'fast': Copies streams without re-encoding (very fast, but requires identical video parameters)
    - 'quality': Re-encodes for compatibility (slower but more reliable)

    Progress events include: analyzing, encoding, finalizing stages
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 video files are required for merging"
        )

    # Validate merge_mode
    if merge_mode not in ["fast", "quality"]:
        raise HTTPException(status_code=400, detail="merge_mode must be 'fast' or 'quality'")

    # Validate all files
    for file in files:
        if not validate_video_format(file.filename):
            raise HTTPException(
                status_code=400, detail=f"File {file.filename} is not a valid video format"
            )

    # Validate output format
    if output_format.lower() not in ["mp4", "avi", "mov", "mkv", "flv", "wmv"]:
        raise HTTPException(status_code=400, detail="Unsupported output format")

    # Save all uploaded files
    input_paths = []
    for file in files:
        input_path = await save_upload_file(file)
        input_paths.append(input_path)

    # Create output path
    output_filename = generate_unique_filename(f"merged.{output_format}")
    output_path = TEMP_DIR / output_filename

    # Create task
    task = task_store.create_task(
        task_type="video_merge",
        metadata={
            "filenames": [f.filename for f in files],
            "output_format": output_format,
            "quality": quality,
            "merge_mode": merge_mode,
        },
    )

    # Start background processing
    asyncio.create_task(
        run_merge_task(task.id, input_paths, output_path, output_format, quality, merge_mode)
    )

    return {"task_id": task.id}
