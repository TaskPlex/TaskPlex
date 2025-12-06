"""
API routes for text utilities
"""

from fastapi import APIRouter

from app.models.text_formatter import TextFormatRequest, TextFormatResponse
from app.services.text_service import format_literal_newlines

router = APIRouter(prefix="/text", tags=["Text"])


@router.post("/format", response_model=TextFormatResponse)
async def format_text(request: TextFormatRequest) -> TextFormatResponse:
    """
    Format text by replacing literal escape sequences (\\n) with actual newlines.
    """
    return format_literal_newlines(request.text)
