"""
Tests for video_service module
Uses mocking for FFmpeg operations
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.services.video_service import (
    compress_video,
    convert_video,
    get_available_h264_encoder,
)


class TestGetAvailableH264Encoder:
    """Tests for encoder detection"""

    @patch("app.services.video_service.subprocess.run")
    def test_libx264_available(self, mock_run):
        """Test detection of libx264"""
        mock_run.return_value = MagicMock(stdout="V..... libx264 H.264 encoder")
        result = get_available_h264_encoder()
        assert result == "libx264"

    @patch("app.services.video_service.subprocess.run")
    def test_libopenh264_fallback(self, mock_run):
        """Test fallback to libopenh264"""
        mock_run.return_value = MagicMock(stdout="V..... libopenh264")
        result = get_available_h264_encoder()
        assert result == "libopenh264"

    @patch("app.services.video_service.subprocess.run")
    def test_h264_vaapi_fallback(self, mock_run):
        """Test fallback to h264_vaapi"""
        mock_run.return_value = MagicMock(stdout="V..... h264_vaapi")
        result = get_available_h264_encoder()
        assert result == "h264_vaapi"

    @patch("app.services.video_service.subprocess.run")
    def test_no_encoder_available(self, mock_run):
        """Test when no encoder is available"""
        mock_run.return_value = MagicMock(stdout="no encoders")
        result = get_available_h264_encoder()
        assert result is None

    @patch("app.services.video_service.subprocess.run")
    def test_subprocess_exception(self, mock_run):
        """Test handling subprocess exception"""
        mock_run.side_effect = Exception("Command failed")
        result = get_available_h264_encoder()
        assert result is None


class TestCompressVideo:
    """Tests for compress_video function"""

    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_no_encoder_available(self, mock_size, mock_encoder):
        """Test when no encoder is available"""
        mock_encoder.return_value = None
        mock_size.return_value = 1000

        result = compress_video(Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium")

        assert result.success is False
        assert "encoder" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.calculate_compression_ratio")
    @patch("app.services.video_service.get_file_size")
    def test_successful_compression_libx264(
        self, mock_size, mock_ratio, mock_encoder, mock_input, mock_output, mock_run
    ):
        """Test successful compression with libx264"""
        mock_encoder.return_value = "libx264"
        mock_size.side_effect = [1000000, 500000]  # original, compressed
        mock_ratio.return_value = 50.0

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        result = compress_video(Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium")

        assert result.success is True
        assert result.compression_ratio == 50.0
        assert "compressed" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.calculate_compression_ratio")
    @patch("app.services.video_service.get_file_size")
    def test_successful_compression_libopenh264(
        self, mock_size, mock_ratio, mock_encoder, mock_input, mock_output, mock_run
    ):
        """Test successful compression with libopenh264 (bitrate-based)"""
        mock_encoder.return_value = "libopenh264"
        mock_size.side_effect = [1000000, 600000]
        mock_ratio.return_value = 40.0

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        result = compress_video(Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "high")

        assert result.success is True

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_ffmpeg_error(self, mock_size, mock_encoder, mock_input, mock_output, mock_run):
        """Test FFmpeg error handling"""
        import ffmpeg

        mock_encoder.return_value = "libx264"
        mock_size.return_value = 1000000

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        # Simulate FFmpeg error
        mock_run.side_effect = ffmpeg.Error("ffmpeg", b"", b"FFmpeg error message")

        result = compress_video(Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium")

        assert result.success is False
        assert "ffmpeg" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_general_exception(self, mock_size, mock_encoder, mock_input, mock_output, mock_run):
        """Test general exception handling"""
        mock_encoder.return_value = "libx264"
        mock_size.return_value = 1000000

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        mock_run.side_effect = Exception("Unexpected error")

        result = compress_video(Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium")

        assert result.success is False
        assert "error" in result.message.lower()


class TestConvertVideo:
    """Tests for convert_video function"""

    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_no_encoder_available(self, mock_size, mock_encoder):
        """Test when no encoder is available"""
        mock_encoder.return_value = None
        mock_size.return_value = 1000

        result = convert_video(Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium")

        assert result.success is False
        assert "encoder" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_successful_conversion(
        self, mock_size, mock_encoder, mock_input, mock_output, mock_run
    ):
        """Test successful video conversion"""
        mock_encoder.return_value = "libx264"
        mock_size.side_effect = [1000000, 900000]

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        result = convert_video(Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium")

        assert result.success is True
        assert "avi" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_ffmpeg_error(self, mock_size, mock_encoder, mock_input, mock_output, mock_run):
        """Test FFmpeg error during conversion"""
        import ffmpeg

        mock_encoder.return_value = "libx264"
        mock_size.return_value = 1000000

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        mock_run.side_effect = ffmpeg.Error("ffmpeg", b"", b"Error")

        result = convert_video(Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium")

        assert result.success is False

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_available_h264_encoder")
    @patch("app.services.video_service.get_file_size")
    def test_general_exception(self, mock_size, mock_encoder, mock_input, mock_output, mock_run):
        """Test general exception during conversion"""
        mock_encoder.return_value = "libx264"
        mock_size.return_value = 1000000

        mock_stream = MagicMock()
        mock_input.return_value = mock_stream
        mock_output.return_value = mock_stream

        mock_run.side_effect = Exception("Unexpected error")

        result = convert_video(Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium")

        assert result.success is False
