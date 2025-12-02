"""
XML formatting and minification service
"""

import re
import xml.dom.minidom

from app.models.xml_formatter import XMLFormatterResponse


def format_xml(xml_str: str, indent_size: int = 2) -> XMLFormatterResponse:
    """
    Format (beautify) XML string

    Args:
        xml_str: XML string to format
        indent_size: Indentation size

    Returns:
        XMLFormatterResponse with formatted XML
    """
    if not xml_str or not xml_str.strip():
        return XMLFormatterResponse(
            success=False,
            message="XML cannot be empty",
            result="",
            original_size=0,
            result_size=0,
            compression_ratio=0.0,
        )

    original_size = len(xml_str)

    try:
        # Parse XML
        dom = xml.dom.minidom.parseString(xml_str)

        # Format with indentation
        formatted = dom.toprettyxml(indent=" " * indent_size)

        # Remove XML declaration line if present
        if formatted.startswith("<?xml"):
            lines = formatted.split("\n")
            formatted = "\n".join(lines[1:])

        formatted = formatted.strip()

        formatted_size = len(formatted)

        return XMLFormatterResponse(
            success=True,
            message="XML formatted successfully",
            result=formatted,
            original_size=original_size,
            result_size=formatted_size,
            compression_ratio=0.0,
        )

    except xml.parsers.expat.ExpatError as e:
        return XMLFormatterResponse(
            success=False,
            message=f"Invalid XML: {str(e)}",
            result=xml_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )
    except Exception as e:
        return XMLFormatterResponse(
            success=False,
            message=f"Error formatting XML: {str(e)}",
            result=xml_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )


def minify_xml(xml_str: str) -> XMLFormatterResponse:
    """
    Minify XML string

    Args:
        xml_str: XML string to minify

    Returns:
        XMLFormatterResponse with minified XML
    """
    if not xml_str or not xml_str.strip():
        return XMLFormatterResponse(
            success=False,
            message="XML cannot be empty",
            result="",
            original_size=0,
            result_size=0,
            compression_ratio=0.0,
        )

    original_size = len(xml_str)

    try:
        # Parse XML to validate
        dom = xml.dom.minidom.parseString(xml_str)

        # Get XML as string without formatting
        minified = dom.toxml()

        # Remove extra whitespace between tags
        minified = re.sub(r">\s+<", "><", minified)
        minified = re.sub(r"\s+", " ", minified)
        minified = minified.strip()

        minified_size = len(minified)

        compression_ratio = (
            ((original_size - minified_size) / original_size * 100) if original_size > 0 else 0.0
        )

        return XMLFormatterResponse(
            success=True,
            message="XML minified successfully",
            result=minified,
            original_size=original_size,
            result_size=minified_size,
            compression_ratio=round(compression_ratio, 2),
        )

    except xml.parsers.expat.ExpatError as e:
        return XMLFormatterResponse(
            success=False,
            message=f"Invalid XML: {str(e)}",
            result=xml_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )
    except Exception as e:
        return XMLFormatterResponse(
            success=False,
            message=f"Error minifying XML: {str(e)}",
            result=xml_str,
            original_size=original_size,
            result_size=original_size,
            compression_ratio=0.0,
        )


def process_xml(xml_str: str, action: str = "format", indent_size: int = 2) -> XMLFormatterResponse:
    """
    Process XML (format or minify)

    Args:
        xml_str: XML string to process
        action: 'format' or 'minify'
        indent_size: Indentation size for formatting

    Returns:
        XMLFormatterResponse
    """
    if action == "format":
        return format_xml(xml_str, indent_size)
    elif action == "minify":
        return minify_xml(xml_str)
    else:
        return XMLFormatterResponse(
            success=False,
            message=f"Invalid action: {action}. Must be 'format' or 'minify'",
            result=xml_str,
            original_size=len(xml_str),
            result_size=len(xml_str),
            compression_ratio=0.0,
        )
