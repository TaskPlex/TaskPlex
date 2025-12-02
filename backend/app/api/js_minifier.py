"""
JavaScript minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.js_minifier import JSMinifierRequest, JSMinifierResponse
from app.services.js_minifier_service import minify_javascript

router = APIRouter(prefix="/js-minifier", tags=["JS Minifier"])


@router.post("/minify", response_model=JSMinifierResponse)
async def minify_js_endpoint(request: JSMinifierRequest):
    """
    Minify JavaScript code

    - **javascript**: JavaScript code to minify
    """
    result = minify_javascript(javascript=request.javascript)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
