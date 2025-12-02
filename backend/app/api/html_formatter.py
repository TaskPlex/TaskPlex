"""
HTML formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.html_formatter import HTMLFormatterRequest, HTMLFormatterResponse
from app.services.html_formatter_service import format_html

router = APIRouter(prefix="/html-formatter", tags=["HTML Formatter"])


@router.post("/format", response_model=HTMLFormatterResponse)
async def format_html_endpoint(request: HTMLFormatterRequest):
    """
    Format HTML code

    - **html**: HTML code to format
    - **indent_size**: Indentation size (1-8)
    - **indent_char**: Indentation character (space or tab)
    """
    result = format_html(
        html=request.html,
        indent_size=request.indent_size,
        indent_char=request.indent_char,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
