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
from app.tasks.models import TaskResult, TaskStatus
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


async def merge_videos_with_progress(
    task_id: str,
    input_paths: list[Path],
    output_path: Path,
    output_format: str = "mp4",
    quality: str = "medium",
    merge_mode: str = "quality",
) -> TaskResult:
    """
    Merge multiple videos with real-time progress updates via FFmpeg

    Progress is tracked by parsing FFmpeg stdout output
    """
    concat_file = None
    try:
        if len(input_paths) < 2:
            task_store.fail_task(task_id, "At least 2 video files are required for merging")
            return TaskResult(
                success=False, error="At least 2 video files are required for merging"
            )

        # Update task: Starting
        task_store.update_progress(task_id, 0, "Analyzing videos...", "analyzing")

        # Calculate total original size
        total_original_size = sum(get_file_size(path) for path in input_paths)

        # Calculate total duration for progress calculation
        total_duration = 0
        for input_path in input_paths:
            duration = get_video_duration(input_path)
            if duration:
                total_duration += duration
        if not total_duration:
            total_duration = 100  # Fallback

        # Create concat file for FFmpeg concat demuxer
        concat_file = output_path.parent / f"concat_{output_path.stem}.txt"
        try:
            with open(concat_file, "w") as f:
                for input_path in input_paths:
                    abs_path = input_path.resolve()
                    escaped_path = str(abs_path).replace("'", "'\\''")
                    f.write(f"file '{escaped_path}'\n")
        except Exception as e:
            task_store.fail_task(task_id, f"Error creating concat file: {str(e)}")
            return TaskResult(success=False, error=f"Error creating concat file: {str(e)}")

        if merge_mode == "fast":
            # Fast mode: copy streams without re-encoding (very fast)
            task_store.update_progress(task_id, 10, "Merging videos (fast mode)...", "encoding")

            cmd = [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-c",
                "copy",  # Copy all streams without re-encoding
                str(output_path),
            ]

            # Run FFmpeg (fast mode doesn't need progress tracking as it's very quick)
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            # Wait for process to complete, checking for cancellation
            try:
                _, stderr = await process.communicate()
            except asyncio.CancelledError:
                # Kill the process if task is cancelled
                try:
                    process.kill()
                    await process.wait()
                except Exception:
                    pass
                raise

            # Check if task was cancelled
            task = task_store.get_task(task_id)
            if task and task.status == TaskStatus.CANCELLED:
                try:
                    process.kill()
                    await process.wait()
                except Exception:
                    pass
                task_store.cancel_task(task_id)
                return TaskResult(success=False, error="Task cancelled")

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "FFmpeg error"
                # Provide helpful error message for fast mode failures
                if (
                    "Invalid data found" in error_msg
                    or "cannot find a valid video" in error_msg.lower()
                ):
                    error_msg = (
                        "Fast mode failed: Videos must have identical codecs, resolution, fps, and audio format. "
                        "Try using 'Quality' mode instead for automatic compatibility."
                    )
                task_store.fail_task(task_id, error_msg[:500])
                return TaskResult(success=False, error=error_msg[:500])

            # Fast mode is quick, so we can mark as complete
            task_store.update_progress(task_id, 99, "Finalizing...", "finalizing")

        else:
            # Quality mode: re-encode for compatibility (slower but more reliable)
            # Detect encoder
            encoder = get_available_h264_encoder()
            if not encoder:
                task_store.fail_task(task_id, "No H.264 encoder available")
                return TaskResult(
                    success=False,
                    error="No H.264 encoder available. Please install FFmpeg with H.264 support.",
                )

            task_store.update_progress(task_id, 5, "Starting merge (quality mode)...", "encoding")

            # Get compression preset
            preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])

            # Build FFmpeg command with concat demuxer
            cmd = [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
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
                # Check if task was cancelled
                task = task_store.get_task(task_id)
                if task and task.status == TaskStatus.CANCELLED:
                    try:
                        process.kill()
                        await process.wait()
                    except Exception:
                        pass
                    task_store.cancel_task(task_id)
                    return TaskResult(success=False, error="Task cancelled")

                line = await process.stdout.readline()
                if not line:
                    break

                line_str = line.decode().strip()

                # Parse out_time_ms from FFmpeg progress
                if line_str.startswith("out_time_ms="):
                    try:
                        time_ms = int(line_str.split("=")[1])
                        current_time = time_ms / 1_000_000  # Convert to seconds
                        percent = min((current_time / total_duration) * 100, 99)
                        task_store.update_progress(
                            task_id, percent, f"Merging... {percent:.0f}%", "encoding"
                        )
                    except (ValueError, ZeroDivisionError):
                        pass

                # Check for end of progress
                if line_str.startswith("progress=end"):
                    break

            # Wait for process to complete, checking for cancellation
            try:
                _, stderr = await process.communicate()
            except asyncio.CancelledError:
                # Kill the process if task is cancelled
                try:
                    process.kill()
                    await process.wait()
                except Exception:
                    pass
                raise

            # Check if task was cancelled after process completion
            task = task_store.get_task(task_id)
            if task and task.status == TaskStatus.CANCELLED:
                task_store.cancel_task(task_id)
                return TaskResult(success=False, error="Task cancelled")

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "FFmpeg error"
                task_store.fail_task(task_id, error_msg[:500])
                return TaskResult(success=False, error=error_msg[:500])

            # Finalize
            task_store.update_progress(task_id, 99, "Finalizing...", "finalizing")

        # Get merged file size (for both modes)
        merged_size = get_file_size(output_path)

        result = TaskResult(
            success=True,
            download_url=f"/api/v1/download/{output_path.name}",
            filename=output_path.name,
            original_size=total_original_size,
            processed_size=merged_size,
            message=f"Successfully merged {len(input_paths)} videos",
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
    finally:
        # Clean up concat file
        if concat_file and concat_file.exists():
            try:
                concat_file.unlink()
            except Exception:
                pass
