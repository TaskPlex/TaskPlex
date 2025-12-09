from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_hash_default():
    response = client.post("/api/v1/hash/generate", json={"text": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["algorithm"] == "sha256"
    assert len(data["hex_digest"]) > 0
    assert len(data["base64_digest"]) > 0


def test_generate_hash_upper_md5():
    response = client.post(
        "/api/v1/hash/generate",
        json={"text": "hello", "algorithm": "md5", "uppercase": True, "salt": "s"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "md5"
    assert data["hex_digest"].isupper()
    assert data["salt_used"] == "s"


def test_generate_hash_invalid_algo():
    response = client.post("/api/v1/hash/generate", json={"text": "hello", "algorithm": "foo"})
    assert response.status_code == 400
