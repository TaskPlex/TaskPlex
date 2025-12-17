"""
Slug generator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.slug import SlugRequest, SlugResponse
from app.services.slug_service import generate_slug

router = APIRouter(prefix="/slug-generator", tags=["Slug Generator"])


@router.post("/generate", response_model=SlugResponse)
async def generate_slug_endpoint(request: SlugRequest):
    """
    Generate a URL-friendly slug from text

    - **text**: Text to convert to slug

    Examples:
    - "Mon Super Article !" -> "mon-super-article"
    - "Café & Restaurant" -> "cafe-restaurant"
    - "Hello World 2024" -> "hello-world-2024"
    - "São Paulo" -> "sao-paulo"
    - "résumé" -> "resume"
    """
    result = generate_slug(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
