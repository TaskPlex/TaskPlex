"""
JavaScript formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.js_formatter import JSFormatterRequest, JSFormatterResponse
from app.services.js_formatter_service import format_javascript

router = APIRouter(prefix="/js-formatter", tags=["JavaScript Formatter"])


@router.post("/format", response_model=JSFormatterResponse)
async def format_javascript_endpoint(request: JSFormatterRequest):
    """
    Format JavaScript code

    - **javascript**: JavaScript code to format
    - **indent_size**: Indentation size (1-8)
    - **indent_char**: Indentation character (space or tab)
    - **wrap_line_length**: Wrap lines at this length (0 = no wrap)
    """
    result = format_javascript(
        javascript=request.javascript,
        indent_size=request.indent_size,
        indent_char=request.indent_char,
        wrap_line_length=request.wrap_line_length,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
