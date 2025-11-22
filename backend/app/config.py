"""
Configuration module for AnyTools API
Handles environment variables and global settings
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# File upload limits
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100)) * 1024 * 1024  # Convert MB to bytes

# Temporary file storage
TEMP_DIR = Path(os.getenv("TEMP_DIR", BASE_DIR / "temp"))
TEMP_FILE_CLEANUP_MINUTES = int(
    os.getenv("TEMP_FILE_CLEANUP_MINUTES", 10)
)  # Files kept for 10 minutes

# Create temp directory if it doesn't exist
TEMP_DIR.mkdir(exist_ok=True)

# API Configuration
API_TITLE = os.getenv("API_TITLE", "AnyTools API")
API_VERSION = os.getenv("API_VERSION", "1.0.0")
API_DESCRIPTION = os.getenv(
    "API_DESCRIPTION", "Multi-purpose API for file processing and utilities"
)

# Supported formats
SUPPORTED_VIDEO_FORMATS = ["mp4", "avi", "mov", "mkv", "flv", "wmv"]
SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "bmp", "webp"]
SUPPORTED_PDF_FORMAT = ["pdf"]

# Video compression presets
VIDEO_COMPRESSION_PRESETS = {
    "low": {"crf": 28, "preset": "fast"},
    "medium": {"crf": 23, "preset": "medium"},
    "high": {"crf": 18, "preset": "slow"},
}

# Image compression quality
IMAGE_COMPRESSION_QUALITY = {
    "low": 50,
    "medium": 75,
    "high": 90,
}
