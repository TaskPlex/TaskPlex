"""
JavaScript minification service using rjsmin
"""

try:
    import rjsmin

    JSMIN_AVAILABLE = True
except ImportError:
    JSMIN_AVAILABLE = False

from app.models.js_minifier import JSMinifierResponse


def minify_javascript(javascript: str) -> JSMinifierResponse:
    """
    Minify JavaScript code

    Args:
        javascript: JavaScript code to minify

    Returns:
        JSMinifierResponse with minified JavaScript
    """
    if not javascript or not javascript.strip():
        return JSMinifierResponse(
            success=False,
            message="JavaScript cannot be empty",
            minified_js="",
            original_size=0,
            minified_size=0,
            compression_ratio=0.0,
        )

    if not JSMIN_AVAILABLE:
        return JSMinifierResponse(
            success=False,
            message="rjsmin not available. Please install: pip install rjsmin",
            minified_js=javascript,
            original_size=len(javascript),
            minified_size=len(javascript),
            compression_ratio=0.0,
        )

    try:
        original_size = len(javascript)
        minified = rjsmin.jsmin(javascript)
        minified_size = len(minified)

        compression_ratio = (
            ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0.0
        )

        return JSMinifierResponse(
            success=True,
            message="JavaScript minified successfully",
            minified_js=minified,
            original_size=original_size,
            minified_size=minified_size,
            compression_ratio=round(compression_ratio, 2),
        )

    except Exception as e:
        return JSMinifierResponse(
            success=False,
            message=f"Error minifying JavaScript: {str(e)}",
            minified_js=javascript,
            original_size=len(javascript),
            minified_size=len(javascript),
            compression_ratio=0.0,
        )
