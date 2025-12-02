"""
HTML minification service
"""

import re

from app.models.html_minifier import HTMLMinifierResponse
from app.services.code_minifier_service import _minify_html


def minify_html(html: str) -> HTMLMinifierResponse:
    """
    Minify HTML code

    Args:
        html: HTML code to minify

    Returns:
        HTMLMinifierResponse with minified HTML
    """
    if not html or not html.strip():
        return HTMLMinifierResponse(
            success=False,
            message="HTML cannot be empty",
            minified_html="",
            original_length=0,
            minified_length=0,
            compression_ratio=0.0,
        )

    original_length = len(html)

    try:
        minified = _minify_html(html)
        minified_length = len(minified)

        compression_ratio = (
            ((original_length - minified_length) / original_length * 100)
            if original_length > 0
            else 0.0
        )

        return HTMLMinifierResponse(
            success=True,
            message="HTML minified successfully",
            minified_html=minified,
            original_length=original_length,
            minified_length=minified_length,
            compression_ratio=round(compression_ratio, 2),
        )

    except Exception as e:
        return HTMLMinifierResponse(
            success=False,
            message=f"Error minifying HTML: {str(e)}",
            minified_html=html,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )
