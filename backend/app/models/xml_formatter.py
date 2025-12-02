"""
XML formatter models
"""

from pydantic import BaseModel, Field


class XMLFormatterRequest(BaseModel):
    """Request model for XML formatting"""

    xml: str = Field(..., description="XML string to format")
    indent_size: int = Field(default=2, description="Indentation size for formatting", ge=1, le=8)


class XMLFormatterResponse(BaseModel):
    """Response model for XML formatting"""

    success: bool
    message: str
    result: str = None
    original_size: int = None
    result_size: int = None
    compression_ratio: float = None
