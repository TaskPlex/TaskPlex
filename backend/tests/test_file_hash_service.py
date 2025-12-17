"""
Unit tests for file hash service
"""

from pathlib import Path

import pytest

from app.services.hash_service import hash_file


def create_test_file(path: Path, content: bytes = b"test content"):
    """Create a test file with given content"""
    with open(path, "wb") as f:
        f.write(content)
    return path


def test_hash_file_success(tmp_path: Path):
    """Test hashing a file successfully"""
    input_path = tmp_path / "test.txt"
    create_test_file(input_path, b"Hello, World!")

    result = hash_file(input_path, "sha256")

    assert result.success is True
    assert result.filename == "test.txt"
    assert result.algorithm == "sha256"
    assert len(result.hex_digest) == 64  # SHA256 produces 64 hex characters
    assert len(result.base64_digest) > 0
    assert result.file_size is not None
    assert result.file_size > 0


def test_hash_file_different_algorithms(tmp_path: Path):
    """Test hashing with different algorithms"""
    input_path = tmp_path / "test.txt"
    create_test_file(input_path, b"test content")

    algorithms = ["md5", "sha1", "sha256", "sha512"]
    for algo in algorithms:
        result = hash_file(input_path, algo)

        assert result.success is True
        assert result.algorithm == algo
        assert len(result.hex_digest) > 0
        assert len(result.base64_digest) > 0

        # Check expected hex digest lengths
        if algo == "md5":
            assert len(result.hex_digest) == 32
        elif algo == "sha1":
            assert len(result.hex_digest) == 40
        elif algo == "sha256":
            assert len(result.hex_digest) == 64
        elif algo == "sha512":
            assert len(result.hex_digest) == 128


def test_hash_file_uppercase(tmp_path: Path):
    """Test hashing with uppercase option"""
    input_path = tmp_path / "test.txt"
    create_test_file(input_path, b"test content")

    result_lower = hash_file(input_path, "sha256", uppercase=False)
    result_upper = hash_file(input_path, "sha256", uppercase=True)

    assert result_lower.success is True
    assert result_upper.success is True
    assert result_lower.hex_digest.lower() == result_upper.hex_digest.lower()
    assert result_upper.hex_digest.isupper()
    assert (
        not result_lower.hex_digest.isupper()
        or result_lower.hex_digest == result_lower.hex_digest.lower()
    )


def test_hash_file_same_content_same_hash(tmp_path: Path):
    """Test that same content produces same hash"""
    input_path1 = tmp_path / "test1.txt"
    input_path2 = tmp_path / "test2.txt"

    content = b"same content"
    create_test_file(input_path1, content)
    create_test_file(input_path2, content)

    result1 = hash_file(input_path1, "sha256")
    result2 = hash_file(input_path2, "sha256")

    assert result1.success is True
    assert result2.success is True
    assert result1.hex_digest == result2.hex_digest
    assert result1.base64_digest == result2.base64_digest


def test_hash_file_different_content_different_hash(tmp_path: Path):
    """Test that different content produces different hash"""
    input_path1 = tmp_path / "test1.txt"
    input_path2 = tmp_path / "test2.txt"

    create_test_file(input_path1, b"content 1")
    create_test_file(input_path2, b"content 2")

    result1 = hash_file(input_path1, "sha256")
    result2 = hash_file(input_path2, "sha256")

    assert result1.success is True
    assert result2.success is True
    assert result1.hex_digest != result2.hex_digest


def test_hash_file_invalid_algorithm(tmp_path: Path):
    """Test hashing with invalid algorithm"""
    input_path = tmp_path / "test.txt"
    create_test_file(input_path, b"test content")

    result = hash_file(input_path, "invalid_algo")

    assert result.success is False
    assert "Unsupported algorithm" in result.message


def test_hash_file_not_found(tmp_path: Path):
    """Test hashing a non-existent file"""
    input_path = tmp_path / "nonexistent.txt"

    result = hash_file(input_path, "sha256")

    assert result.success is False
    assert "File not found" in result.message


def test_hash_file_large_file(tmp_path: Path):
    """Test hashing a large file"""
    input_path = tmp_path / "large.txt"

    # Create a 1MB file
    large_content = b"x" * (1024 * 1024)
    create_test_file(input_path, large_content)

    result = hash_file(input_path, "sha256")

    assert result.success is True
    assert result.file_size == 1024 * 1024
    assert len(result.hex_digest) == 64
