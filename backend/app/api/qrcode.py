"""
QR Code generation and reading API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.qrcode import (
    QRCodeReadResponse,
    QRCodeRequest,
    QRCodeResponse,
)
from app.services.qrcode_reader_service import read_qrcode
from app.services.qrcode_service import generate_qrcode
from app.utils.file_handler import delete_file, save_upload_file
from app.utils.validators import validate_image_format

router = APIRouter(prefix="/qrcode", tags=["QR Code"])


@router.post("/generate", response_model=QRCodeResponse)
async def generate_qrcode_endpoint(request: QRCodeRequest):
    """
    Generate a QR code from text data

    - **data**: Text or URL to encode in QR code
    - **size**: Size of each box in pixels (default: 10, range: 1-50)
    - **border**: Border size in boxes (default: 4, range: 0-10)
    - **error_correction**: Error correction level - L (Low), M (Medium), Q (Quartile), H (High) (default: M)
    """
    result = generate_qrcode(
        data=request.data,
        size=request.size or 10,
        border=request.border or 4,
        error_correction=request.error_correction or "M",
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@router.post("/read", response_model=QRCodeReadResponse)
async def read_qrcode_endpoint(
    file: UploadFile = File(..., description="Image file containing QR code"),
):
    """
    Read QR code data from an image file

    - **file**: Image file containing QR code (JPG, PNG, GIF, BMP, WEBP)

    Returns decoded QR code data
    """
    # Validate file format
    if not validate_image_format(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    input_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Read QR code
        result = read_qrcode(input_path)

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)
