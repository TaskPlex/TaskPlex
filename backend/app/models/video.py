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
