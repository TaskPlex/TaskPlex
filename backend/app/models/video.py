"""
Video processing models
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class VideoCompressionRequest(BaseModel):
    """Request model for video compression"""

    quality: Literal["low", "medium", "high"] = Field(
        default="medium", description="Compression quality preset"
    )


class VideoConversionRequest(BaseModel):
    """Request model for video format conversion"""

    output_format: str = Field(..., description="Target video format (e.g., mp4, avi, mov)")
    quality: Literal["low", "medium", "high"] = Field(
        default="medium", description="Conversion quality preset"
    )


class VideoProcessingResponse(BaseModel):
    """Response model for video processing"""

    success: bool
    message: str
    filename: str
    download_url: Optional[str] = None
    original_size: Optional[int] = None
    processed_size: Optional[int] = None
    compression_ratio: Optional[float] = None


class VideoToGifRequest(BaseModel):
    """Request model for converting video to GIF"""

    start_time: float = Field(default=0.0, ge=0, description="Start time in seconds")
    duration: Optional[float] = Field(
        default=None, gt=0, description="Duration in seconds (optional)"
    )
    width: Optional[int] = Field(default=None, ge=32, le=3840, description="Target width in pixels")
    fps: int = Field(default=12, ge=1, le=60, description="Frames per second for GIF")
    loop: bool = Field(default=True, description="Whether the GIF should loop")


class AudioExtractionRequest(BaseModel):
    """Request model for extracting audio from a video"""

    output_format: Literal["mp3", "wav", "flac", "ogg"] = Field(
        default="mp3", description="Target audio format"
    )
    bitrate: str = Field(default="192k", description="Audio bitrate (e.g., 128k, 192k, 256k)")


class VideoMergeRequest(BaseModel):
    """Request model for merging multiple videos"""

    output_format: str = Field(
        default="mp4", description="Output video format (mp4, avi, mov, etc.)"
    )
    quality: Literal["low", "medium", "high"] = Field(
        default="medium", description="Output quality preset (only used in quality mode)"
    )
    merge_mode: Literal["fast", "quality"] = Field(
        default="quality",
        description="Merge mode: 'fast' copies streams without re-encoding (very fast but requires identical video parameters), 'quality' re-encodes for compatibility (slower but more reliable)",
    )
