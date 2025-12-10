"""
Models for HTML validation.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class HTMLError(BaseModel):
    """Represents a validation issue found in HTML content."""

    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    context: Optional[str] = None


class HTMLValidationRequest(BaseModel):
    """Request payload for HTML validation."""

    html: str = Field(..., min_length=1, description="HTML content to validate")


class HTMLValidationResponse(BaseModel):
    """Response payload for HTML validation."""

    success: bool
    message: str
    valid: bool
    errors: List[HTMLError]
    warnings: Optional[List[str]] = None
