"""
Tests for JSON data generator API endpoints
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


def test_generate_json_data_endpoint_success():
    """Test successful JSON data generation via API"""
    import json

    payload = {
        "template": json.dumps({"id": "{{regex:\\d{1,3}}}", "name": "{{regex:[A-Z][a-z]+}}"}),
        "iterations": 3,
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] == 3
    assert len(data["generated_data"]) == 3


def test_generate_json_data_endpoint_invalid_json():
    """Test with invalid JSON template via API"""
    payload = {
        "template": '{"invalid": json}',
        "iterations": 1,
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid JSON template" in data["detail"]


def test_generate_json_data_endpoint_invalid_iterations():
    """Test with invalid iterations count"""
    import json

    payload = {
        "template": json.dumps({"id": "{{regex:\\d{1,3}}}"}),
        "iterations": 0,
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 422  # Validation error


def test_generate_json_data_endpoint_too_many_iterations():
    """Test with too many iterations"""
    import json

    payload = {
        "template": json.dumps({"id": "{{regex:\\d{1,3}}}"}),
        "iterations": 2000,
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 422  # Validation error


def test_generate_json_data_endpoint_missing_fields():
    """Test with missing required fields"""
    import json

    payload = {
        "template": json.dumps({"id": "{{regex:\\d{1,3}}}"}),
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 422  # Validation error


def test_generate_json_data_endpoint_complex_template():
    """Test with complex nested template"""
    import json

    template = json.dumps({"user": {"id": "{{regex:\\d{1,5}}}", "name": "{{regex:[A-Z][a-z]+}}"}})
    payload = {
        "template": template,
        "iterations": 5,
    }
    response = client.post("/api/v1/json-data-generator/generate", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] == 5
    assert len(data["generated_data"]) == 5
