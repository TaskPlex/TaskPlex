"""
Tests for number converter API endpoints
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_convert_number_endpoint_binary_to_decimal():
    """Test converting binary to decimal via API"""
    response = client.post(
        "/api/v1/number-converter/convert",
        json={"number": "1010", "from_base": "binary", "to_base": "decimal"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_number"] == "10"
    assert data["converted_base"] == "decimal"


def test_convert_number_endpoint_decimal_to_hexadecimal():
    """Test converting decimal to hexadecimal via API"""
    response = client.post(
        "/api/v1/number-converter/convert",
        json={"number": "255", "from_base": "decimal", "to_base": "hexadecimal"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_number"] == "FF"
    assert data["converted_base"] == "hexadecimal"


def test_convert_number_endpoint_invalid_number():
    """Test with invalid number via API"""
    response = client.post(
        "/api/v1/number-converter/convert",
        json={"number": "102", "from_base": "binary", "to_base": "decimal"},
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid binary" in data["detail"]


def test_convert_number_endpoint_missing_fields():
    """Test with missing fields"""
    response = client.post(
        "/api/v1/number-converter/convert",
        json={"number": "42"},
    )

    assert response.status_code == 422  # Validation error


def test_convert_number_endpoint_octal_to_binary():
    """Test converting octal to binary via API"""
    response = client.post(
        "/api/v1/number-converter/convert",
        json={"number": "777", "from_base": "octal", "to_base": "binary"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_number"] == "111111111"
    assert data["converted_base"] == "binary"
