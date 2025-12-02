"""
Tests for JSON minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_json():
    """Test minifying JSON"""
    payload = {
        "json": '{\n  "name": "John",\n  "age": 30\n}',
    }
    response = client.post("/api/v1/json-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_json" in data
    assert "\n" not in data["minified_json"]  # Should be minified (no newlines)
    assert data["minified_length"] < data["original_length"]


def test_minify_json_invalid():
    """Test minifying invalid JSON"""
    payload = {"json": '{"name":"John",}'}
    response = client.post("/api/v1/json-minifier/minify", json=payload)
    assert response.status_code == 400


def test_json_empty():
    """Test processing empty JSON"""
    payload = {"json": ""}
    response = client.post("/api/v1/json-minifier/minify", json=payload)
    assert response.status_code == 400
