"""
Tests for slug generator API endpoints
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_slug_endpoint_success():
    """Test successful slug generation via API"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": "Mon Super Article !"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["slug"] == "mon-super-article"
    assert data["original_text"] == "Mon Super Article !"


def test_generate_slug_endpoint_with_accents():
    """Test slug generation with accented characters via API"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": "Café & Restaurant"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["slug"] == "cafe-restaurant"


def test_generate_slug_endpoint_empty_text():
    """Test that empty text returns 400 error"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": ""})
    assert resp.status_code == 400
    data = resp.json()
    assert "empty" in data["detail"].lower()


def test_generate_slug_endpoint_whitespace_only():
    """Test that whitespace-only text returns 400 error"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": "   "})
    assert resp.status_code == 400
    data = resp.json()
    assert "empty" in data["detail"].lower()


def test_generate_slug_endpoint_with_numbers():
    """Test slug generation with numbers via API"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": "Hello World 2024"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["slug"] == "hello-world-2024"


def test_generate_slug_endpoint_special_characters():
    """Test slug generation with special characters via API"""
    resp = client.post("/api/v1/slug-generator/generate", json={"text": "Hello @World #2024!"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "@" not in data["slug"]
    assert "#" not in data["slug"]
    assert "!" not in data["slug"]
    assert data["slug"] == "hello-world-2024"
