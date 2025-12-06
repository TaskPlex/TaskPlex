"""
Text formatting service utilities
"""

from app.models.text_formatter import TextFormatResponse


def format_literal_newlines(text: str) -> TextFormatResponse:
    """
    Replace literal escape sequences like '\\n' with real newlines.
    """
    try:
        original_length = len(text)

        normalized = text.replace("\\r\\n", "\\n")
        formatted = normalized.replace("\\n", "\n")

        return TextFormatResponse(
            success=True,
            message="Text formatted successfully",
            formatted_text=formatted,
            original_length=original_length,
            formatted_length=len(formatted),
        )
    except Exception as exc:
        return TextFormatResponse(
            success=False,
            message=f"Error formatting text: {exc}",
            formatted_text=None,
            original_length=None,
            formatted_length=None,
        )
