"""
Audio processing models
"""

from pydantic import BaseModel, Field


class AudioProcessingResponse(BaseModel):
    """Response model for audio processing operations"""

    success: bool
    message: str
    filename: str = ""
    download_url: str = ""
    original_size: int = 0
    processed_size: int = 0
    compression_ratio: float = 0.0


class AudioConvertRequest(BaseModel):
    """Request model for audio conversion"""

    output_format: str = Field(
        ..., description="Output audio format (mp3, wav, flac, ogg, aac, m4a)"
    )
    quality: str = Field(default="medium", description="Conversion quality (low, medium, high)")
    bitrate: str = Field(default="192k", description="Audio bitrate (e.g., 128k, 192k, 256k, 320k)")
