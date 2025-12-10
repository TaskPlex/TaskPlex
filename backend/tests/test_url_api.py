from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_url_encode_endpoint_success():
    resp = client.post("/api/v1/url/encode", json={"text": "hello world"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["result"] == "hello%20world"


def test_url_decode_endpoint_success():
    resp = client.post("/api/v1/url/decode", json={"text": "hello%20world"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["result"] == "hello world"
