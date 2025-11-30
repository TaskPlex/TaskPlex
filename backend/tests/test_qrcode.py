"""
Tests for QR code generation endpoint
"""

from pathlib import Path

from fastapi.testclient import TestClient

from app.config import TEMP_DIR
from app.main import app

client = TestClient(app)


def test_generate_qrcode_basic():
    """Test basic QR code generation"""
    payload = {"data": "https://example.com"}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["qr_code_url"] is not None
    assert data["filename"] is not None
    assert data["filename"].endswith(".png")

    # Verify file exists
    file_path = TEMP_DIR / data["filename"]
    assert file_path.exists()


def test_generate_qrcode_text():
    """Test QR code generation with plain text"""
    payload = {"data": "Hello, World!"}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["qr_code_url"] is not None


def test_generate_qrcode_custom_size():
    """Test QR code generation with custom size"""
    payload = {"data": "Test data", "size": 20, "border": 2}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_generate_qrcode_error_correction_levels():
    """Test QR code generation with different error correction levels"""
    levels = ["L", "M", "Q", "H"]
    for level in levels:
        payload = {"data": f"Test with level {level}", "error_correction": level}
        response = client.post("/api/v1/qrcode/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


def test_generate_qrcode_empty_data():
    """Test QR code generation with empty data (should fail validation)"""
    payload = {"data": ""}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 422  # Validation error


def test_generate_qrcode_missing_data():
    """Test QR code generation without data field"""
    payload = {}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 422  # Validation error


def test_generate_qrcode_invalid_size():
    """Test QR code generation with invalid size"""
    payload = {"data": "Test", "size": 100}  # Size too large
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 422  # Validation error


def test_generate_qrcode_invalid_border():
    """Test QR code generation with invalid border"""
    payload = {"data": "Test", "border": 20}  # Border too large
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 422  # Validation error


def test_generate_qrcode_invalid_error_correction():
    """Test QR code generation with invalid error correction level"""
    payload = {"data": "Test", "error_correction": "X"}  # Invalid level
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 422  # Validation error


def test_generate_qrcode_long_data():
    """Test QR code generation with long data string"""
    long_data = "A" * 1000  # Long string
    payload = {"data": long_data}
    response = client.post("/api/v1/qrcode/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
