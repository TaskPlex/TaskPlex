"""
Tests for TaskStore
"""

import asyncio
from datetime import datetime, timedelta

import pytest

from app.tasks.models import Task, TaskProgress, TaskResult, TaskStatus
from app.tasks.store import TaskStore


class TestTaskStore:
    """Tests for TaskStore class"""

    def test_create_task(self):
        """Test task creation"""
        store = TaskStore()
        task = store.create_task("video_compress", {"quality": "high"})

        assert task.id is not None
        assert task.task_type == "video_compress"
        assert task.metadata == {"quality": "high"}
        assert task.status == TaskStatus.PENDING

    def test_get_task(self):
        """Test getting a task by ID"""
        store = TaskStore()
        task = store.create_task("test_task")

        retrieved = store.get_task(task.id)

        assert retrieved is not None
        assert retrieved.id == task.id

    def test_get_nonexistent_task(self):
        """Test getting a task that doesn't exist"""
        store = TaskStore()

        result = store.get_task("nonexistent-id")

        assert result is None

    def test_update_progress(self):
        """Test progress update"""
        store = TaskStore()
        task = store.create_task("test_task")

        success = store.update_progress(task.id, 50.0, "Processing...", "encoding")

        assert success is True
        updated_task = store.get_task(task.id)
        assert updated_task.progress.percent == 50.0
        assert updated_task.progress.message == "Processing..."
        assert updated_task.status == TaskStatus.PROCESSING

    def test_update_progress_nonexistent_task(self):
        """Test updating progress for nonexistent task"""
        store = TaskStore()

        success = store.update_progress("nonexistent", 50.0)

        assert success is False

    def test_complete_task(self):
        """Test task completion"""
        store = TaskStore()
        task = store.create_task("test_task")
        result = TaskResult(success=True, message="Done")

        success = store.complete_task(task.id, result)

        assert success is True
        completed_task = store.get_task(task.id)
        assert completed_task.status == TaskStatus.COMPLETED
        assert completed_task.result.success is True

    def test_complete_nonexistent_task(self):
        """Test completing nonexistent task"""
        store = TaskStore()
        result = TaskResult(success=True)

        success = store.complete_task("nonexistent", result)

        assert success is False

    def test_fail_task(self):
        """Test task failure"""
        store = TaskStore()
        task = store.create_task("test_task")

        success = store.fail_task(task.id, "Error occurred")

        assert success is True
        failed_task = store.get_task(task.id)
        assert failed_task.status == TaskStatus.FAILED
        assert failed_task.result.error == "Error occurred"

    def test_fail_nonexistent_task(self):
        """Test failing nonexistent task"""
        store = TaskStore()

        success = store.fail_task("nonexistent", "Error")

        assert success is False

    def test_cancel_task(self):
        """Test task cancellation"""
        store = TaskStore()
        task = store.create_task("test_task")
        store.update_progress(task.id, 50.0)

        success = store.cancel_task(task.id)

        assert success is True
        cancelled_task = store.get_task(task.id)
        assert cancelled_task.status == TaskStatus.CANCELLED

    def test_cancel_nonexistent_task(self):
        """Test cancelling nonexistent task"""
        store = TaskStore()

        success = store.cancel_task("nonexistent")

        assert success is False

    def test_get_all_tasks(self):
        """Test getting all tasks"""
        store = TaskStore()
        store.create_task("task1")
        store.create_task("task2")
        store.create_task("task3")

        all_tasks = store.get_all_tasks()

        assert len(all_tasks) == 3

    def test_cleanup_old_tasks(self):
        """Test cleanup of old tasks"""
        store = TaskStore(task_ttl_minutes=0)  # Immediate expiration
        task = store.create_task("old_task")

        # Manually set old timestamp
        store._tasks[task.id].updated_at = datetime.now() - timedelta(minutes=1)

        cleaned = store.cleanup_old_tasks()

        assert cleaned == 1
        assert store.get_task(task.id) is None


class TestTaskStoreAsync:
    """Async tests for TaskStore"""

    @pytest.mark.asyncio
    async def test_subscribe_completed_task(self):
        """Test subscribing to already completed task"""
        store = TaskStore()
        task = store.create_task("test_task")
        store.complete_task(task.id, TaskResult(success=True, message="Done"))

        messages = []
        async for msg in store.subscribe(task.id):
            messages.append(msg)

        assert len(messages) == 1
        assert messages[0]["event"] == "complete"

    @pytest.mark.asyncio
    async def test_subscribe_failed_task(self):
        """Test subscribing to already failed task"""
        store = TaskStore()
        task = store.create_task("test_task")
        store.fail_task(task.id, "Error")

        messages = []
        async for msg in store.subscribe(task.id):
            messages.append(msg)

        assert len(messages) == 1
        assert messages[0]["event"] == "error"

    @pytest.mark.asyncio
    async def test_subscribe_cancelled_task(self):
        """Test subscribing to cancelled task"""
        store = TaskStore()
        task = store.create_task("test_task")
        store.cancel_task(task.id)

        messages = []
        async for msg in store.subscribe(task.id):
            messages.append(msg)

        assert len(messages) == 1
        assert messages[0]["event"] == "cancelled"

    @pytest.mark.asyncio
    async def test_subscribe_nonexistent_task(self):
        """Test subscribing to nonexistent task"""
        store = TaskStore()

        messages = []
        async for msg in store.subscribe("nonexistent"):
            messages.append(msg)

        assert len(messages) == 1
        assert messages[0]["event"] == "error"
        assert "not found" in messages[0]["data"]["message"]

    @pytest.mark.asyncio
    async def test_subscribe_receives_progress_updates(self):
        """Test that subscriber receives progress updates"""
        store = TaskStore()
        task = store.create_task("test_task")

        async def update_progress():
            await asyncio.sleep(0.05)
            store.update_progress(task.id, 50.0, "Half done")
            await asyncio.sleep(0.05)
            store.complete_task(task.id, TaskResult(success=True))

        # Start progress updates in background
        asyncio.create_task(update_progress())

        messages = []
        async for msg in store.subscribe(task.id):
            messages.append(msg)
            if msg["event"] == "complete":
                break

        # Should have initial progress + update + complete
        assert len(messages) >= 2
        assert any(m["event"] == "progress" for m in messages)
        assert messages[-1]["event"] == "complete"

    @pytest.mark.asyncio
    async def test_multiple_subscribers(self):
        """Test multiple subscribers receive updates"""
        store = TaskStore()
        task = store.create_task("test_task")

        received_1 = []
        received_2 = []

        async def subscriber1():
            async for msg in store.subscribe(task.id):
                received_1.append(msg)
                if msg["event"] == "complete":
                    break

        async def subscriber2():
            async for msg in store.subscribe(task.id):
                received_2.append(msg)
                if msg["event"] == "complete":
                    break

        async def update_task():
            await asyncio.sleep(0.05)
            store.update_progress(task.id, 100.0)
            store.complete_task(task.id, TaskResult(success=True))

        await asyncio.gather(
            subscriber1(),
            subscriber2(),
            update_task(),
        )

        # Both subscribers should receive complete event
        assert any(m["event"] == "complete" for m in received_1)
        assert any(m["event"] == "complete" for m in received_2)
