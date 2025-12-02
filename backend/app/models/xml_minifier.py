"""
XML minifier models
"""

from pydantic import BaseModel, Field


class XMLMinifierRequest(BaseModel):
    """Request model for XML minification"""

    xml: str = Field(..., description="XML code to minify")


class XMLMinifierResponse(BaseModel):
    """Response model for XML minification"""

    success: bool
    message: str
    minified_xml: str = None
    original_length: int = None
    minified_length: int = None
    compression_ratio: float = None
