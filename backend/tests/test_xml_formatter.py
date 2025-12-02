"""
Tests for XML formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_xml():
    """Test formatting XML"""
    payload = {
        "xml": "<root><item>test</item></root>",
        "indent_size": 2,
    }
    response = client.post("/api/v1/xml-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "result" in data
    assert "\n" in data["result"]  # Should be formatted with newlines


def test_format_xml_invalid():
    """Test formatting invalid XML"""
    payload = {"xml": "<root><item>test</root>", "indent_size": 2}
    response = client.post("/api/v1/xml-formatter/format", json=payload)
    assert response.status_code == 400


def test_xml_empty():
    """Test processing empty XML"""
    payload = {"xml": "", "indent_size": 2}
    response = client.post("/api/v1/xml-formatter/format", json=payload)
    assert response.status_code == 400
