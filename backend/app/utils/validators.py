"""
Validation utilities for file formats and inputs
"""

from pathlib import Path
from typing import List

from app.config import (
    SUPPORTED_IMAGE_FORMATS,
    SUPPORTED_PDF_FORMAT,
    SUPPORTED_VIDEO_FORMATS,
)


def validate_file_format(filename: str, allowed_formats: List[str]) -> bool:
    """
    Validate if a file has an allowed format

    Args:
        filename: Name of the file to validate
        allowed_formats: List of allowed file extensions

    Returns:
        True if file format is allowed, False otherwise
    """
    file_extension = Path(filename).suffix.lower().lstrip(".")
    return file_extension in [fmt.lower() for fmt in allowed_formats]


def validate_video_format(filename: str) -> bool:
    """Validate if a file is a supported video format"""
    return validate_file_format(filename, SUPPORTED_VIDEO_FORMATS)


def validate_image_format(filename: str) -> bool:
    """Validate if a file is a supported image format"""
    return validate_file_format(filename, SUPPORTED_IMAGE_FORMATS)


def validate_pdf_format(filename: str) -> bool:
    """Validate if a file is a PDF"""
    return validate_file_format(filename, SUPPORTED_PDF_FORMAT)


def get_file_extension(filename: str) -> str:
    """
    Get file extension without the dot

    Args:
        filename: Name of the file

    Returns:
        File extension in lowercase
    """
    return Path(filename).suffix.lower().lstrip(".")


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Remove any path components
    filename = Path(filename).name

    # Replace potentially dangerous characters
    dangerous_chars = ["..", "/", "\\", "\0"]
    for char in dangerous_chars:
        filename = filename.replace(char, "_")

    return filename
