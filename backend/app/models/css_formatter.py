"""
CSS formatter models
"""

from pydantic import BaseModel, Field


class CSSFormatterRequest(BaseModel):
    """Request model for CSS formatting"""

    css: str = Field(..., description="CSS code to format")
    indent_size: int = Field(default=2, description="Indentation size", ge=1, le=8)
    indent_char: str = Field(default=" ", description="Indentation character (space or tab)")


class CSSFormatterResponse(BaseModel):
    """Response model for CSS formatting"""

    success: bool
    message: str
    formatted_css: str = None
    original_length: int = None
    formatted_length: int = None
