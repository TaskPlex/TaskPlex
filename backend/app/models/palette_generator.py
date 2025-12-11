"""
Palette generator models
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class PaletteScheme(str, Enum):
    """Enum for palette generation schemes"""

    MONOCHROMATIC = "monochromatic"
    COMPLEMENTARY = "complementary"
    TRIADIC = "triadic"
    ANALOGOUS = "analogous"
    SPLIT_COMPLEMENTARY = "split_complementary"
    TETRADIC = "tetradic"


class PaletteGeneratorRequest(BaseModel):
    """Request model for palette generation"""

    base_color: str = Field(..., description="Base color in HEX format (e.g., #FF0000)")
    scheme: PaletteScheme = Field(
        PaletteScheme.COMPLEMENTARY, description="Color scheme to generate"
    )
    count: int = Field(5, description="Number of colors in palette", ge=2, le=10)


class ColorInfo(BaseModel):
    """Color information"""

    hex: str
    rgb: str
    hsl: str
    name: Optional[str] = None


class PaletteGeneratorResponse(BaseModel):
    """Response model for palette generation"""

    success: bool
    message: str
    colors: List[ColorInfo] = []
    scheme: Optional[str] = None
    base_color: Optional[str] = None
