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
    extract_audio,
    get_available_h264_encoder,
    video_to_gif,
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


class TestVideoToGif:
    """Tests for video_to_gif function"""

    @patch("app.services.video_service.get_file_size")
    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.filter")
    @patch("app.services.video_service.ffmpeg.filter_multi_output")
    @patch("app.services.video_service.ffmpeg.input")
    def test_successful_video_to_gif(
        self,
        mock_input,
        mock_split,
        mock_filter,
        mock_output,
        mock_run,
        mock_size,
    ):
        """Test successful conversion to GIF"""
        mock_size.side_effect = [500000, 120000]

        mock_input.return_value = MagicMock(name="input_stream")
        fps_stream = MagicMock(name="fps_stream")
        scaled_stream = MagicMock(name="scaled_stream")
        split_streams = (MagicMock(name="split0"), MagicMock(name="split1"))
        palette = MagicMock(name="palette")
        palette_use = MagicMock(name="palette_use")
        output_stream = MagicMock(name="output_stream")

        mock_filter.side_effect = [fps_stream, scaled_stream, palette_use]
        mock_split.return_value = split_streams
        split_streams[0].filter.return_value = palette
        mock_output.return_value = output_stream

        result = video_to_gif(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.gif"),
            start_time=1.5,
            duration=3.0,
            width=320,
            fps=10,
            loop=True,
        )

        assert result.success is True
        assert result.download_url == "/api/v1/download/output.gif"

    def test_invalid_fps(self):
        """Test invalid fps is rejected early"""
        result = video_to_gif(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.gif"),
            fps=0,
        )

        assert result.success is False
        assert "fps" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.filter")
    @patch("app.services.video_service.ffmpeg.filter_multi_output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_file_size")
    def test_ffmpeg_error(
        self,
        mock_size,
        mock_input,
        mock_split,
        mock_filter,
        mock_output,
        mock_run,
    ):
        """Test FFmpeg error handling for GIF conversion"""
        import ffmpeg

        mock_size.side_effect = [1000, 2000]
        mock_input.return_value = MagicMock()
        mock_filter.side_effect = [MagicMock(), MagicMock(), MagicMock()]
        mock_split.return_value = (MagicMock(), MagicMock())
        mock_output.return_value = MagicMock()
        mock_run.side_effect = ffmpeg.Error("ffmpeg", b"", b"gif error")

        result = video_to_gif(Path("/tmp/input.mp4"), Path("/tmp/output.gif"))

        assert result.success is False
        assert "ffmpeg" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run", side_effect=Exception("Unexpected error"))
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.filter")
    @patch("app.services.video_service.ffmpeg.filter_multi_output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_file_size", return_value=1000)
    def test_general_exception(
        self,
        mock_size,
        mock_input,
        mock_split,
        mock_filter,
        mock_output,
        mock_run,
    ):
        """Test general exception handling for GIF conversion"""
        mock_input.return_value = MagicMock()
        mock_filter.side_effect = [MagicMock(), MagicMock(), MagicMock()]
        mock_split.return_value = (MagicMock(), MagicMock())
        mock_output.return_value = MagicMock()

        result = video_to_gif(Path("/tmp/input.mp4"), Path("/tmp/output.gif"))

        assert result.success is False
        assert "error converting video to gif" in result.message.lower()


class TestExtractAudio:
    """Tests for extract_audio function"""

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_file_size")
    def test_successful_extract_audio(self, mock_size, mock_input, mock_output, mock_run):
        """Extract audio to mp3 successfully"""
        mock_size.side_effect = [1_000_000, 200_000]
        mock_input.return_value = MagicMock()
        mock_output.return_value = MagicMock()

        result = extract_audio(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.mp3"),
            output_format="mp3",
            bitrate="192k",
        )

        assert result.success is True
        assert result.filename == "output.mp3"
        assert result.download_url == "/api/v1/download/output.mp3"

    def test_unsupported_format(self):
        """Reject unsupported audio format"""
        result = extract_audio(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.xyz"),
            output_format="xyz",
        )

        assert result.success is False
        assert "unsupported" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run")
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_file_size")
    def test_ffmpeg_error_extract_audio(self, mock_size, mock_input, mock_output, mock_run):
        """Handle ffmpeg error"""
        import ffmpeg

        mock_size.side_effect = [1_000_000, 200_000]
        mock_input.return_value = MagicMock()
        mock_output.return_value = MagicMock()
        mock_run.side_effect = ffmpeg.Error("ffmpeg", b"", b"audio error")

        result = extract_audio(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.mp3"),
            output_format="mp3",
        )

        assert result.success is False
        assert "ffmpeg" in result.message.lower()

    @patch("app.services.video_service.ffmpeg.run", side_effect=Exception("boom"))
    @patch("app.services.video_service.ffmpeg.output")
    @patch("app.services.video_service.ffmpeg.input")
    @patch("app.services.video_service.get_file_size")
    def test_general_exception_extract_audio(self, mock_size, mock_input, mock_output, mock_run):
        """Handle general error"""
        mock_size.side_effect = [1_000_000, 200_000]
        mock_input.return_value = MagicMock()
        mock_output.return_value = MagicMock()

        result = extract_audio(
            input_path=Path("/tmp/input.mp4"),
            output_path=Path("/tmp/output.mp3"),
            output_format="mp3",
        )

        assert result.success is False
        assert "error extracting audio" in result.message.lower()

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
