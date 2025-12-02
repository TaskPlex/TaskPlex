"""
JavaScript formatter models
"""

from pydantic import BaseModel, Field

try:
    import jsbeautifier

    BEAUTIFIER_AVAILABLE = True
except ImportError:
    BEAUTIFIER_AVAILABLE = False


class JSFormatterRequest(BaseModel):
    """Request model for JavaScript formatting"""

    javascript: str = Field(..., description="JavaScript code to format")
    indent_size: int = Field(default=2, description="Indentation size", ge=1, le=8)
    indent_char: str = Field(default=" ", description="Indentation character (space or tab)")
    wrap_line_length: int = Field(default=80, description="Wrap lines at this length", ge=0)


class JSFormatterResponse(BaseModel):
    """Response model for JavaScript formatting"""

    success: bool
    message: str
    formatted_js: str = None
    original_length: int = None
    formatted_length: int = None
