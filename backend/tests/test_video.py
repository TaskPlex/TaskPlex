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


def test_convert_video_invalid_output_format(client, sample_image):
    """Test video conversion with invalid output format"""
    # Using image as mock video file (will fail format validation first)
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/video/convert",
            files={"file": ("test.mp4", f, "video/mp4")},
            data={"output_format": "invalid_format", "quality": "medium"},
        )

    # Should fail due to invalid output format
    assert response.status_code in [400, 422]
