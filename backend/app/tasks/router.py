"""
Task API endpoints for SSE streaming and task management
"""
import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from .store import task_store


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/{task_id}/status")
async def get_task_status(task_id: str):
    """
    Get current status of a task (polling fallback)
    """
    task = task_store.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task.to_dict()


@router.get("/{task_id}/stream")
async def stream_task_progress(task_id: str):
    """
    Stream task progress updates via Server-Sent Events (SSE)
    
    Events:
    - progress: { percent: number, message: string, stage: string }
    - complete: { success: true, download_url: string, ... }
    - error: { message: string }
    - cancelled: { message: string }
    
    The stream closes automatically when task completes, fails, or is cancelled.
    """
    task = task_store.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    async def event_generator():
        async for message in task_store.subscribe(task_id):
            yield {
                "event": message["event"],
                "data": json.dumps(message["data"]),
            }
    
    return EventSourceResponse(event_generator())


@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str):
    """
    Cancel a running task
    """
    task = task_store.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    success = task_store.cancel_task(task_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel task")
    
    return {"success": True, "message": "Task cancelled"}


@router.get("/")
async def list_tasks():
    """
    List all tasks (for debugging)
    """
    tasks = task_store.get_all_tasks()
    return {
        "count": len(tasks),
        "tasks": [task.to_dict() for task in tasks.values()]
    }

