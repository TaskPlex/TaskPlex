"""
Code minifier models
"""

from pydantic import BaseModel, Field


class CodeMinifierRequest(BaseModel):
    """Request model for code minification"""

    code: str = Field(..., description="Code to minify")
    language: str = Field(
        default="auto",
        description="Programming language (auto, html, css, javascript, json, xml)",
    )


class CodeMinifierResponse(BaseModel):
    """Response model for code minification"""

    success: bool
    message: str
    minified_code: str = None
    original_length: int = None
    minified_length: int = None
    compression_ratio: float = None
