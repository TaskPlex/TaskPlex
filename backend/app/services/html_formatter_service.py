"""
HTML formatting service
"""

import re

from app.models.html_formatter import HTMLFormatterResponse
from app.services.code_formatter_service import _format_html


def format_html(html: str, indent_size: int = 2, indent_char: str = " ") -> HTMLFormatterResponse:
    """
    Format HTML code

    Args:
        html: HTML code to format
        indent_size: Indentation size
        indent_char: Indentation character

    Returns:
        HTMLFormatterResponse with formatted HTML
    """
    if not html or not html.strip():
        return HTMLFormatterResponse(
            success=False,
            message="HTML cannot be empty",
            formatted_html="",
            original_length=0,
            formatted_length=0,
        )

    original_length = len(html)

    try:
        formatted = _format_html(html, indent_size, indent_char)
        formatted_length = len(formatted)

        return HTMLFormatterResponse(
            success=True,
            message="HTML formatted successfully",
            formatted_html=formatted,
            original_length=original_length,
            formatted_length=formatted_length,
        )

    except Exception as e:
        return HTMLFormatterResponse(
            success=False,
            message=f"Error formatting HTML: {str(e)}",
            formatted_html=html,
            original_length=original_length,
            formatted_length=original_length,
        )
