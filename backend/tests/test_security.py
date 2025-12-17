"""
Integration tests for security API endpoints
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_encrypt_file_success(client, sample_text_file):
    """Test encrypting a file via API"""
    with open(sample_text_file, "rb") as f:
        response = client.post(
            "/api/v1/security/encrypt",
            files={"file": ("test.txt", f, "text/plain")},
            data={"password": "test_password_123"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"].endswith(".encrypted")
    assert "download_url" in data
    assert data["original_size"] is not None
    assert data["processed_size"] is not None


def test_encrypt_file_empty_password(client, sample_text_file):
    """Test encrypting with empty password"""
    with open(sample_text_file, "rb") as f:
        response = client.post(
            "/api/v1/security/encrypt",
            files={"file": ("test.txt", f, "text/plain")},
            data={"password": ""},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Password cannot be empty" in data.get("detail", "")


def test_decrypt_file_success(client, tmp_path):
    """Test decrypting a file via API"""
    from pathlib import Path

    from app.services.encryption_service import encrypt_file

    # First create an encrypted file
    input_file = tmp_path / "test.txt"
    encrypted_file = tmp_path / "test.encrypted"

    with open(input_file, "wb") as f:
        f.write(b"Hello, World!")

    encrypt_result = encrypt_file(input_file, encrypted_file, "test_password")
    assert encrypt_result.success is True

    # Now decrypt via API
    with open(encrypted_file, "rb") as f:
        response = client.post(
            "/api/v1/security/decrypt",
            files={"file": ("test.encrypted", f, "application/octet-stream")},
            data={"password": "test_password"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "download_url" in data
    assert data["original_size"] is not None
    assert data["processed_size"] is not None


def test_decrypt_file_wrong_password(client, tmp_path):
    """Test decrypting with wrong password"""
    from app.services.encryption_service import encrypt_file

    # First create an encrypted file
    input_file = tmp_path / "test.txt"
    encrypted_file = tmp_path / "test.encrypted"

    with open(input_file, "wb") as f:
        f.write(b"Hello, World!")

    encrypt_result = encrypt_file(input_file, encrypted_file, "correct_password")
    assert encrypt_result.success is True

    # Try to decrypt with wrong password
    with open(encrypted_file, "rb") as f:
        response = client.post(
            "/api/v1/security/decrypt",
            files={"file": ("test.encrypted", f, "application/octet-stream")},
            data={"password": "wrong_password"},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Incorrect password" in data.get("detail", "")


def test_decrypt_file_empty_password(client, tmp_path):
    """Test decrypting with empty password"""
    from app.services.encryption_service import encrypt_file

    # First create an encrypted file
    input_file = tmp_path / "test.txt"
    encrypted_file = tmp_path / "test.encrypted"

    with open(input_file, "wb") as f:
        f.write(b"Hello, World!")

    encrypt_result = encrypt_file(input_file, encrypted_file, "test_password")
    assert encrypt_result.success is True

    # Try to decrypt with empty password
    with open(encrypted_file, "rb") as f:
        response = client.post(
            "/api/v1/security/decrypt",
            files={"file": ("test.encrypted", f, "application/octet-stream")},
            data={"password": ""},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Password cannot be empty" in data.get("detail", "")


def test_encrypt_decrypt_roundtrip(client, sample_text_file, tmp_path):
    """Test encrypting and decrypting via API preserves content"""
    password = "secure_password_123"

    # Encrypt via API
    with open(sample_text_file, "rb") as f:
        encrypt_response = client.post(
            "/api/v1/security/encrypt",
            files={"file": ("test.txt", f, "text/plain")},
            data={"password": password},
        )

    assert encrypt_response.status_code == 200
    encrypt_data = encrypt_response.json()
    assert encrypt_data["success"] is True

    # Download encrypted file
    encrypted_file = tmp_path / "encrypted.encrypted"
    download_url = encrypt_data["download_url"]
    download_response = client.get(download_url)
    with open(encrypted_file, "wb") as f:
        f.write(download_response.content)

    # Decrypt via API
    with open(encrypted_file, "rb") as f:
        decrypt_response = client.post(
            "/api/v1/security/decrypt",
            files={"file": ("encrypted.encrypted", f, "application/octet-stream")},
            data={"password": password},
        )

    assert decrypt_response.status_code == 200
    decrypt_data = decrypt_response.json()
    assert decrypt_data["success"] is True

    # Download decrypted file and verify content
    decrypted_file = tmp_path / "decrypted.txt"
    download_url = decrypt_data["download_url"]
    download_response = client.get(download_url)
    with open(decrypted_file, "wb") as f:
        f.write(download_response.content)

    # Verify content matches original
    with open(sample_text_file, "rb") as f:
        original_content = f.read()
    with open(decrypted_file, "rb") as f:
        decrypted_content = f.read()

    assert decrypted_content == original_content


def test_hash_file_success(client, sample_text_file):
    """Test hashing a file via API"""
    with open(sample_text_file, "rb") as f:
        response = client.post(
            "/api/v1/security/file-hash",
            files={"file": ("test.txt", f, "text/plain")},
            data={"algorithm": "sha256", "uppercase": "false"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "test.txt" in data["filename"]  # Filename may be prefixed with unique identifier
    assert data["algorithm"] == "sha256"
    assert len(data["hex_digest"]) == 64
    assert len(data["base64_digest"]) > 0
    assert data["file_size"] is not None


def test_hash_file_different_algorithms(client, sample_text_file):
    """Test hashing with different algorithms via API"""
    algorithms = ["md5", "sha1", "sha256", "sha512"]

    for algo in algorithms:
        with open(sample_text_file, "rb") as f:
            response = client.post(
                "/api/v1/security/file-hash",
                files={"file": ("test.txt", f, "text/plain")},
                data={"algorithm": algo, "uppercase": "false"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["algorithm"] == algo


def test_hash_file_uppercase(client, sample_text_file):
    """Test hashing with uppercase option via API"""
    with open(sample_text_file, "rb") as f:
        response = client.post(
            "/api/v1/security/file-hash",
            files={"file": ("test.txt", f, "text/plain")},
            data={"algorithm": "sha256", "uppercase": "true"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["hex_digest"].isupper()


def test_hash_file_invalid_algorithm(client, sample_text_file):
    """Test hashing with invalid algorithm via API"""
    with open(sample_text_file, "rb") as f:
        response = client.post(
            "/api/v1/security/file-hash",
            files={"file": ("test.txt", f, "text/plain")},
            data={"algorithm": "invalid", "uppercase": "false"},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Unsupported algorithm" in data.get("detail", "")
