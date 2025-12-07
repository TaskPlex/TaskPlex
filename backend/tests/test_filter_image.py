"""
Tests for image filter endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestFilterImageEndpoint:
    """Tests for /api/v1/image/filters endpoint"""

    @patch("app.api.image.apply_filter")
    @patch("app.api.image.save_upload_file")
    def test_filter_image_success(self, mock_save, mock_filter):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (32, 32), color="blue")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_filter.return_value = MagicMock(
            success=True,
            message="Filter applied successfully",
            filename="filtered_test_image.png",
            download_url="/api/v1/download/filtered_test_image.png",
            original_size=50,
            processed_size=60,
            dimensions={"width": 32, "height": 32},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["filename"] == "filtered_test_image.png"

    def test_filter_image_invalid_filter(self):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (32, 32), color="blue")
            img.save(test_file)

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "unknown"},
            )

        assert response.status_code == 400
        assert "Unsupported filter" in response.json()["detail"]

    def test_filter_image_invalid_format(self):
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not an image")

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test.txt", f, "text/plain")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]

    @patch("app.api.image.apply_filter")
    @patch("app.api.image.save_upload_file")
    def test_filter_image_failure(self, mock_save, mock_filter):
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (32, 32), color="blue")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_filter.return_value = MagicMock(
            success=False,
            message="Error applying filter",
            filename="filtered_test_image.png",
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 500
        assert "Error" in response.json()["detail"]
