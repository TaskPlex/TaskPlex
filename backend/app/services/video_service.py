"""
Video processing service using FFmpeg
"""

from pathlib import Path
import subprocess
from typing import Optional

import ffmpeg

from app.config import VIDEO_COMPRESSION_PRESETS
from app.models.video import VideoProcessingResponse
from app.utils.file_handler import calculate_compression_ratio, get_file_size


def get_available_h264_encoder():
    """
    Detect available H.264 encoder on the system
    Returns the best available encoder in order of preference
    """
    # Simplified list of common encoders
    encoders = [
        "libx264",  # Most common, best quality
        "libopenh264",  # Open source alternative
        "h264_vaapi",  # Linux hardware encoder
    ]

    try:
        # Get list of available encoders from ffmpeg
        result = subprocess.run(["ffmpeg", "-encoders"], capture_output=True, text=True)
        available_encoders = result.stdout

        # Find first available encoder
        for encoder in encoders:
            if encoder in available_encoders:
                return encoder

        # If none found, return None
        return None
    except Exception:
        return None


def compress_video(
    input_path: Path, output_path: Path, quality: str = "medium"
) -> VideoProcessingResponse:
    """
    Compress a video file using FFmpeg

    Args:
        input_path: Path to input video
        output_path: Path to save compressed video
        quality: Compression quality preset (low, medium, high)

    Returns:
        VideoProcessingResponse with compression results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Get compression preset
        preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])

        # Detect available H.264 encoder
        encoder = get_available_h264_encoder()

        if encoder is None:
            return VideoProcessingResponse(
                success=False,
                message="No H.264 encoder available. Please install FFmpeg with H.264 support.",
                filename=output_path.name if output_path else None,
            )

        # Compress video using FFmpeg
        stream = ffmpeg.input(str(input_path))

        # Build output options based on encoder
        output_options = {"c:v": encoder, "c:a": "aac", "b:a": "128k"}

        # Add quality parameters based on encoder type
        if encoder == "libx264":
            # libx264: Use CRF (Constant Rate Factor) - best quality
            output_options["crf"] = preset["crf"]
            output_options["preset"] = preset["preset"]
        elif encoder in ["libopenh264", "h264_vaapi"]:
            # Bitrate-based encoders
            quality_map = {"low": "1M", "medium": "2.5M", "high": "5M"}
            output_options["b:v"] = quality_map.get(quality, "2.5M")

        stream = ffmpeg.output(stream, str(output_path), **output_options)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get compressed file size
        compressed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, compressed_size)

        return VideoProcessingResponse(
            success=True,
            message="Video compressed successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=compressed_size,
            compression_ratio=compression_ratio,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error compressing video: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def convert_video(
    input_path: Path, output_path: Path, output_format: str, quality: str = "medium"
) -> VideoProcessingResponse:
    """
    Convert a video to a different format

    Args:
        input_path: Path to input video
        output_path: Path to save converted video
        output_format: Target format (mp4, avi, mov, etc.)
        quality: Conversion quality preset

    Returns:
        VideoProcessingResponse with conversion results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Get compression preset
        preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])

        # Detect available H.264 encoder
        encoder = get_available_h264_encoder()

        if encoder is None:
            return VideoProcessingResponse(
                success=False,
                message="No H.264 encoder available. Please install FFmpeg with H.264 support.",
                filename=output_path.name if output_path else None,
            )

        # Convert video using FFmpeg
        stream = ffmpeg.input(str(input_path))

        # Build output options based on encoder
        output_options = {"c:v": encoder, "c:a": "aac", "b:a": "128k"}

        # Add quality parameters based on encoder type
        if encoder == "libx264":
            # libx264: Use CRF (Constant Rate Factor) - best quality
            output_options["crf"] = preset["crf"]
            output_options["preset"] = preset["preset"]
        elif encoder in ["libopenh264", "h264_vaapi"]:
            # Bitrate-based encoders
            quality_map = {"low": "1M", "medium": "2.5M", "high": "5M"}
            output_options["b:v"] = quality_map.get(quality, "2.5M")

        stream = ffmpeg.output(stream, str(output_path), **output_options)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get converted file size
        converted_size = get_file_size(output_path)

        return VideoProcessingResponse(
            success=True,
            message=f"Video converted to {output_format.upper()} successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=converted_size,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error converting video: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def rotate_video(input_path: Path, output_path: Path, angle: int) -> VideoProcessingResponse:
    """
    Rotate a video by a specified angle

    Args:
        input_path: Path to input video
        output_path: Path to save rotated video
        angle: Rotation angle in degrees (90, 180, or 270)

    Returns:
        VideoProcessingResponse with rotation results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Detect available H.264 encoder (needed for re-encoding after rotation)
        encoder = get_available_h264_encoder()
        if encoder is None:
            return VideoProcessingResponse(
                success=False,
                message="No H.264 encoder available. Please install FFmpeg with H.264 support.",
                filename=output_path.name if output_path else None,
            )

        # Rotate video using FFmpeg
        # We need to re-encode because rotation changes video dimensions
        stream = ffmpeg.input(str(input_path))

        # Map angle to FFmpeg transpose filter
        # transpose=1: 90° clockwise
        # transpose=2: 90° counter-clockwise
        # For 180°, we apply transpose twice
        if angle == 90:
            stream = ffmpeg.filter(stream, "transpose", "1")
        elif angle == 180:
            stream = ffmpeg.filter(stream, "transpose", "1")
            stream = ffmpeg.filter(stream, "transpose", "1")
        elif angle == 270:
            stream = ffmpeg.filter(stream, "transpose", "2")
        else:
            return VideoProcessingResponse(
                success=False,
                message=f"Unsupported rotation angle: {angle}. Supported angles: 90, 180, 270",
                filename=output_path.name if output_path else None,
            )

        # Build output options with encoder
        output_options = {"c:v": encoder, "c:a": "aac", "b:a": "128k"}

        # Add quality parameters based on encoder type
        if encoder == "libx264":
            output_options["crf"] = "23"  # Good quality
            output_options["preset"] = "medium"
        elif encoder in ["libopenh264", "h264_vaapi"]:
            output_options["b:v"] = "2.5M"

        stream = ffmpeg.output(stream, str(output_path), **output_options)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        # Get rotated file size
        rotated_size = get_file_size(output_path)

        return VideoProcessingResponse(
            success=True,
            message=f"Video rotated {angle} degrees successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=rotated_size,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error rotating video: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def extract_audio(
    input_path: Path, output_path: Path, output_format: str = "mp3", bitrate: str = "192k"
) -> VideoProcessingResponse:
    """
    Extract audio from a video file and export to the desired audio format.
    """
    try:
        original_size = get_file_size(input_path)

        # Map codecs per format
        codec_map = {
            "mp3": "libmp3lame",
            "wav": "pcm_s16le",
            "flac": "flac",
            "ogg": "libvorbis",
        }

        codec = codec_map.get(output_format.lower())
        if codec is None:
            return VideoProcessingResponse(
                success=False,
                message="Unsupported output audio format",
                filename=output_path.name if output_path else None,
            )

        stream = ffmpeg.input(str(input_path))
        output_kwargs = {"vn": None, "acodec": codec}
        # Bitrate only if relevant
        if output_format.lower() in ["mp3", "ogg"]:
            output_kwargs["b:a"] = bitrate

        stream = ffmpeg.output(stream, str(output_path), **output_kwargs)
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        processed_size = get_file_size(output_path)

        return VideoProcessingResponse(
            success=True,
            message="Audio extracted successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error extracting audio: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def video_to_gif(
    input_path: Path,
    output_path: Path,
    start_time: float = 0.0,
    duration: Optional[float] = None,
    width: Optional[int] = None,
    fps: int = 12,
    loop: bool = True,
) -> VideoProcessingResponse:
    """
    Convert a video segment to an animated GIF using FFmpeg with palette optimization.

    Args:
        input_path: Path to input video.
        output_path: Path to save generated GIF.
        start_time: Start time in seconds.
        duration: Duration in seconds (optional).
        width: Target width in pixels (maintains aspect ratio).
        fps: Frames per second for the GIF.
        loop: Whether the GIF should loop indefinitely.

    Returns:
        VideoProcessingResponse with conversion results.
    """
    try:
        # Basic validation to avoid expensive FFmpeg runs for invalid params
        if start_time < 0:
            return VideoProcessingResponse(
                success=False,
                message="start_time must be non-negative",
                filename=output_path.name if output_path else None,
            )

        if duration is not None and duration <= 0:
            return VideoProcessingResponse(
                success=False,
                message="duration must be greater than 0 when provided",
                filename=output_path.name if output_path else None,
            )

        if fps < 1 or fps > 60:
            return VideoProcessingResponse(
                success=False,
                message="fps must be between 1 and 60",
                filename=output_path.name if output_path else None,
            )

        if width is not None and width < 32:
            return VideoProcessingResponse(
                success=False,
                message="width must be at least 32 pixels",
                filename=output_path.name if output_path else None,
            )

        original_size = get_file_size(input_path)

        input_kwargs = {}
        if start_time:
            input_kwargs["ss"] = start_time
        if duration:
            input_kwargs["t"] = duration

        # Build the FFmpeg pipeline with palette optimization
        stream = ffmpeg.input(str(input_path), **input_kwargs)
        stream = ffmpeg.filter(stream, "fps", fps)

        if width:
            stream = ffmpeg.filter(stream, "scale", width, -1, flags="lanczos")

        split_streams = stream.filter_multi_output("split")
        palette = split_streams[0].filter("palettegen")
        palette_use = ffmpeg.filter([split_streams[1], palette], "paletteuse")

        # loop=0 => infinite loop, loop=1 => play once then stop
        output = ffmpeg.output(palette_use, str(output_path), loop=0 if loop else 1)
        ffmpeg.run(output, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        processed_size = get_file_size(output_path)

        return VideoProcessingResponse(
            success=True,
            message="GIF created successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
        )

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error converting video to GIF: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def merge_videos(
    input_paths: list[Path],
    output_path: Path,
    output_format: str = "mp4",
    quality: str = "medium",
    merge_mode: str = "quality",
) -> VideoProcessingResponse:
    """
    Merge multiple video files into one using FFmpeg concat demuxer

    Args:
        input_paths: List of paths to input videos (in order)
        output_path: Path to save merged video
        output_format: Output video format (mp4, avi, mov, etc.)
        quality: Output quality preset (low, medium, high)

    Returns:
        VideoProcessingResponse with merge results
    """
    try:
        if len(input_paths) < 2:
            return VideoProcessingResponse(
                success=False,
                message="At least 2 video files are required for merging",
                filename=output_path.name if output_path else None,
            )

        # Calculate total original size
        total_original_size = sum(get_file_size(path) for path in input_paths)

        # Create concat file for FFmpeg concat demuxer
        # This is the most reliable method for merging videos
        concat_file = output_path.parent / f"concat_{output_path.stem}.txt"
        try:
            with open(concat_file, "w") as f:
                for input_path in input_paths:
                    # Use absolute path and escape single quotes
                    abs_path = input_path.resolve()
                    escaped_path = str(abs_path).replace("'", "'\\''")
                    f.write(f"file '{escaped_path}'\n")
        except Exception as e:
            return VideoProcessingResponse(
                success=False,
                message=f"Error creating concat file: {str(e)}",
                filename=output_path.name if output_path else None,
            )

        try:
            # Use concat demuxer for merging
            stream = ffmpeg.input(str(concat_file), format="concat", safe=0)

            if merge_mode == "fast":
                # Fast mode: copy streams without re-encoding (very fast)
                # Warning: requires all videos to have identical codecs, resolution, fps, etc.
                output_options = {"c": "copy"}  # Copy all streams without re-encoding
            else:
                # Quality mode: re-encode for compatibility (slower but more reliable)
                # Detect available H.264 encoder
                encoder = get_available_h264_encoder()
                if encoder is None:
                    return VideoProcessingResponse(
                        success=False,
                        message="No H.264 encoder available. Please install FFmpeg with H.264 support.",
                        filename=output_path.name if output_path else None,
                    )

                # Get compression preset
                preset = VIDEO_COMPRESSION_PRESETS.get(quality, VIDEO_COMPRESSION_PRESETS["medium"])

                # Build output options based on encoder
                output_options = {"c:v": encoder, "c:a": "aac", "b:a": "128k"}

                # Add quality parameters based on encoder type
                if encoder == "libx264":
                    output_options["crf"] = preset["crf"]
                    output_options["preset"] = preset["preset"]
                elif encoder in ["libopenh264", "h264_vaapi"]:
                    quality_map = {"low": "1M", "medium": "2.5M", "high": "5M"}
                    output_options["b:v"] = quality_map.get(quality, "2.5M")

            stream = ffmpeg.output(stream, str(output_path), **output_options)
            ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

            # Get merged file size
            merged_size = get_file_size(output_path)

            return VideoProcessingResponse(
                success=True,
                message=f"Successfully merged {len(input_paths)} videos",
                filename=output_path.name,
                download_url=f"/api/v1/download/{output_path.name}",
                original_size=total_original_size,
                processed_size=merged_size,
            )

        finally:
            # Clean up concat file
            if concat_file.exists():
                try:
                    concat_file.unlink()
                except Exception:
                    pass

    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else str(e)
        return VideoProcessingResponse(
            success=False,
            message=f"FFmpeg error: {error_message}",
            filename=output_path.name if output_path else None,
        )

    except Exception as e:
        return VideoProcessingResponse(
            success=False,
            message=f"Error merging videos: {str(e)}",
            filename=output_path.name if output_path else None,
        )
