"""
Code formatter models
"""

from pydantic import BaseModel, Field


class CodeFormatterRequest(BaseModel):
    """Request model for code formatting"""

    code: str = Field(..., description="Code to format")
    language: str = Field(
        default="auto",
        description="Programming language (auto, javascript, html, css, json, xml)",
    )
    indent_size: int = Field(default=2, description="Indentation size", ge=1, le=8)
    indent_char: str = Field(default=" ", description="Indentation character (space or tab)")
    wrap_line_length: int = Field(default=80, description="Wrap lines at this length", ge=0)


class CodeFormatterResponse(BaseModel):
    """Response model for code formatting"""

    success: bool
    message: str
    formatted_code: str = None
    original_length: int = None
    formatted_length: int = None
