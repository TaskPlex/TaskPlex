"""
Tests for file handler utilities
"""

import asyncio
from datetime import datetime, timedelta
from io import BytesIO
from unittest.mock import MagicMock

import pytest

from app.utils.file_handler import (
    calculate_compression_ratio,
    cleanup_temp_files,
    delete_file,
    generate_unique_filename,
    get_file_size,
    save_processed_file,
    save_upload_file,
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


@pytest.mark.asyncio
async def test_save_upload_file(tmp_path, monkeypatch):
    """Test saving uploaded file"""
    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)

    # Create mock UploadFile
    mock_file = MagicMock()
    mock_file.filename = "test_upload.txt"
    mock_file.file = BytesIO(b"test content")

    result_path = await save_upload_file(mock_file)

    assert result_path.exists()
    assert result_path.read_bytes() == b"test content"
    assert "test_upload" in result_path.name


@pytest.mark.asyncio
async def test_save_upload_file_custom_filename(tmp_path, monkeypatch):
    """Test saving uploaded file with custom filename"""
    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)

    mock_file = MagicMock()
    mock_file.filename = "original.txt"
    mock_file.file = BytesIO(b"custom content")

    result_path = await save_upload_file(mock_file, custom_filename="custom.txt")

    assert result_path.name == "custom.txt"
    assert result_path.read_bytes() == b"custom content"


def test_cleanup_temp_files(tmp_path, monkeypatch):
    """Test cleanup of old temporary files"""
    import os

    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)
    monkeypatch.setattr("app.utils.file_handler.TEMP_FILE_CLEANUP_MINUTES", 0)

    # Create old file
    old_file = tmp_path / "old_file.txt"
    old_file.write_text("old")

    # Set old modification time (1 hour ago)
    old_time = (datetime.now() - timedelta(hours=1)).timestamp()
    os.utime(old_file, (old_time, old_time))

    # Create new file
    new_file = tmp_path / "new_file.txt"
    new_file.write_text("new")

    cleanup_temp_files()

    # Old file should be deleted
    assert not old_file.exists()
    # New file should remain (created after cutoff)


def test_cleanup_temp_files_nonexistent_dir(tmp_path, monkeypatch):
    """Test cleanup when temp dir doesn't exist"""
    nonexistent_dir = tmp_path / "nonexistent"
    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", nonexistent_dir)

    # Should not raise
    cleanup_temp_files()


def test_cleanup_temp_files_with_subdirectory(tmp_path, monkeypatch):
    """Test cleanup skips subdirectories"""
    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)
    monkeypatch.setattr("app.utils.file_handler.TEMP_FILE_CLEANUP_MINUTES", 0)

    # Create a subdirectory
    subdir = tmp_path / "subdir"
    subdir.mkdir()

    cleanup_temp_files()

    # Subdirectory should remain
    assert subdir.exists()


def test_cleanup_temp_files_handles_deletion_error(tmp_path, monkeypatch, capsys):
    """Test cleanup handles file deletion errors gracefully"""
    import os

    monkeypatch.setattr("app.utils.file_handler.TEMP_DIR", tmp_path)
    monkeypatch.setattr("app.utils.file_handler.TEMP_FILE_CLEANUP_MINUTES", 0)

    # Create old file
    old_file = tmp_path / "old_file.txt"
    old_file.write_text("old")
    old_time = (datetime.now() - timedelta(hours=1)).timestamp()
    os.utime(old_file, (old_time, old_time))

    # Make unlink fail by monkeypatching
    original_unlink = old_file.unlink

    def fail_unlink(*args, **kwargs):
        raise PermissionError("Cannot delete")

    monkeypatch.setattr(type(old_file), "unlink", fail_unlink)

    cleanup_temp_files()

    # Should print error message
    captured = capsys.readouterr()
    assert "Error deleting" in captured.out


def test_delete_file_handles_error(tmp_path, monkeypatch, capsys):
    """Test delete_file handles errors gracefully"""
    test_file = tmp_path / "test.txt"
    test_file.write_text("test")

    def fail_unlink(*args, **kwargs):
        raise PermissionError("Cannot delete")

    monkeypatch.setattr(type(test_file), "unlink", fail_unlink)

    delete_file(test_file)

    captured = capsys.readouterr()
    assert "Error deleting" in captured.out
