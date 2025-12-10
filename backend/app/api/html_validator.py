"""
HTML validator API endpoints.
"""

from fastapi import APIRouter, HTTPException

from app.models.html_validator import HTMLValidationRequest, HTMLValidationResponse
from app.services.html_validator_service import validate_html

router = APIRouter(prefix="/html-validator", tags=["HTML Validator"])


@router.post("/validate", response_model=HTMLValidationResponse)
async def validate_html_endpoint(request: HTMLValidationRequest):
    """
    Validate HTML content and return structural issues.
    """
    result = validate_html(request.html)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
