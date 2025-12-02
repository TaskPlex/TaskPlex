"""
Code formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.code_formatter import CodeFormatterRequest, CodeFormatterResponse
from app.services.code_formatter_service import format_code

router = APIRouter(prefix="/code-formatter", tags=["Code Formatter"])


@router.post("/format", response_model=CodeFormatterResponse)
async def format_code_endpoint(request: CodeFormatterRequest):
    """
    Format code based on programming language

    - **code**: Code to format
    - **language**: Programming language (auto, javascript, html, css, json, xml)
    - **indent_size**: Indentation size (1-8)
    - **indent_char**: Indentation character (space or tab)
    - **wrap_line_length**: Wrap lines at this length (0 = no wrap)
    """
    result = format_code(
        code=request.code,
        language=request.language,
        indent_size=request.indent_size,
        indent_char=request.indent_char,
        wrap_line_length=request.wrap_line_length,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
