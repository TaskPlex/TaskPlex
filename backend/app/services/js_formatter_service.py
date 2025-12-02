"""
JavaScript formatting service
"""

try:
    import jsbeautifier

    BEAUTIFIER_AVAILABLE = True
except ImportError:
    BEAUTIFIER_AVAILABLE = False

from app.models.js_formatter import JSFormatterResponse


def format_javascript(
    javascript: str,
    indent_size: int = 2,
    indent_char: str = " ",
    wrap_line_length: int = 80,
) -> JSFormatterResponse:
    """
    Format JavaScript code

    Args:
        javascript: JavaScript code to format
        indent_size: Indentation size
        indent_char: Indentation character
        wrap_line_length: Wrap lines at this length (0 = no wrap)

    Returns:
        JSFormatterResponse with formatted JavaScript
    """
    if not javascript or not javascript.strip():
        return JSFormatterResponse(
            success=False,
            message="JavaScript cannot be empty",
            formatted_js="",
            original_length=0,
            formatted_length=0,
        )

    if not BEAUTIFIER_AVAILABLE:
        return JSFormatterResponse(
            success=False,
            message="jsbeautifier not available. Please install: pip install jsbeautifier",
            formatted_js=javascript,
            original_length=len(javascript),
            formatted_length=len(javascript),
        )

    original_length = len(javascript)

    try:
        opts = jsbeautifier.default_options()
        opts.indent_size = indent_size
        opts.indent_char = indent_char if indent_char == " " else "\t"
        opts.wrap_line_length = wrap_line_length if wrap_line_length > 0 else None

        formatted = jsbeautifier.beautify(javascript, opts)
        formatted_length = len(formatted)

        return JSFormatterResponse(
            success=True,
            message="JavaScript formatted successfully",
            formatted_js=formatted,
            original_length=original_length,
            formatted_length=formatted_length,
        )

    except Exception as e:
        return JSFormatterResponse(
            success=False,
            message=f"Error formatting JavaScript: {str(e)}",
            formatted_js=javascript,
            original_length=original_length,
            formatted_length=original_length,
        )
