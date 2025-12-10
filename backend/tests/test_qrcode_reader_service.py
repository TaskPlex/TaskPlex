"""
Tests for QR code reader service
"""

import io
from pathlib import Path

from PIL import Image
import pytest
import qrcode

from app.config import TEMP_DIR
from app.services.qrcode_reader_service import read_qrcode


def create_test_qr_image(data: str) -> Path:
    """Helper function to create a test QR code image"""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to temporary file
    filename = f"test_qr_{hash(data)}.png"
    file_path = TEMP_DIR / filename
    img.save(file_path, "PNG")

    return file_path


def test_read_qrcode_success():
    """Test successful QR code reading"""
    test_data = "https://example.com"
    qr_path = create_test_qr_image(test_data)

    try:
        result = read_qrcode(qr_path)

        assert result.success is True
        assert result.data == test_data
        assert result.qr_type == "QRCODE"
        assert result.message == "QR code read successfully"
    finally:
        if qr_path.exists():
            qr_path.unlink()


def test_read_qrcode_text_data():
    """Test reading QR code with text data"""
    test_data = "Hello, World!"
    qr_path = create_test_qr_image(test_data)

    try:
        result = read_qrcode(qr_path)

        assert result.success is True
        assert result.data == test_data
    finally:
        if qr_path.exists():
            qr_path.unlink()


def test_read_qrcode_url():
    """Test reading QR code with URL"""
    test_data = "https://github.com/TaskPlex/TaskPlex"
    qr_path = create_test_qr_image(test_data)

    try:
        result = read_qrcode(qr_path)

        assert result.success is True
        assert result.data == test_data
    finally:
        if qr_path.exists():
            qr_path.unlink()


def test_read_qrcode_no_qr_code():
    """Test reading an image without QR code"""
    # Create a simple image without QR code
    img = Image.new("RGB", (200, 200), color="white")
    file_path = TEMP_DIR / "test_no_qr.png"
    img.save(file_path, "PNG")

    try:
        result = read_qrcode(file_path)

        assert result.success is False
        assert "No QR code found" in result.message
        assert result.data is None
    finally:
        if file_path.exists():
            file_path.unlink()


def test_read_qrcode_invalid_file():
    """Test reading a non-existent file"""
    file_path = Path("/nonexistent/file.png")

    result = read_qrcode(file_path)

    assert result.success is False
    assert "Error reading QR code" in result.message
