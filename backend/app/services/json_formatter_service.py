"""
JSON formatting and minification service
"""

import json
import re

from app.models.json_formatter import JSONFormatterResponse


def format_json(json_str: str, indent_size: int = 2) -> JSONFormatterResponse:
    """
    Format (beautify) JSON string

    Args:
        json_str: JSON string to format
        indent_size: Indentation size

    Returns:
        JSONFormatterResponse with formatted JSON
    """
    if not json_str or not json_str.strip():
        return JSONFormatterResponse(
            success=False,
            message="JSON cannot be empty",
            result="",
            original_size=0,
            result_size=0,
            compression_ratio=0.0,
        )

    original_size = len(json_str)

    try:
        # Parse JSON to validate
        parsed = json.loads(json_str)

        # Format with indentation
        formatted = json.dumps(parsed, indent=indent_size, ensure_ascii=False, sort_keys=False)

        formatted_size = len(formatted)

        return JSONFormatterResponse(
            success=True,
            message="JSON formatted successfully",
            result=formatted,
            original_size=original_size,
            result_size=formatted_size,
            compression_ratio=0.0,
        )

    except json.JSONDecodeError as e:
        return JSONFormatterResponse(
            success=False,
            message=f"Invalid JSON: {str(e)}",
            result=json_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )
    except Exception as e:
        return JSONFormatterResponse(
            success=False,
            message=f"Error formatting JSON: {str(e)}",
            result=json_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )


def minify_json(json_str: str) -> JSONFormatterResponse:
    """
    Minify JSON string

    Args:
        json_str: JSON string to minify

    Returns:
        JSONFormatterResponse with minified JSON
    """
    if not json_str or not json_str.strip():
        return JSONFormatterResponse(
            success=False,
            message="JSON cannot be empty",
            result="",
            original_size=0,
            result_size=0,
            compression_ratio=0.0,
        )

    original_size = len(json_str)

    try:
        # Parse JSON to validate
        parsed = json.loads(json_str)

        # Minify by removing all whitespace
        minified = json.dumps(parsed, separators=(",", ":"), ensure_ascii=False)

        minified_size = len(minified)

        compression_ratio = (
            ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0.0
        )

        return JSONFormatterResponse(
            success=True,
            message="JSON minified successfully",
            result=minified,
            original_size=original_size,
            result_size=minified_size,
            compression_ratio=round(compression_ratio, 2),
        )

    except json.JSONDecodeError as e:
        return JSONFormatterResponse(
            success=False,
            message=f"Invalid JSON: {str(e)}",
            result=json_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )
    except Exception as e:
        return JSONFormatterResponse(
            success=False,
            message=f"Error minifying JSON: {str(e)}",
            result=json_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )


def process_json(
    json_str: str, action: str = "format", indent_size: int = 2
) -> JSONFormatterResponse:
    """
    Process JSON (format or minify)

    Args:
        json_str: JSON string to process
        action: 'format' or 'minify'
        indent_size: Indentation size for formatting

    Returns:
        JSONFormatterResponse
    """
    if action == "format":
        return format_json(json_str, indent_size)
    elif action == "minify":
        return minify_json(json_str)
    else:
        return JSONFormatterResponse(
            success=False,
            message=f"Invalid action: {action}. Must be 'format' or 'minify'",
            result=json_str,
            original_size=len(json_str),
            result_size=len(json_str),
            compression_ratio=0.0,
        )
