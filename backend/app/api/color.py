"""
API routes for color conversion utilities
"""

from fastapi import APIRouter, HTTPException

from app.models.color import ColorConversionRequest, ColorConversionResponse
from app.services.color_service import convert_color

router = APIRouter(prefix="/color", tags=["Color"])


@router.post("/convert", response_model=ColorConversionResponse)
async def convert_color_endpoint(request: ColorConversionRequest) -> ColorConversionResponse:
    """
    Convert a color value between HEX, RGB, HSL, and CMYK representations.
    """
    result = convert_color(request.color)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result
