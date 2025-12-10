"""
Tests for QR code reader API endpoints
"""

import io
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image
import pytest
import qrcode

from app.main import app

client = TestClient(app)


def create_test_qr_image_bytes(data: str) -> bytes:
    """Helper function to create a test QR code image as bytes"""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return img_bytes.getvalue()


def test_read_qrcode_endpoint_success():
    """Test successful QR code reading via API"""
    test_data = "https://example.com"
    qr_image_bytes = create_test_qr_image_bytes(test_data)

    response = client.post(
        "/api/v1/qrcode/read",
        files={"file": ("test_qr.png", qr_image_bytes, "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == test_data
    assert data["qr_type"] == "QRCODE"


def test_read_qrcode_endpoint_text_data():
    """Test reading QR code with text data via API"""
    test_data = "Hello, World! This is a test."
    qr_image_bytes = create_test_qr_image_bytes(test_data)

    response = client.post(
        "/api/v1/qrcode/read",
        files={"file": ("test_qr.png", qr_image_bytes, "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == test_data


def test_read_qrcode_endpoint_no_qr_code():
    """Test reading an image without QR code via API"""
    # Create a simple image without QR code
    img = Image.new("RGB", (200, 200), color="white")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    response = client.post(
        "/api/v1/qrcode/read",
        files={"file": ("test_no_qr.png", img_bytes.getvalue(), "image/png")},
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "No QR code found" in data["detail"]


def test_read_qrcode_endpoint_invalid_format():
    """Test reading with invalid file format"""
    response = client.post(
        "/api/v1/qrcode/read",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Unsupported image format" in data["detail"]


def test_read_qrcode_endpoint_no_file():
    """Test reading without file"""
    response = client.post("/api/v1/qrcode/read")

    assert response.status_code == 422  # Validation error
