"""
Regex validation models
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class RegexValidationRequest(BaseModel):
    """Request model for regex validation"""

    pattern: str = Field(..., description="Regular expression pattern to test")
    test_strings: List[str] = Field(..., description="List of strings to test against the pattern")
    flags: Optional[str] = Field(
        default=None,
        description="Regex flags (i=ignorecase, m=multiline, s=dotall, x=verbose)",
    )


class RegexMatch(BaseModel):
    """Model for a single regex match result"""

    string: str
    matched: bool
    matches: Optional[List[str]] = None
    groups: Optional[List[str]] = None


class RegexValidationResponse(BaseModel):
    """Response model for regex validation"""

    success: bool
    message: str
    pattern: str
    results: List[RegexMatch]
    valid_pattern: bool
