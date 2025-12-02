"""
XML minification service
"""

import re
import xml.dom.minidom

from app.models.xml_minifier import XMLMinifierResponse


def minify_xml(xml_str: str) -> XMLMinifierResponse:
    """
    Minify XML code

    Args:
        xml_str: XML code to minify

    Returns:
        XMLMinifierResponse with minified XML
    """
    if not xml_str or not xml_str.strip():
        return XMLMinifierResponse(
            success=False,
            message="XML cannot be empty",
            minified_xml="",
            original_length=0,
            minified_length=0,
            compression_ratio=0.0,
        )

    original_length = len(xml_str)

    try:
        # Parse XML to validate
        dom = xml.dom.minidom.parseString(xml_str)

        # Get XML as string without formatting
        minified = dom.toxml()

        # Remove extra whitespace between tags
        minified = re.sub(r">\s+<", "><", minified)
        minified = re.sub(r"\s+", " ", minified)
        minified = minified.strip()

        minified_length = len(minified)

        compression_ratio = (
            ((original_length - minified_length) / original_length * 100)
            if original_length > 0
            else 0.0
        )

        return XMLMinifierResponse(
            success=True,
            message="XML minified successfully",
            minified_xml=minified,
            original_length=original_length,
            minified_length=minified_length,
            compression_ratio=round(compression_ratio, 2),
        )

    except xml.parsers.expat.ExpatError as e:
        return XMLMinifierResponse(
            success=False,
            message=f"Invalid XML: {str(e)}",
            minified_xml=xml_str,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )
    except Exception as e:
        return XMLMinifierResponse(
            success=False,
            message=f"Error minifying XML: {str(e)}",
            minified_xml=xml_str,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )
