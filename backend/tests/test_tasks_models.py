"""
Tests for task models
"""

from datetime import datetime

import pytest

from app.tasks.models import Task, TaskProgress, TaskResult, TaskStatus


class TestTaskStatus:
    """Tests for TaskStatus enum"""

    def test_status_values(self):
        """Test that all status values exist"""
        assert TaskStatus.PENDING == "pending"
        assert TaskStatus.PROCESSING == "processing"
        assert TaskStatus.COMPLETED == "completed"
        assert TaskStatus.FAILED == "failed"
        assert TaskStatus.CANCELLED == "cancelled"


class TestTaskProgress:
    """Tests for TaskProgress dataclass"""

    def test_default_values(self):
        """Test default initialization"""
        progress = TaskProgress()
        assert progress.percent == 0.0
        assert progress.message == ""
        assert progress.stage == ""

    def test_custom_values(self):
        """Test custom initialization"""
        progress = TaskProgress(percent=50.0, message="Processing...", stage="encoding")
        assert progress.percent == 50.0
        assert progress.message == "Processing..."
        assert progress.stage == "encoding"

    def test_to_dict(self):
        """Test dictionary conversion"""
        progress = TaskProgress(percent=75.5, message="Almost done", stage="finalizing")
        result = progress.to_dict()
        assert result == {
            "percent": 75.5,
            "message": "Almost done",
            "stage": "finalizing",
        }


class TestTaskResult:
    """Tests for TaskResult dataclass"""

    def test_default_values(self):
        """Test default initialization"""
        result = TaskResult()
        assert result.success is False
        assert result.download_url is None
        assert result.filename is None
        assert result.original_size is None
        assert result.processed_size is None
        assert result.compression_ratio is None
        assert result.message is None
        assert result.error is None

    def test_success_result(self):
        """Test successful result"""
        result = TaskResult(
            success=True,
            download_url="/api/v1/download/video.mp4",
            filename="video.mp4",
            original_size=10000000,
            processed_size=5000000,
            compression_ratio=50.0,
            message="Compression successful",
        )
        assert result.success is True
        assert result.download_url == "/api/v1/download/video.mp4"
        assert result.compression_ratio == 50.0

    def test_error_result(self):
        """Test error result"""
        result = TaskResult(success=False, error="File too large")
        assert result.success is False
        assert result.error == "File too large"

    def test_to_dict(self):
        """Test dictionary conversion"""
        result = TaskResult(
            success=True,
            download_url="/download/file.mp4",
            filename="file.mp4",
            original_size=1000,
            processed_size=500,
            compression_ratio=50.0,
            message="Done",
        )
        d = result.to_dict()
        assert d["success"] is True
        assert d["download_url"] == "/download/file.mp4"
        assert d["filename"] == "file.mp4"
        assert d["compression_ratio"] == 50.0


class TestTask:
    """Tests for Task dataclass"""

    def test_default_initialization(self):
        """Test default task creation"""
        task = Task()
        assert task.id is not None
        assert len(task.id) == 36  # UUID format
        assert task.task_type == ""
        assert task.status == TaskStatus.PENDING
        assert isinstance(task.progress, TaskProgress)
        assert task.result is None
        assert isinstance(task.created_at, datetime)
        assert isinstance(task.updated_at, datetime)
        assert task.metadata == {}

    def test_custom_initialization(self):
        """Test task with custom values"""
        task = Task(task_type="video_compress", metadata={"quality": "high"})
        assert task.task_type == "video_compress"
        assert task.metadata == {"quality": "high"}

    def test_update_progress(self):
        """Test progress update"""
        task = Task()
        old_updated = task.updated_at

        task.update_progress(50.0, "Encoding...", "encoding")

        assert task.progress.percent == 50.0
        assert task.progress.message == "Encoding..."
        assert task.progress.stage == "encoding"
        assert task.updated_at >= old_updated

    def test_update_progress_clamps_values(self):
        """Test that progress is clamped to 0-100"""
        task = Task()

        task.update_progress(-10)
        assert task.progress.percent == 0

        task.update_progress(150)
        assert task.progress.percent == 100

    def test_complete(self):
        """Test task completion"""
        task = Task()
        result = TaskResult(success=True, message="Done")

        task.complete(result)

        assert task.status == TaskStatus.COMPLETED
        assert task.progress.percent == 100
        assert task.result == result

    def test_fail(self):
        """Test task failure"""
        task = Task()

        task.fail("Something went wrong")

        assert task.status == TaskStatus.FAILED
        assert task.result is not None
        assert task.result.success is False
        assert task.result.error == "Something went wrong"

    def test_cancel(self):
        """Test task cancellation"""
        task = Task()
        task.status = TaskStatus.PROCESSING

        task.cancel()

        assert task.status == TaskStatus.CANCELLED

    def test_to_dict(self):
        """Test dictionary conversion"""
        task = Task(task_type="test_task")
        task.update_progress(25.0, "Testing")

        d = task.to_dict()

        assert "id" in d
        assert d["task_type"] == "test_task"
        assert d["status"] == "pending"
        assert d["progress"]["percent"] == 25.0
        assert "created_at" in d
        assert "updated_at" in d

    def test_to_dict_with_result(self):
        """Test dictionary conversion with result"""
        task = Task()
        task.complete(TaskResult(success=True, message="Done"))

        d = task.to_dict()

        assert d["status"] == "completed"
        assert d["result"]["success"] is True
