"""
Tests for adjust_image endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestAdjustImageEndpoint:
    """Tests for /api/v1/image/adjust endpoint"""

    @patch("app.api.image.adjust_image")
    @patch("app.api.image.save_upload_file")
    def test_adjust_image_success(self, mock_save, mock_adjust):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (50, 50), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_adjust.return_value = MagicMock(
            success=True,
            message="Image adjusted successfully",
            filename="adjusted_test_image.png",
            download_url="/api/v1/download/adjusted_test_image.png",
            original_size=100,
            processed_size=110,
            dimensions={"width": 50, "height": 50},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/adjust",
                files={"file": ("test_image.png", f, "image/png")},
                data={"brightness": 1.2, "contrast": 0.8, "saturation": 1.1},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["filename"] == "adjusted_test_image.png"

    def test_adjust_image_invalid_factor(self):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (50, 50), color="red")
            img.save(test_file)

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/adjust",
                files={"file": ("test_image.png", f, "image/png")},
                data={"brightness": 0, "contrast": 1.0, "saturation": 1.0},
            )

        assert response.status_code == 400
        assert "brightness" in response.json()["detail"]

    def test_adjust_image_invalid_format(self):
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not an image")

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/adjust",
                files={"file": ("test.txt", f, "text/plain")},
                data={"brightness": 1.0, "contrast": 1.0, "saturation": 1.0},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]

    @patch("app.api.image.adjust_image")
    @patch("app.api.image.save_upload_file")
    def test_adjust_image_failure(self, mock_save, mock_adjust):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (50, 50), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_adjust.return_value = MagicMock(
            success=False,
            message="Error adjusting image",
            filename="adjusted_test_image.png",
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/adjust",
                files={"file": ("test_image.png", f, "image/png")},
                data={"brightness": 1.1, "contrast": 1.1, "saturation": 1.1},
            )

        assert response.status_code == 500
        assert "Error" in response.json()["detail"]
