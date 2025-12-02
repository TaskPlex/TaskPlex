"""
Code minification service supporting multiple languages
"""

import json
import re

try:
    import rcssmin
    import rjsmin

    CSSMIN_AVAILABLE = True
    JSMIN_AVAILABLE = True
except ImportError:
    CSSMIN_AVAILABLE = False
    JSMIN_AVAILABLE = False

import xml.dom.minidom

from app.models.code_minifier import CodeMinifierResponse


def minify_code(code: str, language: str = "auto") -> CodeMinifierResponse:
    """
    Minify code based on language

    Args:
        code: Code to minify
        language: Programming language (auto, html, css, javascript, json, xml)

    Returns:
        GlobalMinifierResponse with minified code
    """
    if not code or not code.strip():
        return CodeMinifierResponse(
            success=False,
            message="Code cannot be empty",
            minified_code="",
            original_length=0,
            minified_length=0,
            compression_ratio=0.0,
        )

    original_length = len(code)

    try:
        # Auto-detect language if needed
        if language == "auto":
            language = _detect_language(code)

        minified = None

        # Handle JSON
        if language.lower() == "json":
            try:
                parsed = json.loads(code)
                minified = json.dumps(parsed, separators=(",", ":"), ensure_ascii=False)
            except json.JSONDecodeError as e:
                return CodeMinifierResponse(
                    success=False,
                    message=f"Invalid JSON: {str(e)}",
                    minified_code=code,
                    original_length=original_length,
                    minified_length=original_length,
                    compression_ratio=0.0,
                )

        # Handle XML
        elif language.lower() == "xml":
            try:
                dom = xml.dom.minidom.parseString(code)
                minified = dom.toxml()
                # Remove extra whitespace between tags
                minified = re.sub(r">\s+<", "><", minified)
                minified = re.sub(r"\s+", " ", minified)
                minified = minified.strip()
            except Exception as e:
                return CodeMinifierResponse(
                    success=False,
                    message=f"Invalid XML: {str(e)}",
                    minified_code=code,
                    original_length=original_length,
                    minified_length=original_length,
                    compression_ratio=0.0,
                )

        # Handle HTML
        elif language.lower() == "html":
            minified = _minify_html(code)

        # Handle CSS
        elif language.lower() == "css":
            if not CSSMIN_AVAILABLE:
                return CodeMinifierResponse(
                    success=False,
                    message="rcssmin not available. Please install: pip install rcssmin",
                    minified_code=code,
                    original_length=original_length,
                    minified_length=original_length,
                    compression_ratio=0.0,
                )
            minified = rcssmin.cssmin(code)

        # Handle JavaScript
        elif language.lower() in ["javascript", "js"]:
            if not JSMIN_AVAILABLE:
                return CodeMinifierResponse(
                    success=False,
                    message="rjsmin not available. Please install: pip install rjsmin",
                    minified_code=code,
                    original_length=original_length,
                    minified_length=original_length,
                    compression_ratio=0.0,
                )
            minified = rjsmin.jsmin(code)

        else:
            return CodeMinifierResponse(
                success=False,
                message=f"Unsupported language: {language}",
                minified_code=code,
                original_length=original_length,
                minified_length=original_length,
                compression_ratio=0.0,
            )

        if minified is None:
            return CodeMinifierResponse(
                success=False,
                message="Failed to minify code",
                minified_code=code,
                original_length=original_length,
                minified_length=original_length,
                compression_ratio=0.0,
            )

        minified_length = len(minified)
        compression_ratio = (
            ((original_length - minified_length) / original_length * 100)
            if original_length > 0
            else 0.0
        )

        return CodeMinifierResponse(
            success=True,
            message="Code minified successfully",
            minified_code=minified,
            original_length=original_length,
            minified_length=minified_length,
            compression_ratio=round(compression_ratio, 2),
        )

    except Exception as e:
        return CodeMinifierResponse(
            success=False,
            message=f"Error minifying code: {str(e)}",
            minified_code=code,
            original_length=original_length,
            minified_length=original_length,
            compression_ratio=0.0,
        )


def _detect_language(code: str) -> str:
    """
    Auto-detect programming language from code

    Args:
        code: Code to analyze

    Returns:
        Detected language
    """
    code_stripped = code.strip()

    # Check for JSON
    if code_stripped.startswith("{") or code_stripped.startswith("["):
        try:
            json.loads(code)
            return "json"
        except json.JSONDecodeError:
            pass

    # Check for XML
    if code_stripped.startswith("<") and "<?xml" in code_stripped[:100]:
        return "xml"
    if code_stripped.startswith("<html") or code_stripped.startswith("<!DOCTYPE"):
        return "html"

    # Check for CSS
    if "{" in code and ":" in code and (";" in code or "}" in code):
        # Simple heuristic: looks like CSS
        if not any(keyword in code.lower() for keyword in ["function", "var ", "let ", "const "]):
            return "css"

    # Check for JavaScript
    if any(keyword in code for keyword in ["function", "var ", "let ", "const ", "=>"]):
        return "javascript"

    # Default to JavaScript
    return "javascript"


def _minify_html(html: str) -> str:
    """
    Minify HTML code

    Args:
        html: HTML code to minify

    Returns:
        Minified HTML
    """
    try:
        # Remove comments
        html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)

        # Remove extra whitespace
        html = re.sub(r">\s+<", "><", html)
        html = re.sub(r"\s+", " ", html)
        html = html.strip()

        return html
    except Exception:
        return html
