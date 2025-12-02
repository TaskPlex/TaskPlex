"""
CSS minifier models
"""

from pydantic import BaseModel, Field


class CSSMinifierRequest(BaseModel):
    """Request model for CSS minification"""

    css: str = Field(..., description="CSS code to minify")


class CSSMinifierResponse(BaseModel):
    """Response model for CSS minification"""

    success: bool
    message: str
    minified_css: str = None
    original_size: int = None
    minified_size: int = None
    compression_ratio: float = None
