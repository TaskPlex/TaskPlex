"""
Image processing API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.image import ImageProcessingResponse
from app.services.image_service import compress_image, convert_image, rotate_image
from app.utils.file_handler import (
    delete_file,
    generate_unique_filename,
    save_upload_file,
)
from app.utils.validators import validate_image_format

router = APIRouter(prefix="/image", tags=["Image"])


@router.post("/compress", response_model=ImageProcessingResponse)
async def compress_image_endpoint(
    file: UploadFile = File(..., description="Image file to compress"),
    quality: str = Form("medium", description="Compression quality (low, medium, high)"),
):
    """
    Compress an image file

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"compressed_{file.filename}")
        output_path = TEMP_DIR / output_filename

        # Compress image
        result = compress_image(input_path, output_path, quality)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/convert", response_model=ImageProcessingResponse)
async def convert_image_endpoint(
    file: UploadFile = File(..., description="Image file to convert"),
    output_format: str = Form(..., description="Target format (jpg, png, webp, etc.)"),
    quality: str = Form("medium", description="Conversion quality (low, medium, high)"),
):
    """
    Convert an image to a different format

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    """
    # Validate input file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported input image format")

    # Validate output format
    if output_format.lower() not in ["jpg", "jpeg", "png", "gif", "bmp", "webp"]:
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

        # Convert image
        result = convert_image(input_path, output_path, output_format, quality)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/rotate", response_model=ImageProcessingResponse)
async def rotate_image_endpoint(
    file: UploadFile = File(..., description="Image file to rotate"),
    angle: int = Form(..., description="Rotation angle in degrees (90, 180, or 270)"),
):
    """
    Rotate an image by a specified angle

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    Supported angles: 90, 180, 270 degrees
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

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

        # Rotate image
        result = rotate_image(input_path, output_path, angle)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)
