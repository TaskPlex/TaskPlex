"""
CSS minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.css_minifier import CSSMinifierRequest, CSSMinifierResponse
from app.services.css_minifier_service import minify_css

router = APIRouter(prefix="/css-minifier", tags=["CSS Minifier"])


@router.post("/minify", response_model=CSSMinifierResponse)
async def minify_css_endpoint(request: CSSMinifierRequest):
    """
    Minify CSS code

    - **css**: CSS code to minify
    """
    result = minify_css(css=request.css)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
