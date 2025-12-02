"""
Code formatting service using jsbeautifier
"""

import json
import xml.dom.minidom

try:
    import jsbeautifier

    BEAUTIFIER_AVAILABLE = True
except ImportError:
    BEAUTIFIER_AVAILABLE = False

from app.models.code_formatter import CodeFormatterResponse


def format_code(
    code: str,
    language: str = "auto",
    indent_size: int = 2,
    indent_char: str = " ",
    wrap_line_length: int = 80,
) -> CodeFormatterResponse:
    """
    Format code based on language

    Args:
        code: Code to format
        language: Programming language (auto, javascript, html, css, json, xml)
        indent_size: Indentation size
        indent_char: Indentation character (space or tab)
        wrap_line_length: Wrap lines at this length (0 = no wrap)

    Returns:
        CodeFormatterResponse with formatted code
    """
    if not code or not code.strip():
        return CodeFormatterResponse(
            success=False,
            message="Code cannot be empty",
            formatted_code="",
            original_length=0,
            formatted_length=0,
        )

    original_length = len(code)

    try:
        # Auto-detect language if needed
        if language == "auto":
            language = _detect_language(code)

        formatted = None

        # Handle JSON
        if language.lower() == "json":
            try:
                parsed = json.loads(code)
                formatted = json.dumps(parsed, indent=indent_size, ensure_ascii=False)
            except json.JSONDecodeError as e:
                return CodeFormatterResponse(
                    success=False,
                    message=f"Invalid JSON: {str(e)}",
                    formatted_code=code,
                    original_length=original_length,
                    formatted_length=original_length,
                )

        # Handle XML
        elif language.lower() == "xml":
            try:
                dom = xml.dom.minidom.parseString(code)
                formatted = dom.toprettyxml(indent=indent_char * indent_size)
                # Remove XML declaration line if present
                if formatted.startswith("<?xml"):
                    formatted = "\n".join(formatted.split("\n")[1:])
                formatted = formatted.strip()
            except Exception as e:
                return CodeFormatterResponse(
                    success=False,
                    message=f"Invalid XML: {str(e)}",
                    formatted_code=code,
                    original_length=original_length,
                    formatted_length=original_length,
                )

        # Handle JavaScript with jsbeautifier
        elif language.lower() in ["javascript", "js"]:
            if not BEAUTIFIER_AVAILABLE:
                return CodeFormatterResponse(
                    success=False,
                    message="jsbeautifier not available. Please install: pip install jsbeautifier",
                    formatted_code=code,
                    original_length=original_length,
                    formatted_length=original_length,
                )

            opts = jsbeautifier.default_options()
            opts.indent_size = indent_size
            opts.indent_char = indent_char if indent_char == " " else "\t"
            opts.wrap_line_length = wrap_line_length if wrap_line_length > 0 else None

            formatted = jsbeautifier.beautify(code, opts)

        # Handle HTML with html.parser
        elif language.lower() == "html":
            formatted = _format_html(code, indent_size, indent_char)

        # Handle CSS - simple formatting
        elif language.lower() == "css":
            formatted = _format_css(code, indent_size, indent_char)

        else:
            return CodeFormatterResponse(
                success=False,
                message=f"Unsupported language: {language}",
                formatted_code=code,
                original_length=original_length,
                formatted_length=original_length,
            )

        if formatted is None:
            return CodeFormatterResponse(
                success=False,
                message="Failed to format code",
                formatted_code=code,
                original_length=original_length,
                formatted_length=original_length,
            )

        formatted_length = len(formatted)

        return CodeFormatterResponse(
            success=True,
            message="Code formatted successfully",
            formatted_code=formatted,
            original_length=original_length,
            formatted_length=formatted_length,
        )

    except Exception as e:
        return CodeFormatterResponse(
            success=False,
            message=f"Error formatting code: {str(e)}",
            formatted_code=code,
            original_length=original_length,
            formatted_length=original_length,
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


def _format_html(html: str, indent_size: int, indent_char: str) -> str:
    """
    Format HTML code with proper indentation

    Args:
        html: HTML code to format
        indent_size: Indentation size
        indent_char: Indentation character

    Returns:
        Formatted HTML
    """
    try:
        import re

        # Remove extra whitespace between tags
        html = re.sub(r">\s+<", "><", html)
        html = html.strip()

        # Add line breaks and indentation
        indent = indent_char * indent_size
        level = 0
        formatted_lines = []
        i = 0
        in_tag = False
        tag_buffer = ""

        while i < len(html):
            char = html[i]

            if char == "<":
                # Start of tag
                if tag_buffer.strip():
                    # Add any pending text
                    formatted_lines.append(indent * level + tag_buffer.strip())
                    tag_buffer = ""

                # Find the end of the tag
                tag_end = html.find(">", i)
                if tag_end == -1:
                    formatted_lines.append(html[i:])
                    break

                tag = html[i : tag_end + 1]

                # Check if it's a closing tag
                if tag.startswith("</"):
                    level = max(0, level - 1)
                    formatted_lines.append(indent * level + tag)
                elif tag.endswith("/>") or tag.endswith(">"):
                    # Self-closing or opening tag
                    formatted_lines.append(indent * level + tag)
                    # Check if it's not a void element
                    tag_name_match = re.match(r"<(\w+)", tag)
                    if tag_name_match:
                        tag_name = tag_name_match.group(1).lower()
                        void_elements = [
                            "area",
                            "base",
                            "br",
                            "col",
                            "embed",
                            "hr",
                            "img",
                            "input",
                            "link",
                            "meta",
                            "param",
                            "source",
                            "track",
                            "wbr",
                        ]
                        if tag_name not in void_elements and not tag.endswith("/>"):
                            level += 1

                i = tag_end + 1
            else:
                # Text content
                tag_buffer += char
                i += 1

        # Add any remaining text
        if tag_buffer.strip():
            formatted_lines.append(indent * level + tag_buffer.strip())

        result = "\n".join(formatted_lines)
        # Clean up multiple empty lines
        result = re.sub(r"\n{3,}", "\n\n", result)
        return result

    except Exception as e:
        # Fallback: simple formatting with line breaks
        import re

        html = re.sub(r"><", ">\n<", html)
        return html


def _format_css(css: str, indent_size: int, indent_char: str) -> str:
    """
    Format CSS code with proper indentation

    Args:
        css: CSS code to format
        indent_size: Indentation size
        indent_char: Indentation character

    Returns:
        Formatted CSS
    """
    try:
        import re

        indent = indent_char * indent_size
        formatted = []
        level = 0

        # Remove comments first
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)

        # Split by braces
        i = 0
        while i < len(css):
            if css[i] == "{":
                formatted.append(" {")
                level += 1
                i += 1
            elif css[i] == "}":
                level = max(0, level - 1)
                formatted.append("\n" + indent * level + "}")
                i += 1
            elif css[i] == ";":
                formatted.append(";")
                i += 1
            elif css[i] == "\n" or css[i] == "\r":
                i += 1
            elif css[i].isspace():
                i += 1
            else:
                # Find the next significant character
                end = i
                while end < len(css) and css[end] not in ["{", "}", ";", "\n", "\r"]:
                    end += 1

                text = css[i:end].strip()
                if text:
                    if formatted and not formatted[-1].endswith("\n"):
                        formatted.append("\n" + indent * level + text)
                    else:
                        formatted.append(indent * level + text)

                i = end

        result = "".join(formatted)
        # Clean up extra newlines
        result = re.sub(r"\n{3,}", "\n\n", result)
        return result.strip()

    except Exception as e:
        # Fallback: return original
        return css
