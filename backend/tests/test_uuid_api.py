from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_uuid_generate_success():
    resp = client.post("/api/v1/uuid/generate", json={"count": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["uuids"]) == 2


def test_uuid_generate_invalid_version():
    resp = client.post("/api/v1/uuid/generate", json={"version": "v1"})
    assert resp.status_code == 400
