"""
Number base conversion service
"""

from app.models.number_converter import NumberConversionResponse

# Base mapping
BASE_MAP = {
    "binary": 2,
    "decimal": 10,
    "hexadecimal": 16,
    "octal": 8,
}


def convert_number(number: str, from_base: str, to_base: str) -> NumberConversionResponse:
    """
    Convert a number from one base to another

    Args:
        number: Number to convert (as string)
        from_base: Source base (binary, decimal, hexadecimal, octal)
        to_base: Target base (binary, decimal, hexadecimal, octal)

    Returns:
        NumberConversionResponse with conversion result
    """
    try:
        # Normalize input
        number = number.strip().upper()

        # Get base values
        from_base_value = BASE_MAP.get(from_base.lower())
        to_base_value = BASE_MAP.get(to_base.lower())

        if not from_base_value or not to_base_value:
            return NumberConversionResponse(
                success=False,
                message=f"Invalid base. Supported bases: {', '.join(BASE_MAP.keys())}",
            )

        # Validate number format for source base
        if not is_valid_number_for_base(number, from_base_value):
            return NumberConversionResponse(
                success=False,
                message=f"Invalid {from_base} number: '{number}'",
            )

        # Convert to decimal first (intermediate representation)
        try:
            decimal_value = int(number, from_base_value)
        except ValueError as e:
            return NumberConversionResponse(
                success=False,
                message=f"Error parsing {from_base} number: {str(e)}",
            )

        # Convert from decimal to target base
        if to_base_value == 10:
            converted = str(decimal_value)
        elif to_base_value == 2:
            converted = bin(decimal_value)[2:]  # Remove '0b' prefix
        elif to_base_value == 8:
            converted = oct(decimal_value)[2:]  # Remove '0o' prefix
        elif to_base_value == 16:
            converted = hex(decimal_value)[2:].upper()  # Remove '0x' prefix, uppercase
        else:
            return NumberConversionResponse(
                success=False,
                message=f"Unsupported target base: {to_base}",
            )

        return NumberConversionResponse(
            success=True,
            message="Number converted successfully",
            original_number=number,
            original_base=from_base,
            converted_number=converted,
            converted_base=to_base,
        )

    except Exception as e:
        return NumberConversionResponse(
            success=False,
            message=f"Error converting number: {str(e)}",
        )


def is_valid_number_for_base(number: str, base: int) -> bool:
    """
    Validate if a number string is valid for the given base

    Args:
        number: Number string to validate
        base: Base to validate against

    Returns:
        True if valid, False otherwise
    """
    if not number:
        return False

    # Define valid characters for each base
    if base == 2:
        valid_chars = set("01")
    elif base == 8:
        valid_chars = set("01234567")
    elif base == 10:
        valid_chars = set("0123456789")
    elif base == 16:
        valid_chars = set("0123456789ABCDEF")
    else:
        return False

    # Check if all characters are valid
    return all(c in valid_chars for c in number)
