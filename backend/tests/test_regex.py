"""
Basic tests for regex validation endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_regex_validation_success():
    """Test successful regex validation"""
    payload = {
        "pattern": r"^\d{3}-\d{2}-\d{4}$",
        "test_strings": ["123-45-6789", "invalid", "987-65-4321"],
    }
    response = client.post("/api/v1/regex/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["valid_pattern"] is True
    assert len(data["results"]) == 3
    assert data["results"][0]["matched"] is True
    assert data["results"][1]["matched"] is False
    assert data["results"][2]["matched"] is True


def test_regex_validation_invalid_pattern():
    """Test validation with invalid regex pattern"""
    payload = {"pattern": r"[invalid(regex", "test_strings": ["test"]}
    response = client.post("/api/v1/regex/validate", json=payload)
    assert response.status_code == 400


def test_regex_validation_with_flags():
    """Test regex validation with flags"""
    payload = {
        "pattern": r"^hello$",
        "test_strings": ["HELLO", "hello", "Hello"],
        "flags": "i",
    }
    response = client.post("/api/v1/regex/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # With case-insensitive flag, all should match
    assert all(result["matched"] for result in data["results"])
