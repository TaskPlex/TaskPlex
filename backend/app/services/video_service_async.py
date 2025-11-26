"""
Async video processing service with progress tracking
Uses FFmpeg with progress parsing for real-time updates
"""

import asyncio
import os
from pathlib import Path
import re
import subprocess
from typing import Callable, Optional

from app.config import VIDEO_COMPRESSION_PRESETS
from app.tasks.models import TaskResult
from app.tasks.store import task_store
from app.utils.file_handler import calculate_compression_ratio, get_file_size


def get_available_h264_encoder() -> Optional[str]:
    """Detect available H.264 encoder on the system"""
    encoders = ["libx264", "libopenh264", "h264_vaapi"]

    try:
        result = subprocess.run(["ffmpeg", "-encoders"], capture_output=True, text=True)
        available_encoders = result.stdout

        for encoder in encoders:
            if encoder in available_encoders:
                return encoder
        return None
    except Exception:
        return None


def get_video_duration(input_path: Path) -> Optional[float]:
    """Get video duration in seconds using ffprobe"""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(input_path),
            ],
            capture_output=True,
            text=True,
        )
        return float(result.stdout.strip())
    except Exception:
        return None


async def compress_video_with_progress(
    task_id: str,
    input_path: Path,
    output_path: Path,
    quality: str = "medium",
) -> TaskResult:
    """
    Compress video with real-time progress updates via FFmpeg

    Progress is tracked by parsing FFmpeg stderr output
    """
    try:
        # Update task: Starting
        task_store.update_progress(task_id, 0, "Analyzing video...", "analyzing")

        # Get original file size
        original_size = get_file_size(input_path)

        # Get video duration for progress calculation
        duration = get_video_duration(input_path)
        if not duration:
            duration = 100  # Fallback if we can't determine duration

        # Get compression preset
        preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])

        # Detect encoder
        encoder = get_available_h264_encoder()
        if not encoder:
            task_store.fail_task(task_id, "No H.264 encoder available")
            return TaskResult(
                success=False,
                error="No H.264 encoder available. Please install FFmpeg with H.264 support.",
            )

        task_store.update_progress(task_id, 5, "Starting compression...", "encoding")

        # Build FFmpeg command
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(input_path),
            "-c:v",
            encoder,
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-progress",
            "pipe:1",  # Output progress to stdout
            "-nostats",
        ]

        # Add quality parameters
        if encoder == "libx264":
            cmd.extend(["-crf", str(preset["crf"]), "-preset", preset["preset"]])
        else:
            quality_map = {"low": "1M", "medium": "2.5M", "high": "5M"}
            cmd.extend(["-b:v", quality_map.get(quality, "2.5M")])

        cmd.append(str(output_path))

        # Run FFmpeg with progress tracking
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        # Parse progress from stdout
        current_time = 0
        while True:
            line = await process.stdout.readline()
            if not line:
                break

            line_str = line.decode().strip()

            # Parse out_time_ms from FFmpeg progress
            if line_str.startswith("out_time_ms="):
                try:
                    time_ms = int(line_str.split("=")[1])
                    current_time = time_ms / 1_000_000  # Convert to seconds
                    percent = min((current_time / duration) * 100, 99)
                    task_store.update_progress(
                        task_id, percent, f"Encoding... {percent:.0f}%", "encoding"
                    )
                except (ValueError, ZeroDivisionError):
                    pass

            # Check for end of progress
            if line_str.startswith("progress=end"):
                break

        # Wait for process to complete
        _, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "FFmpeg error"
            task_store.fail_task(task_id, error_msg[:500])
            return TaskResult(success=False, error=error_msg[:500])

        # Finalize
        task_store.update_progress(task_id, 99, "Finalizing...", "finalizing")

        # Get compressed file size
        compressed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, compressed_size)

        result = TaskResult(
            success=True,
            download_url=f"/api/v1/download/{output_path.name}",
            filename=output_path.name,
            original_size=original_size,
            processed_size=compressed_size,
            compression_ratio=compression_ratio,
            message="Video compressed successfully",
        )

        task_store.complete_task(task_id, result)
        return result

    except asyncio.CancelledError:
        task_store.cancel_task(task_id)
        raise
    except Exception as e:
        error_msg = str(e)[:500]
        task_store.fail_task(task_id, error_msg)
        return TaskResult(success=False, error=error_msg)


async def convert_video_with_progress(
    task_id: str,
    input_path: Path,
    output_path: Path,
    output_format: str,
    quality: str = "medium",
) -> TaskResult:
    """
    Convert video to different format with real-time progress updates
    """
    try:
        task_store.update_progress(task_id, 0, "Analyzing video...", "analyzing")

        original_size = get_file_size(input_path)
        duration = get_video_duration(input_path) or 100

        preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])
        encoder = get_available_h264_encoder()

        if not encoder:
            task_store.fail_task(task_id, "No H.264 encoder available")
            return TaskResult(success=False, error="No H.264 encoder available")

        task_store.update_progress(task_id, 5, "Starting conversion...", "encoding")

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(input_path),
            "-c:v",
            encoder,
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-progress",
            "pipe:1",
            "-nostats",
        ]

        if encoder == "libx264":
            cmd.extend(["-crf", str(preset["crf"]), "-preset", preset["preset"]])
        else:
            quality_map = {"low": "1M", "medium": "2.5M", "high": "5M"}
            cmd.extend(["-b:v", quality_map.get(quality, "2.5M")])

        cmd.append(str(output_path))

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        while True:
            line = await process.stdout.readline()
            if not line:
                break

            line_str = line.decode().strip()

            if line_str.startswith("out_time_ms="):
                try:
                    time_ms = int(line_str.split("=")[1])
                    current_time = time_ms / 1_000_000
                    percent = min((current_time / duration) * 100, 99)
                    task_store.update_progress(
                        task_id, percent, f"Converting... {percent:.0f}%", "encoding"
                    )
                except (ValueError, ZeroDivisionError):
                    pass

            if line_str.startswith("progress=end"):
                break

        _, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "FFmpeg error"
            task_store.fail_task(task_id, error_msg[:500])
            return TaskResult(success=False, error=error_msg[:500])

        task_store.update_progress(task_id, 99, "Finalizing...", "finalizing")

        converted_size = get_file_size(output_path)

        result = TaskResult(
            success=True,
            download_url=f"/api/v1/download/{output_path.name}",
            filename=output_path.name,
            original_size=original_size,
            processed_size=converted_size,
            message=f"Video converted to {output_format.upper()} successfully",
        )

        task_store.complete_task(task_id, result)
        return result

    except asyncio.CancelledError:
        task_store.cancel_task(task_id)
        raise
    except Exception as e:
        error_msg = str(e)[:500]
        task_store.fail_task(task_id, error_msg)
        return TaskResult(success=False, error=error_msg)
