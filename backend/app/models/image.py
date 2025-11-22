"""
Image processing models
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class ImageCompressionRequest(BaseModel):
    """Request model for image compression"""

    quality: Literal["low", "medium", "high"] = Field(
        default="medium", description="Compression quality preset"
    )


class ImageConversionRequest(BaseModel):
    """Request model for image format conversion"""

    output_format: str = Field(..., description="Target image format (e.g., jpg, png, webp)")
    quality: Literal["low", "medium", "high"] = Field(
        default="medium", description="Conversion quality"
    )


class ImageProcessingResponse(BaseModel):
    """Response model for image processing"""

    success: bool
    message: str
    filename: str
    download_url: Optional[str] = None
    original_size: Optional[int] = None
    processed_size: Optional[int] = None
    compression_ratio: Optional[float] = None
    dimensions: Optional[dict] = None
