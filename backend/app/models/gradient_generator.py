"""
Gradient generator models
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class GradientType(str, Enum):
    """Enum for gradient types"""

    LINEAR = "linear"
    RADIAL = "radial"
    CONIC = "conic"


class GradientGeneratorRequest(BaseModel):
    """Request model for gradient generation"""

    colors: List[str] = Field(
        ..., min_length=2, max_length=10, description="List of colors in HEX format"
    )
    type: GradientType = Field(GradientType.LINEAR, description="Gradient type")
    width: int = Field(800, description="Image width", ge=100, le=4000)
    height: int = Field(600, description="Image height", ge=100, le=4000)
    angle: int = Field(0, description="Angle for linear gradient (0-360)", ge=0, le=360)
    stops: Optional[List[float]] = Field(
        None, description="Color stop positions (0.0 to 1.0), must match colors count"
    )


class GradientGeneratorResponse(BaseModel):
    """Response model for gradient generation"""

    success: bool
    message: str
    filename: Optional[str] = None
    download_url: Optional[str] = None
    css_code: Optional[str] = None
    svg_code: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
