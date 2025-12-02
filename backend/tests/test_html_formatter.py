"""
Tests for HTML formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_html():
    """Test formatting HTML code"""
    payload = {
        "html": "<div class='container'><h1>Title</h1><p>Paragraph</p></div>",
        "indent_size": 2,
    }
    response = client.post("/api/v1/html-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "formatted_html" in data
    assert "\n" in data["formatted_html"]


def test_format_html_empty():
    """Test formatting empty HTML"""
    payload = {"html": ""}
    response = client.post("/api/v1/html-formatter/format", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_format_html_custom_indent():
    """Test formatting HTML with custom indentation"""
    payload = {
        "html": "<div><p>Test</p></div>",
        "indent_size": 4,
        "indent_char": " ",
    }
    response = client.post("/api/v1/html-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
