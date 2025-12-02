"""
Tests for HTML minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_html():
    """Test minifying HTML code"""
    payload = {
        "html": "<div>\n  <h1>Title</h1>\n  <p>Paragraph</p>\n</div>",
    }
    response = client.post("/api/v1/html-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_html" in data
    assert data["minified_length"] <= data["original_length"]


def test_minify_html_empty():
    """Test minifying empty HTML"""
    payload = {"html": ""}
    response = client.post("/api/v1/html-minifier/minify", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_minify_html_with_comments():
    """Test minifying HTML with comments"""
    payload = {
        "html": "<div><!-- Comment --><p>Text</p></div>",
    }
    response = client.post("/api/v1/html-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "<!--" not in data["minified_html"]
