from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_validate_html_success():
    payload = {"html": "<div><p>Hello</p></div>"}
    response = client.post("/api/v1/html-validator/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["valid"] is True
    assert data["errors"] == []


def test_validate_html_invalid_structure():
    payload = {"html": "<div><span>Test</div>"}
    response = client.post("/api/v1/html-validator/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["valid"] is False
    assert len(data["errors"]) >= 1


def test_validate_html_empty_input():
    payload = {"html": ""}
    response = client.post("/api/v1/html-validator/validate", json=payload)
    # Pydantic validation triggers 422 on empty required field
    assert response.status_code == 422
