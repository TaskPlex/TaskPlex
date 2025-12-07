"""
Image processing API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.image import ColorExtractionResponse, ImageProcessingResponse
from app.services.image_service import (
    adjust_image,
    apply_filter,
    compress_image,
    convert_image,
    extract_colors,
    resize_image,
    rotate_image,
)
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


@router.post("/extract-colors", response_model=ColorExtractionResponse)
async def extract_colors_endpoint(
    file: UploadFile = File(..., description="Image file to analyze"),
    max_colors: int = Form(6, description="Number of dominant colors to return"),
):
    """
    Extract dominant colors from an image.

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    if max_colors <= 0 or max_colors > 12:
        raise HTTPException(status_code=400, detail="max_colors must be between 1 and 12")

    input_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Extract colors
        result = extract_colors(input_path, max_colors=max_colors)

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


@router.post("/resize", response_model=ImageProcessingResponse)
async def resize_image_endpoint(
    file: UploadFile = File(..., description="Image file to resize"),
    width: int | None = Form(None, description="Target width in pixels (optional)"),
    height: int | None = Form(None, description="Target height in pixels (optional)"),
    maintain_aspect_ratio: bool = Form(True, description="Maintain aspect ratio when resizing"),
    resample: str = Form(
        "lanczos", description="Resampling algorithm (nearest, bilinear, bicubic, lanczos)"
    ),
):
    """
    Resize an image to specified dimensions

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    At least one dimension (width or height) must be specified
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    # Validate that at least one dimension is provided
    if width is None and height is None:
        raise HTTPException(
            status_code=400, detail="At least one dimension (width or height) must be specified"
        )

    # Validate dimensions are positive
    if width is not None and width <= 0:
        raise HTTPException(status_code=400, detail="Width must be a positive integer")
    if height is not None and height <= 0:
        raise HTTPException(status_code=400, detail="Height must be a positive integer")

    # Validate resample algorithm
    valid_resamples = ["nearest", "bilinear", "bicubic", "lanczos"]
    if resample.lower() not in valid_resamples:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid resample algorithm. Supported: {', '.join(valid_resamples)}",
        )

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"resized_{file.filename}")
        output_path = TEMP_DIR / output_filename

        # Resize image
        result = resize_image(
            input_path,
            output_path,
            width=width,
            height=height,
            maintain_aspect_ratio=maintain_aspect_ratio,
            resample=resample.lower(),
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/adjust", response_model=ImageProcessingResponse)
async def adjust_image_endpoint(
    file: UploadFile = File(..., description="Image file to adjust"),
    brightness: float = Form(1.0, description="Brightness factor (0.1 - 3.0, 1.0 = original)"),
    contrast: float = Form(1.0, description="Contrast factor (0.1 - 3.0, 1.0 = original)"),
    saturation: float = Form(1.0, description="Saturation factor (0.1 - 3.0, 1.0 = original)"),
):
    """
    Adjust brightness, contrast, and saturation of an image.

    Supported formats: JPG, JPEG, PNG, GIF, BMP, WEBP
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    # Validate factors
    for value, name in [
        (brightness, "brightness"),
        (contrast, "contrast"),
        (saturation, "saturation"),
    ]:
        if value <= 0 or value > 3:
            raise HTTPException(
                status_code=400, detail=f"{name} must be greater than 0 and at most 3.0"
            )

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        output_filename = generate_unique_filename(f"adjusted_{file.filename}")
        output_path = TEMP_DIR / output_filename

        # Adjust image
        result = adjust_image(
            input_path,
            output_path,
            brightness=brightness,
            contrast=contrast,
            saturation=saturation,
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/filters", response_model=ImageProcessingResponse)
async def filter_image_endpoint(
    file: UploadFile = File(..., description="Image file to filter"),
    filter_name: str = Form(
        ..., description="Filter to apply (grayscale, sepia, blur, sharpen, invert)"
    ),
):
    """
    Apply a visual filter to an image.
    """
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    supported_filters = {"grayscale", "sepia", "blur", "sharpen", "invert"}
    if filter_name.lower() not in supported_filters:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported filter. Supported: {', '.join(sorted(supported_filters))}",
        )

    input_path = None
    output_path = None

    try:
        input_path = await save_upload_file(file)
        output_filename = generate_unique_filename(f"filtered_{file.filename}")
        output_path = TEMP_DIR / output_filename

        result = apply_filter(input_path, output_path, filter_name)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result
    finally:
        if input_path:
            delete_file(input_path)
