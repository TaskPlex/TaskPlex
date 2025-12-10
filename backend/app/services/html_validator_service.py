"""
HTML validation service.
"""

from html.parser import HTMLParser
from typing import List, Tuple

from app.models.html_validator import HTMLError, HTMLValidationResponse


class _SimpleHTMLValidator(HTMLParser):
    """Lightweight HTML validator using Python's built-in parser."""

    void_elements = {
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
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: List[Tuple[str, Tuple[int, int]]] = []
        self.errors: List[HTMLError] = []

    def handle_starttag(self, tag: str, attrs) -> None:  # type: ignore[override]
        if tag in self.void_elements:
            return
        self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag: str, attrs) -> None:  # type: ignore[override]
        # Self-closing tags are fine; nothing to track here.
        return

    def handle_endtag(self, tag: str) -> None:  # type: ignore[override]
        line, col = self.getpos()

        if tag in self.void_elements:
            # Closing a void element is unnecessary but not fatal.
            self.errors.append(
                HTMLError(
                    message=f"Tag <{tag}> is a void element and should not have a closing tag",
                    line=line,
                    column=col,
                )
            )
            return

        if not self.stack:
            self.errors.append(
                HTMLError(
                    message=f"Unexpected closing tag </{tag}>",
                    line=line,
                    column=col,
                )
            )
            return

        last_tag, _ = self.stack[-1]
        if last_tag == tag:
            self.stack.pop()
            return

        # Try to find a matching opening tag deeper in the stack
        match_index = next(
            (i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i][0] == tag), None
        )
        if match_index is not None:
            # Any tags above this were not properly closed
            for unmatched_tag, (u_line, u_col) in self.stack[match_index + 1 :]:
                self.errors.append(
                    HTMLError(
                        message=f"Unclosed tag <{unmatched_tag}> before closing </{tag}>",
                        line=u_line,
                        column=u_col,
                    )
                )
            # Remove everything up to the matched tag
            self.stack = self.stack[:match_index]
        else:
            # No matching opening tag
            self.errors.append(
                HTMLError(
                    message=f"Mismatched closing tag </{tag}>",
                    line=line,
                    column=col,
                )
            )
            # Pop the last to avoid cascading errors
            self.stack.pop()

    def error(self, message: str) -> None:
        line, col = self.getpos()
        self.errors.append(HTMLError(message=f"Parse error: {message}", line=line, column=col))


def validate_html(html: str) -> HTMLValidationResponse:
    """
    Validate HTML content by checking tag balance and basic structure.
    """
    if not html or not html.strip():
        return HTMLValidationResponse(
            success=False,
            message="HTML cannot be empty",
            valid=False,
            errors=[HTMLError(message="HTML input is empty")],
            warnings=[],
        )

    parser = _SimpleHTMLValidator()

    try:
        parser.feed(html)
        parser.close()
    except Exception as exc:
        return HTMLValidationResponse(
            success=False,
            message=f"Error parsing HTML: {exc}",
            valid=False,
            errors=[HTMLError(message=str(exc))],
            warnings=[],
        )

    errors = list(parser.errors)

    # Any tags left on the stack were never closed
    if parser.stack:
        for tag, (line, col) in parser.stack:
            errors.append(HTMLError(message=f"Unclosed tag <{tag}>", line=line, column=col))

    valid = len(errors) == 0
    message = "HTML is valid" if valid else f"Found {len(errors)} issue(s)"

    return HTMLValidationResponse(
        success=True,
        message=message,
        valid=valid,
        errors=errors,
        warnings=[],
    )
