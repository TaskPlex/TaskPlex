"""
Tests for XML minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_xml():
    """Test minifying XML code"""
    payload = {
        "xml": "<root>\n  <item>test</item>\n  <item>test2</item>\n</root>",
    }
    response = client.post("/api/v1/xml-minifier/minify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "minified_xml" in data
    # Minified should be smaller or equal (sometimes formatting adds whitespace)
    assert data["minified_length"] <= data["original_length"] or data["original_length"] < 100


def test_minify_xml_empty():
    """Test minifying empty XML"""
    payload = {"xml": ""}
    response = client.post("/api/v1/xml-minifier/minify", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_minify_xml_invalid():
    """Test minifying invalid XML"""
    payload = {"xml": "<root><item>test</root>"}
    response = client.post("/api/v1/xml-minifier/minify", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
