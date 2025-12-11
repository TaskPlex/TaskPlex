"""
Gradient generator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.gradient_generator import (
    GradientGeneratorRequest,
    GradientGeneratorResponse,
)
from app.services.gradient_generator_service import generate_gradient

router = APIRouter(prefix="/gradient-generator", tags=["Gradient Generator"])


@router.post("/generate", response_model=GradientGeneratorResponse)
async def generate_gradient_endpoint(request: GradientGeneratorRequest):
    """
    Generate a gradient image and CSS/SVG code

    - **colors**: List of colors in HEX format (minimum 2, maximum 10)
    - **type**: Gradient type (linear, radial, conic)
    - **width**: Image width (100-4000)
    - **height**: Image height (100-4000)
    - **angle**: Angle for linear/conic gradient (0-360)
    - **stops**: Optional color stop positions (0.0 to 1.0)
    """
    result = generate_gradient(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
