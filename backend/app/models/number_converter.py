"""
Number base conversion models
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class NumberConversionRequest(BaseModel):
    """Request model for number base conversion"""

    number: str = Field(..., description="Number to convert (as string)", min_length=1)
    from_base: Literal["binary", "decimal", "hexadecimal", "octal"] = Field(
        ..., description="Source number base"
    )
    to_base: Literal["binary", "decimal", "hexadecimal", "octal"] = Field(
        ..., description="Target number base"
    )


class NumberConversionResponse(BaseModel):
    """Response model for number base conversion"""

    success: bool
    message: str
    original_number: Optional[str] = None
    original_base: Optional[str] = None
    converted_number: Optional[str] = None
    converted_base: Optional[str] = None
