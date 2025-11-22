"""
File handling utilities for upload, download, and temporary file management
"""

from datetime import datetime, timedelta
from pathlib import Path
import shutil
import uuid

from fastapi import UploadFile

from app.config import TEMP_DIR, TEMP_FILE_CLEANUP_MINUTES


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename while preserving the extension

    Args:
        original_filename: Original name of the file

    Returns:
        Unique filename with UUID prefix
    """
    extension = Path(original_filename).suffix
    unique_id = uuid.uuid4().hex[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = Path(original_filename).stem

    return f"{timestamp}_{unique_id}_{name}{extension}"


async def save_upload_file(upload_file: UploadFile, custom_filename: str = None) -> Path:
    """
    Save an uploaded file to the temporary directory

    Args:
        upload_file: FastAPI UploadFile object
        custom_filename: Optional custom filename to use

    Returns:
        Path to the saved file
    """
    filename = custom_filename or generate_unique_filename(upload_file.filename)
    file_path = TEMP_DIR / filename

    # Write file in chunks to handle large files
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


def save_processed_file(content: bytes, original_filename: str, suffix: str = "_processed") -> Path:
    """
    Save processed file content to temporary directory

    Args:
        content: File content as bytes
        original_filename: Original filename for reference
        suffix: Suffix to add before extension

    Returns:
        Path to the saved file
    """
    name = Path(original_filename).stem
    extension = Path(original_filename).suffix
    filename = f"{name}{suffix}{extension}"
    unique_filename = generate_unique_filename(filename)
    file_path = TEMP_DIR / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path


def cleanup_temp_files():
    """
    Clean up temporary files older than TEMP_FILE_CLEANUP_MINUTES
    Should be called periodically
    """
    if not TEMP_DIR.exists():
        return

    cutoff_time = datetime.now() - timedelta(minutes=TEMP_FILE_CLEANUP_MINUTES)

    for file_path in TEMP_DIR.iterdir():
        if file_path.is_file():
            file_modified = datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_modified < cutoff_time:
                try:
                    file_path.unlink()
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")


def delete_file(file_path: Path):
    """
    Delete a specific file

    Args:
        file_path: Path to the file to delete
    """
    try:
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")


def get_file_size(file_path: Path) -> int:
    """
    Get file size in bytes

    Args:
        file_path: Path to the file

    Returns:
        File size in bytes
    """
    return file_path.stat().st_size if file_path.exists() else 0


def calculate_compression_ratio(original_size: int, compressed_size: int) -> float:
    """
    Calculate compression ratio as a percentage

    Args:
        original_size: Original file size in bytes
        compressed_size: Compressed file size in bytes

    Returns:
        Compression ratio (percentage saved)
    """
    if original_size == 0:
        return 0.0
    return ((original_size - compressed_size) / original_size) * 100
