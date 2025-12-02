"""
Code minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.code_minifier import CodeMinifierRequest, CodeMinifierResponse
from app.services.code_minifier_service import minify_code

router = APIRouter(prefix="/code-minifier", tags=["Code Minifier"])


@router.post("/minify", response_model=CodeMinifierResponse)
async def minify_code_endpoint(request: CodeMinifierRequest):
    """
    Minify code based on programming language

    - **code**: Code to minify
    - **language**: Programming language (auto, html, css, javascript, json, xml)
    """
    result = minify_code(code=request.code, language=request.language)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
