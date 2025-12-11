"""
Palette generator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.palette_generator import (
    PaletteGeneratorRequest,
    PaletteGeneratorResponse,
)
from app.services.palette_generator_service import generate_palette

router = APIRouter(prefix="/palette-generator", tags=["Palette Generator"])


@router.post("/generate", response_model=PaletteGeneratorResponse)
async def generate_palette_endpoint(request: PaletteGeneratorRequest):
    """
    Generate a color palette from a base color

    - **base_color**: Base color in HEX format (e.g., #FF0000)
    - **scheme**: Color scheme (monochromatic, complementary, triadic, etc.)
    - **count**: Number of colors in palette (2-10)
    """
    result = generate_palette(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
