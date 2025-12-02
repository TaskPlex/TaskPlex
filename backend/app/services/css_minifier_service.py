"""
CSS minification service using rcssmin
"""

try:
    import rcssmin

    CSSMIN_AVAILABLE = True
except ImportError:
    CSSMIN_AVAILABLE = False

from app.models.css_minifier import CSSMinifierResponse


def minify_css(css: str) -> CSSMinifierResponse:
    """
    Minify CSS code

    Args:
        css: CSS code to minify

    Returns:
        CSSMinifierResponse with minified CSS
    """
    if not css or not css.strip():
        return CSSMinifierResponse(
            success=False,
            message="CSS cannot be empty",
            minified_css="",
            original_size=0,
            minified_size=0,
            compression_ratio=0.0,
        )

    if not CSSMIN_AVAILABLE:
        return CSSMinifierResponse(
            success=False,
            message="rcssmin not available. Please install: pip install rcssmin",
            minified_css=css,
            original_size=len(css),
            minified_size=len(css),
            compression_ratio=0.0,
        )

    try:
        original_size = len(css)
        minified = rcssmin.cssmin(css)
        minified_size = len(minified)

        compression_ratio = (
            ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0.0
        )

        return CSSMinifierResponse(
            success=True,
            message="CSS minified successfully",
            minified_css=minified,
            original_size=original_size,
            minified_size=minified_size,
            compression_ratio=round(compression_ratio, 2),
        )

    except Exception as e:
        return CSSMinifierResponse(
            success=False,
            message=f"Error minifying CSS: {str(e)}",
            minified_css=css,
            original_size=len(css),
            minified_size=len(css),
            compression_ratio=0.0,
        )
