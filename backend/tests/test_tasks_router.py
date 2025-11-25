"""
Tests for tasks router endpoints
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.tasks import task_store
from app.tasks.models import TaskResult, TaskStatus


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_tasks():
    """Clean up tasks before and after each test"""
    # Clear all tasks before test
    task_store._tasks.clear()
    task_store._subscribers.clear()
    yield
    # Clear after test
    task_store._tasks.clear()
    task_store._subscribers.clear()


class TestTaskStatusEndpoint:
    """Tests for GET /api/v1/tasks/{task_id}/status"""

    def test_get_task_status(self, client):
        """Test getting task status"""
        task = task_store.create_task("test_task", {"key": "value"})

        response = client.get(f"/api/v1/tasks/{task.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task.id
        assert data["task_type"] == "test_task"
        assert data["status"] == "pending"

    def test_get_task_status_processing(self, client):
        """Test getting status of processing task"""
        task = task_store.create_task("test_task")
        task_store.update_progress(task.id, 50.0, "Processing...", "encoding")

        response = client.get(f"/api/v1/tasks/{task.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "processing"
        assert data["progress"]["percent"] == 50.0

    def test_get_task_status_completed(self, client):
        """Test getting status of completed task"""
        task = task_store.create_task("test_task")
        task_store.complete_task(
            task.id,
            TaskResult(success=True, download_url="/download/file.mp4"),
        )

        response = client.get(f"/api/v1/tasks/{task.id}/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["result"]["success"] is True

    def test_get_task_status_not_found(self, client):
        """Test getting status of nonexistent task"""
        response = client.get("/api/v1/tasks/nonexistent-id/status")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestCancelTaskEndpoint:
    """Tests for POST /api/v1/tasks/{task_id}/cancel"""

    def test_cancel_task(self, client):
        """Test cancelling a task"""
        task = task_store.create_task("test_task")
        task_store.update_progress(task.id, 50.0)

        response = client.post(f"/api/v1/tasks/{task.id}/cancel")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify task is cancelled
        cancelled_task = task_store.get_task(task.id)
        assert cancelled_task.status == TaskStatus.CANCELLED

    def test_cancel_nonexistent_task(self, client):
        """Test cancelling nonexistent task"""
        response = client.post("/api/v1/tasks/nonexistent-id/cancel")

        assert response.status_code == 404


class TestListTasksEndpoint:
    """Tests for GET /api/v1/tasks/"""

    def test_list_tasks_empty(self, client):
        """Test listing tasks when none exist"""
        response = client.get("/api/v1/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert data["tasks"] == []

    def test_list_tasks(self, client):
        """Test listing multiple tasks"""
        task_store.create_task("task1")
        task_store.create_task("task2")
        task_store.create_task("task3")

        response = client.get("/api/v1/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 3
        assert len(data["tasks"]) == 3


class TestStreamEndpoint:
    """Tests for GET /api/v1/tasks/{task_id}/stream (SSE)"""

    def test_stream_completed_task(self, client):
        """Test streaming already completed task"""
        task = task_store.create_task("test_task")
        task_store.complete_task(task.id, TaskResult(success=True, message="Done"))

        # Use stream=True to get SSE response
        with client.stream("GET", f"/api/v1/tasks/{task.id}/stream") as response:
            assert response.status_code == 200
            # Read first event
            for line in response.iter_lines():
                if line.startswith("event:"):
                    assert "complete" in line
                    break

    def test_stream_failed_task(self, client):
        """Test streaming already failed task"""
        task = task_store.create_task("test_task")
        task_store.fail_task(task.id, "Test error")

        with client.stream("GET", f"/api/v1/tasks/{task.id}/stream") as response:
            assert response.status_code == 200
            for line in response.iter_lines():
                if line.startswith("event:"):
                    assert "error" in line
                    break

    def test_stream_nonexistent_task(self, client):
        """Test streaming nonexistent task returns 404"""
        response = client.get("/api/v1/tasks/nonexistent-id/stream")
        assert response.status_code == 404
