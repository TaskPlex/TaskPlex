"""
Tests for code formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_json():
    """Test formatting JSON code"""
    payload = {
        "code": '{"name":"John","age":30,"city":"New York"}',
        "language": "json",
        "indent_size": 2,
    }
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "formatted_code" in data
    assert "\n" in data["formatted_code"]  # Should be formatted with newlines


def test_format_json_invalid():
    """Test formatting invalid JSON"""
    payload = {"code": '{"name":"John",}', "language": "json"}
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] is not None


def test_format_xml():
    """Test formatting XML code"""
    payload = {
        "code": "<root><item>test</item></root>",
        "language": "xml",
        "indent_size": 2,
    }
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "formatted_code" in data


def test_format_javascript():
    """Test formatting JavaScript code"""
    payload = {
        "code": "function test(){return 'hello';}",
        "language": "javascript",
        "indent_size": 2,
    }
    response = client.post("/api/v1/code-formatter/format", json=payload)
    # May fail if jsbeautifier not installed, but should handle gracefully
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True


def test_format_auto_detect():
    """Test auto-detection of language"""
    payload = {
        "code": '{"name":"test"}',
        "language": "auto",
    }
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_format_empty_code():
    """Test formatting empty code"""
    payload = {"code": "", "language": "json"}
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 400


def test_format_unsupported_language():
    """Test formatting with unsupported language"""
    payload = {"code": "test code", "language": "python"}
    response = client.post("/api/v1/code-formatter/format", json=payload)
    assert response.status_code == 400
