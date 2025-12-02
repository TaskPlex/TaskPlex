"""
Tests for JSON formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_json():
    """Test formatting JSON"""
    payload = {
        "json": '{"name":"John","age":30}',
        "indent_size": 2,
    }
    response = client.post("/api/v1/json-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "result" in data
    assert "\n" in data["result"]  # Should be formatted with newlines


def test_format_json_invalid():
    """Test formatting invalid JSON"""
    payload = {"json": '{"name":"John",}', "indent_size": 2}
    response = client.post("/api/v1/json-formatter/format", json=payload)
    assert response.status_code == 400


def test_json_empty():
    """Test processing empty JSON"""
    payload = {"json": "", "indent_size": 2}
    response = client.post("/api/v1/json-formatter/format", json=payload)
    assert response.status_code == 400
