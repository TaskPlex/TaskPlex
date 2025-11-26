"""
In-memory task store for managing background tasks
In production, this could be replaced with Redis or a database
"""

import asyncio
from datetime import datetime, timedelta
import threading
from typing import AsyncGenerator, Dict, Optional

from .models import Task, TaskProgress, TaskResult, TaskStatus


class TaskStore:
    """
    Thread-safe in-memory store for managing background tasks

    Features:
    - Create and track tasks
    - Update progress
    - Subscribe to task updates via async generators (for SSE)
    - Automatic cleanup of old tasks
    """

    def __init__(self, task_ttl_minutes: int = 30):
        self._tasks: Dict[str, Task] = {}
        self._subscribers: Dict[str, list] = {}  # task_id -> list of asyncio.Queue
        self._lock = threading.Lock()
        self._task_ttl = timedelta(minutes=task_ttl_minutes)

    def create_task(self, task_type: str, metadata: Optional[dict] = None) -> Task:
        """Create a new task and return it"""
        task = Task(
            task_type=task_type,
            status=TaskStatus.PENDING,
            metadata=metadata or {},
        )
        with self._lock:
            self._tasks[task.id] = task
            self._subscribers[task.id] = []
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        with self._lock:
            return self._tasks.get(task_id)

    def update_progress(
        self, task_id: str, percent: float, message: str = "", stage: str = ""
    ) -> bool:
        """
        Update task progress and notify subscribers
        Returns True if task exists, False otherwise
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                return False

            task.status = TaskStatus.PROCESSING
            task.update_progress(percent, message, stage)

            # Notify all subscribers
            self._notify_subscribers(
                task_id,
                {
                    "event": "progress",
                    "data": task.progress.to_dict(),
                },
            )

            return True

    def complete_task(self, task_id: str, result: TaskResult) -> bool:
        """Mark task as completed with result"""
        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                return False

            task.complete(result)

            # Notify all subscribers
            self._notify_subscribers(
                task_id,
                {
                    "event": "complete",
                    "data": result.to_dict(),
                },
            )

            return True

    def fail_task(self, task_id: str, error: str) -> bool:
        """Mark task as failed with error"""
        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                return False

            task.fail(error)

            # Notify all subscribers
            self._notify_subscribers(
                task_id,
                {
                    "event": "error",
                    "data": {"message": error},
                },
            )

            return True

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                return False

            task.cancel()

            # Notify all subscribers
            self._notify_subscribers(
                task_id,
                {
                    "event": "cancelled",
                    "data": {"message": "Task cancelled"},
                },
            )

            return True

    def _notify_subscribers(self, task_id: str, message: dict):
        """Send message to all subscribers of a task (call within lock)"""
        subscribers = self._subscribers.get(task_id, [])
        for queue in subscribers:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                pass  # Skip if queue is full

    async def subscribe(self, task_id: str) -> AsyncGenerator[dict, None]:
        """
        Subscribe to task updates via async generator
        Used for SSE streaming
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)

        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                yield {"event": "error", "data": {"message": "Task not found"}}
                return

            # If task is already completed or failed, send final status immediately
            if task.status == TaskStatus.COMPLETED:
                yield {"event": "complete", "data": task.result.to_dict() if task.result else {}}
                return
            elif task.status == TaskStatus.FAILED:
                yield {
                    "event": "error",
                    "data": {"message": task.result.error if task.result else "Task failed"},
                }
                return
            elif task.status == TaskStatus.CANCELLED:
                yield {"event": "cancelled", "data": {"message": "Task cancelled"}}
                return

            # Send current progress
            yield {"event": "progress", "data": task.progress.to_dict()}

            # Add subscriber
            self._subscribers[task_id].append(queue)

        try:
            while True:
                try:
                    # Wait for updates with timeout
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield message

                    # Stop if task completed, failed, or cancelled
                    if message["event"] in ("complete", "error", "cancelled"):
                        break

                except asyncio.TimeoutError:
                    # Send keepalive
                    task = self.get_task(task_id)
                    if task and task.status == TaskStatus.PROCESSING:
                        yield {"event": "progress", "data": task.progress.to_dict()}
                    else:
                        break

        finally:
            # Remove subscriber
            with self._lock:
                if task_id in self._subscribers:
                    try:
                        self._subscribers[task_id].remove(queue)
                    except ValueError:
                        pass

    def cleanup_old_tasks(self):
        """Remove tasks older than TTL"""
        cutoff = datetime.now() - self._task_ttl
        with self._lock:
            old_task_ids = [
                task_id for task_id, task in self._tasks.items() if task.updated_at < cutoff
            ]
            for task_id in old_task_ids:
                del self._tasks[task_id]
                if task_id in self._subscribers:
                    del self._subscribers[task_id]

        return len(old_task_ids)

    def get_all_tasks(self) -> Dict[str, Task]:
        """Get all tasks (for debugging)"""
        with self._lock:
            return dict(self._tasks)


# Global task store instance
task_store = TaskStore()
