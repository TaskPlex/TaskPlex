"""
Tests for async video endpoints
"""

import io
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.tasks import task_store


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_tasks():
    """Clean up tasks before and after each test"""
    task_store._tasks.clear()
    task_store._subscribers.clear()
    yield
    task_store._tasks.clear()
    task_store._subscribers.clear()


def create_mock_video_file(filename: str = "test_video.mp4"):
    """Create a mock video file for testing"""
    content = b"mock video content" * 100  # Make it a bit larger
    return {"file": (filename, io.BytesIO(content), "video/mp4")}


class TestCompressVideoAsyncEndpoint:
    """Tests for POST /api/v1/video/compress/async"""

    @patch("app.api.video.run_compress_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_compress_async_success(self, mock_save, mock_create_task, mock_run_task, client):
        """Test successful async compression request"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test_video.mp4")

        # Make create_task consume the coroutine to avoid warnings
        def consume_coroutine(coro):
            # Create a task-like object but don't actually await
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        response = client.post(
            "/api/v1/video/compress/async",
            files=create_mock_video_file(),
            data={"quality": "medium"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "task_id" in data
        assert len(data["task_id"]) == 36  # UUID format

        # Verify task was created
        task = task_store.get_task(data["task_id"])
        assert task is not None
        assert task.task_type == "video_compress"
        assert task.metadata["quality"] == "medium"

    def test_compress_async_invalid_format(self, client):
        """Test async compression with invalid video format"""
        response = client.post(
            "/api/v1/video/compress/async",
            files={"file": ("test.txt", io.BytesIO(b"not a video"), "text/plain")},
            data={"quality": "medium"},
        )

        assert response.status_code == 400
        assert "unsupported" in response.json()["detail"].lower()

    @patch("app.api.video.run_compress_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_compress_async_different_qualities(
        self, mock_save, mock_create_task, mock_run_task, client
    ):
        """Test async compression with different quality settings"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        for quality in ["low", "medium", "high"]:
            response = client.post(
                "/api/v1/video/compress/async",
                files=create_mock_video_file(),
                data={"quality": quality},
            )
            assert response.status_code == 200
            task = task_store.get_task(response.json()["task_id"])
            assert task.metadata["quality"] == quality


class TestConvertVideoAsyncEndpoint:
    """Tests for POST /api/v1/video/convert/async"""

    @patch("app.api.video.run_convert_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_convert_async_success(self, mock_save, mock_create_task, mock_run_task, client):
        """Test successful async conversion request"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test_video.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        response = client.post(
            "/api/v1/video/convert/async",
            files=create_mock_video_file(),
            data={"output_format": "avi", "quality": "high"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "task_id" in data

        # Verify task was created
        task = task_store.get_task(data["task_id"])
        assert task is not None
        assert task.task_type == "video_convert"
        assert task.metadata["output_format"] == "avi"
        assert task.metadata["quality"] == "high"

    @patch("app.api.video.run_convert_task", new_callable=AsyncMock)
    def test_convert_async_invalid_input_format(self, mock_run_task, client):
        """Test async conversion with invalid input format"""
        response = client.post(
            "/api/v1/video/convert/async",
            files={"file": ("test.txt", io.BytesIO(b"not a video"), "text/plain")},
            data={"output_format": "mp4", "quality": "medium"},
        )

        assert response.status_code == 400
        assert "unsupported" in response.json()["detail"].lower()

    @patch("app.api.video.run_convert_task", new_callable=AsyncMock)
    def test_convert_async_invalid_output_format(self, mock_run_task, client):
        """Test async conversion with invalid output format"""
        response = client.post(
            "/api/v1/video/convert/async",
            files=create_mock_video_file(),
            data={"output_format": "xyz", "quality": "medium"},
        )

        assert response.status_code == 400
        assert "unsupported" in response.json()["detail"].lower()

    @patch("app.api.video.run_convert_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_convert_async_all_formats(self, mock_save, mock_create_task, mock_run_task, client):
        """Test async conversion to all supported formats"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        supported_formats = ["mp4", "avi", "mov", "mkv", "flv", "wmv"]

        for fmt in supported_formats:
            response = client.post(
                "/api/v1/video/convert/async",
                files=create_mock_video_file(),
                data={"output_format": fmt, "quality": "medium"},
            )
            assert response.status_code == 200, f"Failed for format: {fmt}"


class TestVideoAsyncIntegration:
    """Integration tests for async video endpoints with task system"""

    @patch("app.api.video.run_compress_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file", new_callable=AsyncMock)
    def test_task_workflow(self, mock_save, mock_create_task, mock_run_task, client):
        """Test complete task workflow: create -> status -> complete"""
        from pathlib import Path

        from app.tasks.models import TaskResult

        mock_save.return_value = Path("/tmp/test.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        # Create task via endpoint
        response = client.post(
            "/api/v1/video/compress/async",
            files=create_mock_video_file(),
            data={"quality": "medium"},
        )
        task_id = response.json()["task_id"]

        # Check initial status
        status_response = client.get(f"/api/v1/tasks/{task_id}/status")
        assert status_response.status_code == 200
        assert status_response.json()["status"] == "pending"

        # Simulate progress update
        task_store.update_progress(task_id, 50.0, "Encoding...", "encoding")

        status_response = client.get(f"/api/v1/tasks/{task_id}/status")
        assert status_response.json()["status"] == "processing"
        assert status_response.json()["progress"]["percent"] == 50.0

        # Simulate completion
        task_store.complete_task(
            task_id,
            TaskResult(
                success=True,
                download_url="/api/v1/download/compressed_test.mp4",
                filename="compressed_test.mp4",
                compression_ratio=50.0,
            ),
        )

        status_response = client.get(f"/api/v1/tasks/{task_id}/status")
        assert status_response.json()["status"] == "completed"
        assert status_response.json()["result"]["success"] is True

    @patch("app.api.video.run_compress_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_task_cancellation(self, mock_save, mock_create_task, mock_run_task, client):
        """Test task cancellation"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        # Create task
        response = client.post(
            "/api/v1/video/compress/async",
            files=create_mock_video_file(),
            data={"quality": "medium"},
        )
        task_id = response.json()["task_id"]

        # Start processing
        task_store.update_progress(task_id, 25.0)

        # Cancel
        cancel_response = client.post(f"/api/v1/tasks/{task_id}/cancel")
        assert cancel_response.status_code == 200

        # Verify cancelled
        status_response = client.get(f"/api/v1/tasks/{task_id}/status")
        assert status_response.json()["status"] == "cancelled"

    @patch("app.api.video.run_compress_task", new_callable=AsyncMock)
    @patch("app.api.video.asyncio.create_task")
    @patch("app.api.video.save_upload_file")
    def test_multiple_concurrent_tasks(self, mock_save, mock_create_task, mock_run_task, client):
        """Test multiple concurrent tasks"""
        from pathlib import Path

        mock_save.return_value = Path("/tmp/test.mp4")

        def consume_coroutine(coro):
            return MagicMock()

        mock_create_task.side_effect = consume_coroutine

        task_ids = []

        # Create multiple tasks
        for i in range(5):
            response = client.post(
                "/api/v1/video/compress/async",
                files=create_mock_video_file(f"video_{i}.mp4"),
                data={"quality": "medium"},
            )
            task_ids.append(response.json()["task_id"])

        # All tasks should exist
        list_response = client.get("/api/v1/tasks/")
        assert list_response.json()["count"] == 5

        # Each task should be accessible
        for task_id in task_ids:
            status = client.get(f"/api/v1/tasks/{task_id}/status")
            assert status.status_code == 200
