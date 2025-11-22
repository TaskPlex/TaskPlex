"""
Tests for video processing endpoints
"""

from pathlib import Path


def test_compress_video_invalid_format(client):
    """Test sending a non-video file to video compress endpoint"""
    # Sending a PDF instead of a video
    pdf_path = Path(__file__).parent / "temp" / "test_file.pdf"
    if not pdf_path.exists():
        # Create a dummy file if it doesn't exist
        pdf_path.parent.mkdir(exist_ok=True)
        pdf_path.write_bytes(b"%PDF-1.4\n")

    with open(pdf_path, "rb") as f:
        response = client.post(
            "/api/v1/video/compress",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"quality": "medium"},
        )

    # Should fail (400 or 422 depending on validation)
    assert response.status_code in [400, 422]


def test_convert_video_invalid_format(client):
    """Test sending a non-video file to video convert endpoint"""
    pdf_path = Path(__file__).parent / "temp" / "test_file.pdf"
    if not pdf_path.exists():
        pdf_path.parent.mkdir(exist_ok=True)
        pdf_path.write_bytes(b"%PDF-1.4\n")

    with open(pdf_path, "rb") as f:
        response = client.post(
            "/api/v1/video/convert",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"output_format": "mp4", "quality": "medium"},
        )

    # Should fail
    assert response.status_code in [400, 422]


def test_convert_video_invalid_output_format(client):
    """Test video conversion with invalid output format"""
    import os
    from pathlib import Path

    from PIL import Image

    test_dir = Path(__file__).parent / "temp"
    test_dir.mkdir(exist_ok=True, parents=True)

    # Use unique filename for parallel execution (include process ID)
    pid = os.getpid()
    img_path = test_dir / f"test_video_image_{pid}.png"

    # Remove existing file if it exists (for parallel test execution)
    if img_path.exists():
        img_path.unlink()

    img = Image.new("RGB", (100, 100), color="blue")
    img.save(img_path)

    # Verify file was created
    assert img_path.exists(), f"Image file was not created at {img_path}"
    assert img_path.stat().st_size > 0, f"Image file is empty at {img_path}"

    # Using image as mock video file (will fail format validation first)
    with open(img_path, "rb") as f:
        response = client.post(
            "/api/v1/video/convert",
            files={"file": ("test.mp4", f, "video/mp4")},
            data={"output_format": "invalid_format", "quality": "medium"},
        )

    # Should fail due to invalid output format or invalid input format
    assert response.status_code in [400, 422]
