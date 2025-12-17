"""
Slug generator models
"""

from pydantic import BaseModel, Field


class SlugRequest(BaseModel):
    """Request model for slug generation"""

    text: str = Field(..., description="Text to convert to slug")


class SlugResponse(BaseModel):
    """Response model for slug generation"""

    success: bool
    message: str
    original_text: str = ""
    slug: str = ""
