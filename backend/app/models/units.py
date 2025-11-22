"""
Unit conversion models
"""

from typing import Optional

from pydantic import BaseModel, Field


class UnitConversionRequest(BaseModel):
    """Request model for unit conversion"""

    value: float = Field(..., description="Value to convert")
    from_unit: str = Field(..., description="Source unit (e.g., 'meter', 'kilogram', 'celsius')")
    to_unit: str = Field(..., description="Target unit (e.g., 'feet', 'pound', 'fahrenheit')")


class UnitConversionResponse(BaseModel):
    """Response model for unit conversion"""

    success: bool
    message: str
    original_value: float
    original_unit: str
    converted_value: Optional[float] = None
    converted_unit: Optional[str] = None
    conversion_formula: Optional[str] = None
