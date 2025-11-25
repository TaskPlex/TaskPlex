"""
Task models for background processing
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Optional
import uuid


class TaskStatus(str, Enum):
    """Task status enumeration"""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskProgress:
    """Progress information for a task"""

    percent: float = 0.0
    message: str = ""
    stage: str = ""

    def to_dict(self) -> dict:
        return {
            "percent": self.percent,
            "message": self.message,
            "stage": self.stage,
        }


@dataclass
class TaskResult:
    """Result of a completed task"""

    success: bool = False
    download_url: Optional[str] = None
    filename: Optional[str] = None
    original_size: Optional[int] = None
    processed_size: Optional[int] = None
    compression_ratio: Optional[float] = None
    message: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "download_url": self.download_url,
            "filename": self.filename,
            "original_size": self.original_size,
            "processed_size": self.processed_size,
            "compression_ratio": self.compression_ratio,
            "message": self.message,
            "error": self.error,
        }


@dataclass
class Task:
    """Represents a background task"""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    task_type: str = ""
    status: TaskStatus = TaskStatus.PENDING
    progress: TaskProgress = field(default_factory=TaskProgress)
    result: Optional[TaskResult] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: dict = field(default_factory=dict)

    def update_progress(self, percent: float, message: str = "", stage: str = ""):
        """Update task progress"""
        self.progress.percent = min(max(percent, 0), 100)
        self.progress.message = message
        self.progress.stage = stage
        self.updated_at = datetime.now()

    def complete(self, result: TaskResult):
        """Mark task as completed"""
        self.status = TaskStatus.COMPLETED
        self.progress.percent = 100
        self.result = result
        self.updated_at = datetime.now()

    def fail(self, error: str):
        """Mark task as failed"""
        self.status = TaskStatus.FAILED
        self.result = TaskResult(success=False, error=error)
        self.updated_at = datetime.now()

    def cancel(self):
        """Mark task as cancelled"""
        self.status = TaskStatus.CANCELLED
        self.updated_at = datetime.now()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "task_type": self.task_type,
            "status": self.status.value,
            "progress": self.progress.to_dict(),
            "result": self.result.to_dict() if self.result else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
