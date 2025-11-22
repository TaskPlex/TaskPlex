"""
Tests for validation utilities
"""

from app.utils.validators import (
    get_file_extension,
    sanitize_filename,
    validate_file_format,
    validate_image_format,
    validate_pdf_format,
    validate_video_format,
)


def test_validate_video_format():
    """Test video format validation"""
    assert validate_video_format("test.mp4") is True
    assert validate_video_format("test.avi") is True
    assert validate_video_format("test.mov") is True
    assert validate_video_format("test.mkv") is True
    assert validate_video_format("test.pdf") is False
    assert validate_video_format("test.jpg") is False
    assert validate_video_format("test") is False


def test_validate_image_format():
    """Test image format validation"""
    assert validate_image_format("test.jpg") is True
    assert validate_image_format("test.jpeg") is True
    assert validate_image_format("test.png") is True
    assert validate_image_format("test.gif") is True
    assert validate_image_format("test.webp") is True
    assert validate_image_format("test.pdf") is False
    assert validate_image_format("test.mp4") is False


def test_validate_pdf_format():
    """Test PDF format validation"""
    assert validate_pdf_format("test.pdf") is True
    assert validate_pdf_format("test.PDF") is True
    assert validate_pdf_format("test.jpg") is False
    assert validate_pdf_format("test") is False


def test_validate_file_format():
    """Test generic file format validation"""
    allowed = ["jpg", "png", "gif"]
    assert validate_file_format("test.jpg", allowed) is True
    assert validate_file_format("test.png", allowed) is True
    assert validate_file_format("test.JPG", allowed) is True  # Case insensitive
    assert validate_file_format("test.pdf", allowed) is False
    assert validate_file_format("test", allowed) is False


def test_get_file_extension():
    """Test getting file extension"""
    assert get_file_extension("test.jpg") == "jpg"
    assert get_file_extension("test.PNG") == "png"
    assert get_file_extension("test.file.pdf") == "pdf"
    assert get_file_extension("test") == ""
    assert get_file_extension(".hidden") == "hidden"


def test_sanitize_filename():
    """Test filename sanitization"""
    assert sanitize_filename("test.jpg") == "test.jpg"
    assert sanitize_filename("../test.jpg") == "test.jpg"
    assert sanitize_filename("../../etc/passwd") == "etc_passwd"
    assert sanitize_filename("test/../file.jpg") == "file.jpg"
    assert sanitize_filename("test\\file.jpg") == "test_file.jpg"
    assert sanitize_filename("test\0file.jpg") == "test_file.jpg"
    assert sanitize_filename("path/to/file.jpg") == "file.jpg"
