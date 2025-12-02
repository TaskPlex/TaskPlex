"""
HTML formatter models
"""

from pydantic import BaseModel, Field


class HTMLFormatterRequest(BaseModel):
    """Request model for HTML formatting"""

    html: str = Field(..., description="HTML code to format")
    indent_size: int = Field(default=2, description="Indentation size", ge=1, le=8)
    indent_char: str = Field(default=" ", description="Indentation character (space or tab)")


class HTMLFormatterResponse(BaseModel):
    """Response model for HTML formatting"""

    success: bool
    message: str
    formatted_html: str = None
    original_length: int = None
    formatted_length: int = None
