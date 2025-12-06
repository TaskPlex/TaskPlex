"""
Models for text formatting (literal escape handling)
"""

from pydantic import BaseModel, Field


class TextFormatRequest(BaseModel):
    """Request model for text formatting"""

    text: str = Field(
        ..., min_length=1, description="Text containing literal escape sequences (e.g. \\n)"
    )


class TextFormatResponse(BaseModel):
    """Response model for text formatting"""

    success: bool
    message: str
    formatted_text: str | None = None
    original_length: int | None = None
    formatted_length: int | None = None
