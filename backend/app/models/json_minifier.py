"""
JSON minifier models
"""

from pydantic import BaseModel, Field


class JSONMinifierRequest(BaseModel):
    """Request model for JSON minification"""

    json: str = Field(..., description="JSON string to minify")


class JSONMinifierResponse(BaseModel):
    """Response model for JSON minification"""

    success: bool
    message: str
    minified_json: str = None
    original_length: int = None
    minified_length: int = None
    compression_ratio: float = None
