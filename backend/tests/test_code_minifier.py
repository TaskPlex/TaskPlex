"""
Tests for code minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_json():
    """Test minifying JSON code"""
    payload = {
        "code": '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}',
        "language": "json",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_code" in data
    assert data["minified_length"] < data["original_length"]


def test_minify_json_auto():
    """Test minifying JSON with auto-detect"""
    payload = {
        "code": '{\n  "name": "John",\n  "age": 30\n}',
        "language": "auto",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_minify_css():
    """Test minifying CSS code"""
    payload = {
        "code": ".container {\n  width: 100%;\n  padding: 20px;\n}",
        "language": "css",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_code" in data


def test_minify_javascript():
    """Test minifying JavaScript code"""
    payload = {
        "code": "function test() {\n  console.log('hello');\n}",
        "language": "javascript",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_code" in data


def test_minify_html():
    """Test minifying HTML code"""
    payload = {
        "code": "<div>\n  <h1>Title</h1>\n  <p>Paragraph</p>\n</div>",
        "language": "html",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_code" in data


def test_minify_xml():
    """Test minifying XML code"""
    payload = {
        "code": "<root>\n  <item>test</item>\n</root>",
        "language": "xml",
    }
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_code" in data


def test_minify_empty():
    """Test minifying empty code"""
    payload = {"code": "", "language": "auto"}
    response = client.post("/api/v1/code-minifier/minify", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
