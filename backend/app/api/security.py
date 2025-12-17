"""
API routes for security features (file encryption/decryption)
"""

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.encryption import EncryptionResponse
from app.services.encryption_service import decrypt_file, encrypt_file
from app.utils.file_handler import delete_file, generate_unique_filename, save_upload_file

router = APIRouter(prefix="/security", tags=["Security"])


@router.post("/encrypt", response_model=EncryptionResponse)
async def encrypt_file_endpoint(
    file: UploadFile = File(..., description="File to encrypt"),
    password: str = Form(default="", description="Password for encryption"),
):
    """
    Encrypt a file using AES-256 encryption

    Supported formats: Any file type
    Output: Encrypted file (.encrypted extension)
    """
    if not password or len(password.strip()) < 1:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}.encrypted")
        output_path = TEMP_DIR / output_filename

        # Encrypt file
        result = encrypt_file(input_path, output_path, password)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/decrypt", response_model=EncryptionResponse)
async def decrypt_file_endpoint(
    file: UploadFile = File(..., description="Encrypted file to decrypt"),
    password: str = Form(default="", description="Password for decryption"),
):
    """
    Decrypt a file that was encrypted with the encrypt endpoint

    Supported formats: Files encrypted with /security/encrypt
    Output: Decrypted file (original format)
    """
    if not password or len(password.strip()) < 1:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        # Try to determine original extension from filename
        base_name = Path(file.filename).stem
        # Remove .encrypted if present
        if base_name.endswith(".encrypted"):
            base_name = base_name[:-10]
        output_filename = generate_unique_filename(f"{base_name}_decrypted")
        output_path = TEMP_DIR / output_filename

        # Decrypt file
        result = decrypt_file(input_path, output_path, password)

        if not result.success:
            # Check if it's a password error (client error) or server error
            message_lower = result.message.lower()
            if "incorrect password" in message_lower or "password cannot be empty" in message_lower:
                raise HTTPException(status_code=400, detail=result.message)
            # For other errors (corrupted file, etc.), use 422 (Unprocessable Entity)
            raise HTTPException(status_code=422, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)
