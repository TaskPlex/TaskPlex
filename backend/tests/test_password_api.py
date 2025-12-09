from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_password_endpoint_success():
    response = client.post("/api/v1/password/generate", json={"length": 12})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["password"]) == 12


def test_generate_password_endpoint_no_charset():
    response = client.post(
        "/api/v1/password/generate",
        json={
            "include_lowercase": False,
            "include_uppercase": False,
            "include_digits": False,
            "include_symbols": False,
        },
    )
    assert response.status_code == 400


def test_check_password_endpoint():
    response = client.post("/api/v1/password/check", json={"password": "Test123!"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "strength" in data
