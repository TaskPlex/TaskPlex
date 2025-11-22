"""
Regex validation API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.regex import RegexValidationRequest, RegexValidationResponse
from app.services.regex_service import validate_regex

router = APIRouter(prefix="/regex", tags=["Regex"])


@router.post("/validate", response_model=RegexValidationResponse)
async def validate_regex_pattern(request: RegexValidationRequest):
    """
    Validate a regex pattern against test strings

    - **pattern**: Regular expression pattern to test
    - **test_strings**: List of strings to test against the pattern
    - **flags**: Optional regex flags (i=ignorecase, m=multiline, s=dotall, x=verbose)
    """
    result = validate_regex(
        pattern=request.pattern, test_strings=request.test_strings, flags=request.flags
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
