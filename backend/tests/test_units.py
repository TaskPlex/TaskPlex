"""
Basic tests for unit conversion endpoint
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_length_conversion():
    """Test length unit conversion"""
    payload = {"value": 100, "from_unit": "meter", "to_unit": "feet"}
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["original_value"] == 100
    assert data["original_unit"] == "meter"
    assert data["converted_unit"] == "feet"
    assert data["converted_value"] > 0


def test_temperature_conversion():
    """Test temperature unit conversion"""
    # Pint uses 'degC' or 'degree_Celsius' sometimes, but let's try standard names first
    # If 400, it means Pint raised an error.
    # Note: Offset units (like temperature) require Quantity(value, unit) constructor in new Pint versions,
    # but multiplication works for delta. For absolute temp, it's tricky.

    payload = {"value": 100, "from_unit": "degC", "to_unit": "degF"}
    response = client.post("/api/v1/units/convert", json=payload)

    if response.status_code != 200:
        print(f"Error response: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_value"] == pytest.approx(212.0)  # 100°C = 212°F


def test_mass_conversion():
    """Test mass unit conversion"""
    payload = {"value": 1, "from_unit": "kilogram", "to_unit": "pound"}
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_value"] > 2  # 1 kg ≈ 2.2 lbs


def test_incompatible_units():
    """Test conversion between incompatible units"""
    payload = {"value": 100, "from_unit": "meter", "to_unit": "kilogram"}
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 400


def test_invalid_unit():
    """Test conversion with invalid unit"""
    payload = {"value": 100, "from_unit": "invalid_unit", "to_unit": "meter"}
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 400
