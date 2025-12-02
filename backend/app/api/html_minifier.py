"""
HTML minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.html_minifier import HTMLMinifierRequest, HTMLMinifierResponse
from app.services.html_minifier_service import minify_html

router = APIRouter(prefix="/html-minifier", tags=["HTML Minifier"])


@router.post("/minify", response_model=HTMLMinifierResponse)
async def minify_html_endpoint(request: HTMLMinifierRequest):
    """
    Minify HTML code

    - **html**: HTML code to minify
    """
    result = minify_html(html=request.html)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
