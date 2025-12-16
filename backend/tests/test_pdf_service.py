"""
Unit tests for PDF service functions
"""

from pathlib import Path

import fitz  # PyMuPDF
import pytest

from app.services.pdf_service import images_to_pdf, pdf_to_images


@pytest.fixture
def sample_pdf(tmp_path):
    """Create a simple PDF for testing using PyMuPDF"""
    pdf_path = tmp_path / "test_file.pdf"
    doc = fitz.open()  # Create new PDF

    # Add first page
    page = doc.new_page()
    page.insert_text((50, 50), "Page 1")

    # Add second page
    page = doc.new_page()
    page.insert_text((50, 50), "Page 2")

    doc.save(pdf_path)
    doc.close()

    return pdf_path


def test_pdf_to_images_png(tmp_path, sample_pdf):
    """Test converting PDF to PNG images"""
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    result = pdf_to_images(sample_pdf, output_dir, image_format="png", dpi=150)

    assert result.success is True
    assert result.total_pages == 2
    assert result.filenames is not None
    assert len(result.filenames) == 2
    assert all(f.endswith(".png") for f in result.filenames)

    # Verify files were created
    for filename in result.filenames:
        assert (output_dir / filename).exists()


def test_pdf_to_images_jpeg(tmp_path, sample_pdf):
    """Test converting PDF to JPEG images"""
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    result = pdf_to_images(sample_pdf, output_dir, image_format="jpeg", dpi=200)

    assert result.success is True
    assert result.total_pages == 2
    assert result.filenames is not None
    assert len(result.filenames) == 2
    assert all(f.endswith(".jpeg") or f.endswith(".jpg") for f in result.filenames)


def test_pdf_to_images_invalid_format(tmp_path, sample_pdf):
    """Test PDF to images with invalid format"""
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    result = pdf_to_images(sample_pdf, output_dir, image_format="invalid", dpi=150)

    assert result.success is False
    assert "Unsupported image format" in result.message


def test_images_to_pdf_single_image(tmp_path, sample_image):
    """Test converting a single image to PDF"""
    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([sample_image], output_path, page_size=None)

    assert result.success is True
    assert result.filename == "output.pdf"
    assert result.total_pages == 1
    assert output_path.exists()


def test_images_to_pdf_multiple_images(tmp_path, sample_image):
    """Test converting multiple images to PDF"""
    from PIL import Image

    # Create multiple test images
    image1 = tmp_path / "img1.png"
    image2 = tmp_path / "img2.png"
    image3 = tmp_path / "img3.png"

    img = Image.new("RGB", (100, 100), color="red")
    img.save(image1)
    img.save(image2)
    img.save(image3)

    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([image1, image2, image3], output_path, page_size=None)

    assert result.success is True
    assert result.total_pages == 3
    assert output_path.exists()


def test_images_to_pdf_with_page_size(tmp_path, sample_image):
    """Test converting images to PDF with A4 page size"""
    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([sample_image], output_path, page_size="A4")

    assert result.success is True
    assert result.total_pages == 1
    assert output_path.exists()


def test_images_to_pdf_with_letter_size(tmp_path, sample_image):
    """Test converting images to PDF with Letter page size"""
    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([sample_image], output_path, page_size="Letter")

    assert result.success is True
    assert result.total_pages == 1
    assert output_path.exists()


def test_images_to_pdf_empty_list(tmp_path):
    """Test images to PDF with empty image list"""
    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([], output_path, page_size=None)

    assert result.success is False
    assert "No images provided" in result.message


def test_images_to_pdf_invalid_image(tmp_path):
    """Test images to PDF with invalid image file"""
    invalid_image = tmp_path / "invalid.txt"
    invalid_image.write_text("not an image")

    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([invalid_image], output_path, page_size=None)

    assert result.success is False
    assert "Error opening image" in result.message


def test_images_to_pdf_rgba_image(tmp_path):
    """Test converting RGBA image to PDF (should convert to RGB)"""
    from PIL import Image

    rgba_image = tmp_path / "rgba.png"
    img = Image.new("RGBA", (100, 100), color=(255, 0, 0, 128))
    img.save(rgba_image)

    output_path = tmp_path / "output.pdf"

    result = images_to_pdf([rgba_image], output_path, page_size=None)

    assert result.success is True
    assert result.total_pages == 1
    assert output_path.exists()
