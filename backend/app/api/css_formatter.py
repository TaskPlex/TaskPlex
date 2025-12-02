"""
CSS formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.css_formatter import CSSFormatterRequest, CSSFormatterResponse
from app.services.css_formatter_service import format_css

router = APIRouter(prefix="/css-formatter", tags=["CSS Formatter"])


@router.post("/format", response_model=CSSFormatterResponse)
async def format_css_endpoint(request: CSSFormatterRequest):
    """
    Format CSS code

    - **css**: CSS code to format
    - **indent_size**: Indentation size (1-8)
    - **indent_char**: Indentation character (space or tab)
    """
    result = format_css(
        css=request.css,
        indent_size=request.indent_size,
        indent_char=request.indent_char,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
