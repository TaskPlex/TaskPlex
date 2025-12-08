"""
Models for color conversion operations
"""

from pydantic import BaseModel, Field


class ColorConversionRequest(BaseModel):
    """Request payload for color conversion"""

    color: str = Field(..., description="Color value in HEX, RGB, or HSL format")


class ColorFormats(BaseModel):
    """Common color format representations"""

    hex: str
    rgb: str
    hsl: str
    cmyk: str


class ColorComponents(BaseModel):
    """Numeric components for each color space"""

    r: int
    g: int
    b: int
    h: float
    s: float
    l: float
    c: float
    m: float
    y: float
    k: float


class ColorConversionResponse(BaseModel):
    """Response payload for color conversion"""

    success: bool
    message: str
    input_format: str
    normalized_hex: str
    formats: ColorFormats
    components: ColorComponents
