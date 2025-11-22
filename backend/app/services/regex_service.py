"""
Regex validation service
"""

import re
from typing import List

from app.models.regex import RegexMatch, RegexValidationResponse


def validate_regex(
    pattern: str, test_strings: List[str], flags: str = None
) -> RegexValidationResponse:
    """
    Validate a regex pattern against test strings

    Args:
        pattern: Regular expression pattern
        test_strings: List of strings to test
        flags: Optional regex flags (i, m, s, x)

    Returns:
        RegexValidationResponse with results
    """
    try:
        # Parse flags
        regex_flags = 0
        if flags:
            if "i" in flags.lower():
                regex_flags |= re.IGNORECASE
            if "m" in flags.lower():
                regex_flags |= re.MULTILINE
            if "s" in flags.lower():
                regex_flags |= re.DOTALL
            if "x" in flags.lower():
                regex_flags |= re.VERBOSE

        # Compile the pattern to check if it's valid
        compiled_pattern = re.compile(pattern, regex_flags)

        # Test against each string
        results = []
        for test_string in test_strings:
            match = compiled_pattern.search(test_string)
            if match:
                matches = [match.group(0)]
                groups = list(match.groups()) if match.groups() else None
                results.append(
                    RegexMatch(string=test_string, matched=True, matches=matches, groups=groups)
                )
            else:
                results.append(RegexMatch(string=test_string, matched=False))

        return RegexValidationResponse(
            success=True,
            message="Regex pattern validated successfully",
            pattern=pattern,
            results=results,
            valid_pattern=True,
        )

    except re.error as e:
        return RegexValidationResponse(
            success=False,
            message=f"Invalid regex pattern: {str(e)}",
            pattern=pattern,
            results=[],
            valid_pattern=False,
        )
    except Exception as e:
        return RegexValidationResponse(
            success=False,
            message=f"Error validating regex: {str(e)}",
            pattern=pattern,
            results=[],
            valid_pattern=False,
        )
