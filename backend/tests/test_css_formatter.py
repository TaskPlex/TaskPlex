"""
Tests for CSS formatter endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_format_css():
    """Test formatting CSS code"""
    payload = {
        "css": ".container{width:100%;padding:20px;margin:0}",
        "indent_size": 2,
    }
    response = client.post("/api/v1/css-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "formatted_css" in data
    assert "\n" in data["formatted_css"]


def test_format_css_empty():
    """Test formatting empty CSS"""
    payload = {"css": ""}
    response = client.post("/api/v1/css-formatter/format", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_format_css_custom_indent():
    """Test formatting CSS with custom indentation"""
    payload = {
        "css": ".header{background:#fff;color:#000}",
        "indent_size": 4,
        "indent_char": " ",
    }
    response = client.post("/api/v1/css-formatter/format", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
