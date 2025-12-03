"""
Tests for rotate_image endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


class TestRotateImageEndpoint:
    """Tests for /api/v1/image/rotate endpoint"""

    @patch("app.api.image.rotate_image")
    @patch("app.api.image.save_upload_file")
    def test_rotate_image_success_90(self, mock_save, mock_rotate):
        """Test successful image rotation by 90 degrees"""
        # Create a temporary test image file
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        # Create a simple test image if it doesn't exist
        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_rotate.return_value = MagicMock(
            success=True,
            message="Image rotated 90 degrees successfully",
            filename="rotated_90_test_image.png",
            download_url="/api/v1/download/rotated_90_test_image.png",
            original_size=1000,
            processed_size=1000,
            dimensions={"width": 100, "height": 100},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/rotate",
                files={"file": ("test_image.png", f, "image/png")},
                data={"angle": 90},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "90 degrees" in data["message"]
        assert data["filename"] == "rotated_90_test_image.png"

    @patch("app.api.image.save_upload_file")
    def test_rotate_image_invalid_angle(self, mock_save):
        """Test rotation with invalid angle"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        # Create a simple test image if it doesn't exist
        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/rotate",
                files={"file": ("test_image.png", f, "image/png")},
                data={"angle": 45},  # Invalid angle
            )

        assert response.status_code == 400
        assert "Invalid angle" in response.json()["detail"]

    @patch("app.api.image.save_upload_file")
    def test_rotate_image_invalid_format(self, mock_save):
        """Test rotation with invalid file format"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not an image")
        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/rotate",
                files={"file": ("test.txt", f, "text/plain")},
                data={"angle": 90},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]
