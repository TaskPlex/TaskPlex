"""
HTML minifier models
"""

from pydantic import BaseModel, Field


class HTMLMinifierRequest(BaseModel):
    """Request model for HTML minification"""

    html: str = Field(..., description="HTML code to minify")


class HTMLMinifierResponse(BaseModel):
    """Response model for HTML minification"""

    success: bool
    message: str
    minified_html: str = None
    original_length: int = None
    minified_length: int = None
    compression_ratio: float = None
