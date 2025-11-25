"""
Tests for video_service_async
Uses mocking for FFmpeg subprocess calls
"""

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.tasks import task_store
from app.tasks.models import TaskStatus


@pytest.fixture(autouse=True)
def cleanup_tasks():
    """Clean up tasks before and after each test"""
    task_store._tasks.clear()
    task_store._subscribers.clear()
    yield
    task_store._tasks.clear()
    task_store._subscribers.clear()


class TestGetAvailableH264Encoder:
    """Tests for encoder detection"""

    @patch("app.services.video_service_async.subprocess.run")
    def test_libx264_available(self, mock_run):
        """Test when libx264 is available"""
        from app.services.video_service_async import get_available_h264_encoder

        mock_run.return_value = MagicMock(stdout="libx264 H.264 encoder")
        result = get_available_h264_encoder()
        assert result == "libx264"

    @patch("app.services.video_service_async.subprocess.run")
    def test_libopenh264_fallback(self, mock_run):
        """Test fallback to libopenh264"""
        from app.services.video_service_async import get_available_h264_encoder

        mock_run.return_value = MagicMock(stdout="libopenh264 OpenH264 encoder")
        result = get_available_h264_encoder()
        assert result == "libopenh264"

    @patch("app.services.video_service_async.subprocess.run")
    def test_no_encoder_available(self, mock_run):
        """Test when no encoder is available"""
        from app.services.video_service_async import get_available_h264_encoder

        mock_run.return_value = MagicMock(stdout="some other encoder")
        result = get_available_h264_encoder()
        assert result is None

    @patch("app.services.video_service_async.subprocess.run")
    def test_subprocess_error(self, mock_run):
        """Test handling subprocess error"""
        from app.services.video_service_async import get_available_h264_encoder

        mock_run.side_effect = Exception("Command failed")
        result = get_available_h264_encoder()
        assert result is None


class TestGetVideoDuration:
    """Tests for video duration detection"""

    @patch("app.services.video_service_async.subprocess.run")
    def test_get_duration_success(self, mock_run):
        """Test successful duration detection"""
        from app.services.video_service_async import get_video_duration

        mock_run.return_value = MagicMock(stdout="120.5\n")
        result = get_video_duration(Path("/tmp/video.mp4"))
        assert result == 120.5

    @patch("app.services.video_service_async.subprocess.run")
    def test_get_duration_error(self, mock_run):
        """Test duration detection error"""
        from app.services.video_service_async import get_video_duration

        mock_run.side_effect = Exception("ffprobe failed")
        result = get_video_duration(Path("/tmp/video.mp4"))
        assert result is None

    @patch("app.services.video_service_async.subprocess.run")
    def test_get_duration_invalid_output(self, mock_run):
        """Test handling invalid output"""
        from app.services.video_service_async import get_video_duration

        mock_run.return_value = MagicMock(stdout="invalid")
        result = get_video_duration(Path("/tmp/video.mp4"))
        assert result is None


class TestCompressVideoWithProgress:
    """Tests for compress_video_with_progress"""

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_no_encoder_available(self, mock_size, mock_encoder):
        """Test handling when no encoder is available"""
        from app.services.video_service_async import compress_video_with_progress

        mock_encoder.return_value = None
        mock_size.return_value = 1000

        task = task_store.create_task("test")
        result = await compress_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium"
        )

        assert result.success is False
        assert "encoder" in result.error.lower()

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.asyncio.create_subprocess_exec")
    @patch("app.services.video_service_async.get_video_duration")
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    @patch("app.services.video_service_async.calculate_compression_ratio")
    async def test_successful_compression(
        self, mock_ratio, mock_size, mock_encoder, mock_duration, mock_subprocess
    ):
        """Test successful video compression"""
        from app.services.video_service_async import compress_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_duration.return_value = 10.0
        mock_size.side_effect = [1000000, 500000]  # Original, compressed
        mock_ratio.return_value = 50.0

        # Mock the subprocess
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.stdout.readline = AsyncMock(
            side_effect=[
                b"out_time_ms=5000000\n",
                b"progress=end\n",
                b"",
            ]
        )
        mock_process.communicate = AsyncMock(return_value=(b"", b""))
        mock_subprocess.return_value = mock_process

        task = task_store.create_task("test")

        # Create mock output file
        with patch("pathlib.Path.exists", return_value=True):
            result = await compress_video_with_progress(
                task.id, Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium"
            )

        assert result.success is True
        assert result.compression_ratio == 50.0

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.asyncio.create_subprocess_exec")
    @patch("app.services.video_service_async.get_video_duration")
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_ffmpeg_error(self, mock_size, mock_encoder, mock_duration, mock_subprocess):
        """Test handling FFmpeg error"""
        from app.services.video_service_async import compress_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_duration.return_value = 10.0
        mock_size.return_value = 1000000

        # Mock process with error
        mock_process = AsyncMock()
        mock_process.returncode = 1
        mock_process.stdout.readline = AsyncMock(return_value=b"")
        mock_process.communicate = AsyncMock(return_value=(b"", b"FFmpeg error message"))
        mock_subprocess.return_value = mock_process

        task = task_store.create_task("test")
        result = await compress_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium"
        )

        assert result.success is False
        assert task_store.get_task(task.id).status == TaskStatus.FAILED


class TestConvertVideoWithProgress:
    """Tests for convert_video_with_progress"""

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_no_encoder_available(self, mock_size, mock_encoder):
        """Test handling when no encoder is available"""
        from app.services.video_service_async import convert_video_with_progress

        mock_encoder.return_value = None
        mock_size.return_value = 1000

        task = task_store.create_task("test")
        result = await convert_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium"
        )

        assert result.success is False

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.asyncio.create_subprocess_exec")
    @patch("app.services.video_service_async.get_video_duration")
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_successful_conversion(
        self, mock_size, mock_encoder, mock_duration, mock_subprocess
    ):
        """Test successful video conversion"""
        from app.services.video_service_async import convert_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_duration.return_value = 10.0
        mock_size.side_effect = [1000000, 900000]

        # Mock the subprocess
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.stdout.readline = AsyncMock(
            side_effect=[
                b"progress=end\n",
                b"",
            ]
        )
        mock_process.communicate = AsyncMock(return_value=(b"", b""))
        mock_subprocess.return_value = mock_process

        task = task_store.create_task("test")

        with patch("pathlib.Path.exists", return_value=True):
            result = await convert_video_with_progress(
                task.id, Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium"
            )

        assert result.success is True
        assert "avi" in result.message.lower()

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.asyncio.create_subprocess_exec")
    @patch("app.services.video_service_async.get_video_duration")
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_conversion_ffmpeg_error(
        self, mock_size, mock_encoder, mock_duration, mock_subprocess
    ):
        """Test handling FFmpeg error during conversion"""
        from app.services.video_service_async import convert_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_duration.return_value = 10.0
        mock_size.return_value = 1000000

        mock_process = AsyncMock()
        mock_process.returncode = 1
        mock_process.stdout.readline = AsyncMock(return_value=b"")
        mock_process.communicate = AsyncMock(return_value=(b"", b"Conversion failed"))
        mock_subprocess.return_value = mock_process

        task = task_store.create_task("test")
        result = await convert_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium"
        )

        assert result.success is False
        assert task_store.get_task(task.id).status == TaskStatus.FAILED

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_compression_general_exception(self, mock_size, mock_encoder):
        """Test handling general exception during compression"""
        from app.services.video_service_async import compress_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_size.side_effect = Exception("Unexpected error")

        task = task_store.create_task("test")
        result = await compress_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.mp4"), "medium"
        )

        assert result.success is False
        assert task_store.get_task(task.id).status == TaskStatus.FAILED

    @pytest.mark.asyncio
    @patch("app.services.video_service_async.get_available_h264_encoder")
    @patch("app.services.video_service_async.get_file_size")
    async def test_conversion_general_exception(self, mock_size, mock_encoder):
        """Test handling general exception during conversion"""
        from app.services.video_service_async import convert_video_with_progress

        mock_encoder.return_value = "libx264"
        mock_size.side_effect = Exception("Unexpected error")

        task = task_store.create_task("test")
        result = await convert_video_with_progress(
            task.id, Path("/tmp/input.mp4"), Path("/tmp/output.avi"), "avi", "medium"
        )

        assert result.success is False
        assert task_store.get_task(task.id).status == TaskStatus.FAILED
