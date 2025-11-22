"""
Tests for file handler utilities
"""

from app.utils.file_handler import (
    calculate_compression_ratio,
    delete_file,
    generate_unique_filename,
    get_file_size,
    save_processed_file,
)


def test_generate_unique_filename():
    """Test unique filename generation"""
    filename1 = generate_unique_filename("test.jpg")
    filename2 = generate_unique_filename("test.jpg")

    # Should be different
    assert filename1 != filename2

    # Should contain original name
    assert "test" in filename1
    assert filename1.endswith(".jpg")

    # Should have timestamp and UUID
    parts = filename1.split("_")
    assert len(parts) >= 3  # timestamp, uuid, name, extension


def test_get_file_size(tmp_path):
    """Test getting file size"""
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")

    size = get_file_size(test_file)
    assert size > 0
    assert size == len("test content")


def test_get_file_size_nonexistent(tmp_path):
    """Test getting size of non-existent file"""
    nonexistent = tmp_path / "nonexistent.txt"
    size = get_file_size(nonexistent)
    assert size == 0


def test_save_processed_file(tmp_path, monkeypatch):
    """Test saving processed file content"""
    # Mock TEMP_DIR to use tmp_path
    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)

    content = b"processed file content"
    result_path = save_processed_file(content, "original.jpg", "_processed")

    assert result_path.exists()
    assert result_path.read_bytes() == content
    assert "original" in result_path.name
    assert "_processed" in result_path.name
    assert result_path.name.endswith(".jpg")


def test_delete_file(tmp_path):
    """Test deleting a file"""
    test_file = tmp_path / "test.txt"
    test_file.write_text("test")

    assert test_file.exists()
    delete_file(test_file)
    assert not test_file.exists()


def test_delete_file_nonexistent(tmp_path):
    """Test deleting non-existent file (should not raise error)"""
    nonexistent = tmp_path / "nonexistent.txt"
    delete_file(nonexistent)  # Should not raise


def test_delete_file_directory(tmp_path):
    """Test deleting a directory (should not delete, only files)"""
    test_dir = tmp_path / "test_dir"
    test_dir.mkdir()

    delete_file(test_dir)  # Should not delete directory
    assert test_dir.exists()


def test_calculate_compression_ratio():
    """Test compression ratio calculation"""
    # 50% compression
    ratio = calculate_compression_ratio(1000, 500)
    assert ratio == 50.0

    # No compression
    ratio = calculate_compression_ratio(1000, 1000)
    assert ratio == 0.0

    # File got larger (negative ratio)
    ratio = calculate_compression_ratio(1000, 1500)
    assert ratio == -50.0

    # Zero original size
    ratio = calculate_compression_ratio(0, 500)
    assert ratio == 0.0
