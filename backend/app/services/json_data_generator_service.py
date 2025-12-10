"""
JSON data generator service with regex support
"""

import json
import re
from typing import Any

import rstr

from app.models.json_data_generator import JSONDataGeneratorResponse

# Pattern to match {{regex:pattern}} in strings
REGEX_PATTERN = re.compile(r"\{\{regex:([^}]+)\}\}")


def generate_json_data(template: str, iterations: int) -> JSONDataGeneratorResponse:
    """
    Generate multiple JSON objects from a template with regex placeholders

    Args:
        template: JSON template string with {{regex:pattern}} placeholders
        iterations: Number of JSON objects to generate

    Returns:
        JSONDataGeneratorResponse with generated data
    """
    try:
        # Parse the template JSON
        try:
            template_obj = json.loads(template)
        except json.JSONDecodeError as e:
            return JSONDataGeneratorResponse(
                success=False,
                message=f"Invalid JSON template: {str(e)}",
            )

        # Generate iterations
        generated_data = []
        for _ in range(iterations):
            generated_obj = process_object(template_obj)
            generated_data.append(generated_obj)

        return JSONDataGeneratorResponse(
            success=True,
            message=f"Generated {iterations} JSON object(s) successfully",
            generated_data=generated_data,
            count=iterations,
        )

    except Exception as e:
        return JSONDataGeneratorResponse(
            success=False,
            message=f"Error generating JSON data: {str(e)}",
        )


def process_object(obj: Any) -> Any:
    """
    Recursively process an object, replacing {{regex:pattern}} with generated values

    Args:
        obj: Object to process (dict, list, or primitive)

    Returns:
        Processed object with regex placeholders replaced
    """
    if isinstance(obj, dict):
        return {key: process_object(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [process_object(item) for item in obj]
    elif isinstance(obj, str):
        return process_string(obj)
    else:
        return obj


def process_string(value: str) -> str:
    """
    Process a string, replacing {{regex:pattern}} with generated values

    Args:
        value: String that may contain {{regex:pattern}} placeholders

    Returns:
        String with regex placeholders replaced by generated values
    """
    # Find all regex placeholders
    matches = list(REGEX_PATTERN.finditer(value))

    if not matches:
        return value

    # Replace each match
    result = value
    for match in reversed(matches):  # Reverse to maintain indices
        full_match = match.group(0)
        regex_pattern = match.group(1)

        try:
            # Generate a random string matching the regex pattern
            generated_value = rstr.xeger(regex_pattern)
            result = result[: match.start()] + generated_value + result[match.end() :]
        except Exception as e:
            # If regex generation fails, keep the original placeholder
            # or replace with error message
            result = result[: match.start()] + f"[ERROR: {str(e)}]" + result[match.end() :]

    return result
