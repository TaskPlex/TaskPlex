"""
JSON data generator models
"""

from typing import Any, Optional

from pydantic import BaseModel, Field


class JSONDataGeneratorRequest(BaseModel):
    """Request model for JSON data generation"""

    template: str = Field(
        ...,
        description="JSON template with {{regex:pattern}} placeholders for random data generation",
        min_length=1,
    )
    iterations: int = Field(
        ...,
        description="Number of JSON objects to generate",
        ge=1,
        le=1000,
    )


class JSONDataGeneratorResponse(BaseModel):
    """Response model for JSON data generation"""

    success: bool
    message: str
    generated_data: Optional[list[dict[str, Any]]] = None
    count: Optional[int] = None
