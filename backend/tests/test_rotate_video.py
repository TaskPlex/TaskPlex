"""
Tests for rotate_video endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


class TestRotateVideoEndpoint:
    """Tests for /api/v1/video/rotate endpoint"""

    @patch("app.api.video.rotate_video")
    @patch("app.api.video.save_upload_file")
    def test_rotate_video_success_90(self, mock_save, mock_rotate):
        """Test successful video rotation by 90 degrees"""
        # Create a temporary test video file
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)

        # Create a simple test file if it doesn't exist
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file
        mock_rotate.return_value = MagicMock(
            success=True,
            message="Video rotated 90 degrees successfully",
            filename="rotated_90_test_video.mp4",
            download_url="/api/v1/download/rotated_90_test_video.mp4",
            original_size=1000,
            processed_size=1000,
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/rotate",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"angle": 90},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "90 degrees" in data["message"]
        assert data["filename"] == "rotated_90_test_video.mp4"

    @patch("app.api.video.save_upload_file")
    def test_rotate_video_invalid_angle(self, mock_save):
        """Test rotation with invalid angle"""
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)

        # Create a simple test file if it doesn't exist
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/rotate",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"angle": 45},  # Invalid angle
            )

        assert response.status_code == 400
        assert "Invalid angle" in response.json()["detail"]

    @patch("app.api.video.save_upload_file")
    def test_rotate_video_invalid_format(self, mock_save):
        """Test rotation with invalid file format"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not a video")
        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/rotate",
                files={"file": ("test.txt", f, "text/plain")},
                data={"angle": 90},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]
