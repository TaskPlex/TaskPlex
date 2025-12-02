"""
JavaScript minifier models
"""

from pydantic import BaseModel, Field


class JSMinifierRequest(BaseModel):
    """Request model for JavaScript minification"""

    javascript: str = Field(..., description="JavaScript code to minify")


class JSMinifierResponse(BaseModel):
    """Response model for JavaScript minification"""

    success: bool
    message: str
    minified_js: str = None
    original_size: int = None
    minified_size: int = None
    compression_ratio: float = None
