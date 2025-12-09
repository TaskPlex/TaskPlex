"""
Tests for /api/v1/video/extract-audio endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestExtractAudioEndpoint:
    """Tests for audio extraction endpoint"""

    @patch("app.api.video.extract_audio")
    @patch("app.api.video.save_upload_file")
    def test_extract_audio_success(self, mock_save, mock_extract):
        """Extract audio successfully"""
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file
        mock_extract.return_value = MagicMock(
            success=True,
            message="Audio extracted successfully",
            filename="test_audio.mp3",
            download_url="/api/v1/download/test_audio.mp3",
            original_size=1000,
            processed_size=200,
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/extract-audio",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"output_format": "mp3", "bitrate": "192k"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["filename"] == "test_audio.mp3"

    @patch("app.api.video.save_upload_file")
    def test_extract_audio_invalid_format(self, mock_save):
        """Reject non-video input"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not a video")
        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/extract-audio",
                files={"file": ("test.txt", f, "text/plain")},
                data={"output_format": "mp3"},
            )

        assert response.status_code == 400

    @patch("app.api.video.save_upload_file")
    def test_extract_audio_invalid_output_format(self, mock_save):
        """Reject unsupported audio output format"""
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/extract-audio",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"output_format": "aac"},
            )

        assert response.status_code == 400
