"""
CSS formatting service
"""

from app.models.css_formatter import CSSFormatterResponse
from app.services.code_formatter_service import _format_css


def format_css(css: str, indent_size: int = 2, indent_char: str = " ") -> CSSFormatterResponse:
    """
    Format CSS code

    Args:
        css: CSS code to format
        indent_size: Indentation size
        indent_char: Indentation character

    Returns:
        CSSFormatterResponse with formatted CSS
    """
    if not css or not css.strip():
        return CSSFormatterResponse(
            success=False,
            message="CSS cannot be empty",
            formatted_css="",
            original_length=0,
            formatted_length=0,
        )

    original_length = len(css)

    try:
        formatted = _format_css(css, indent_size, indent_char)
        formatted_length = len(formatted)

        return CSSFormatterResponse(
            success=True,
            message="CSS formatted successfully",
            formatted_css=formatted,
            original_length=original_length,
            formatted_length=formatted_length,
        )

    except Exception as e:
        return CSSFormatterResponse(
            success=False,
            message=f"Error formatting CSS: {str(e)}",
            formatted_css=css,
            original_length=original_length,
            formatted_length=original_length,
        )
