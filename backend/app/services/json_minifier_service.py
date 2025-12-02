"""
JSON minification service
"""

import json

from app.models.json_minifier import JSONMinifierResponse


def minify_json_code(json_str: str) -> JSONMinifierResponse:
    """
    Minify JSON code

    Args:
        json_str: JSON code to minify

    Returns:
        JSONMinifierResponse with minified JSON
    """
    if not json_str or not json_str.strip():
        return JSONMinifierResponse(
            success=False,
            message="JSON cannot be empty",
            minified_json="",
            original_length=0,
            minified_length=0,
            compression_ratio=0.0,
        )

    original_length = len(json_str)

    try:
        # Parse JSON to validate
        parsed = json.loads(json_str)

        # Minify by removing all whitespace
        minified = json.dumps(parsed, separators=(",", ":"), ensure_ascii=False)

        minified_length = len(minified)

        compression_ratio = (
            ((original_length - minified_length) / original_length * 100)
            if original_length > 0
            else 0.0
        )

        return JSONMinifierResponse(
            success=True,
            message="JSON minified successfully",
            minified_json=minified,
            original_length=original_length,
            minified_length=minified_length,
            compression_ratio=round(compression_ratio, 2),
        )

    except json.JSONDecodeError as e:
        return JSONMinifierResponse(
            success=False,
            message=f"Invalid JSON: {str(e)}",
            minified_json=json_str,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )
    except Exception as e:
        return JSONMinifierResponse(
            success=False,
            message=f"Error minifying JSON: {str(e)}",
            minified_json=json_str,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )
