"""
JSON formatter models
"""

from pydantic import BaseModel, Field


class JSONFormatterRequest(BaseModel):
    """Request model for JSON formatting"""

    json: str = Field(..., description="JSON string to format")
    indent_size: int = Field(default=2, description="Indentation size for formatting", ge=1, le=8)


class JSONFormatterResponse(BaseModel):
    """Response model for JSON formatting"""

    success: bool
    message: str
    result: str = None
    original_size: int = None
    result_size: int = None
    compression_ratio: float = None
