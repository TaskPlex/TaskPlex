"""
Tests for JavaScript formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_javascript():
    """Test formatting JavaScript code"""
    payload = {
        "javascript": "function test(){console.log('hello');}",
        "indent_size": 2,
    }
    response = client.post("/api/v1/js-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "formatted_js" in data
    assert "\n" in data["formatted_js"]


def test_format_javascript_empty():
    """Test formatting empty JavaScript"""
    payload = {"javascript": ""}
    response = client.post("/api/v1/js-formatter/format", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_format_javascript_custom_options():
    """Test formatting JavaScript with custom options"""
    payload = {
        "javascript": "const x=1;const y=2;",
        "indent_size": 4,
        "indent_char": " ",
        "wrap_line_length": 80,
    }
    response = client.post("/api/v1/js-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
