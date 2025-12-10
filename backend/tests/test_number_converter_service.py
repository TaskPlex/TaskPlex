"""
Tests for number converter service
"""

import pytest

from app.services.number_converter_service import convert_number


def test_convert_binary_to_decimal():
    """Test converting binary to decimal"""
    result = convert_number("1010", "binary", "decimal")

    assert result.success is True
    assert result.original_number == "1010"
    assert result.original_base == "binary"
    assert result.converted_number == "10"
    assert result.converted_base == "decimal"


def test_convert_decimal_to_hexadecimal():
    """Test converting decimal to hexadecimal"""
    result = convert_number("255", "decimal", "hexadecimal")

    assert result.success is True
    assert result.original_number == "255"
    assert result.original_base == "decimal"
    assert result.converted_number == "FF"
    assert result.converted_base == "hexadecimal"


def test_convert_hexadecimal_to_binary():
    """Test converting hexadecimal to binary"""
    result = convert_number("FF", "hexadecimal", "binary")

    assert result.success is True
    assert result.original_number == "FF"
    assert result.original_base == "hexadecimal"
    assert result.converted_number == "11111111"
    assert result.converted_base == "binary"


def test_convert_octal_to_decimal():
    """Test converting octal to decimal"""
    result = convert_number("777", "octal", "decimal")

    assert result.success is True
    assert result.original_number == "777"
    assert result.original_base == "octal"
    assert result.converted_number == "511"
    assert result.converted_base == "decimal"


def test_convert_decimal_to_octal():
    """Test converting decimal to octal"""
    result = convert_number("64", "decimal", "octal")

    assert result.success is True
    assert result.original_number == "64"
    assert result.original_base == "decimal"
    assert result.converted_number == "100"
    assert result.converted_base == "octal"


def test_convert_same_base():
    """Test converting to the same base"""
    result = convert_number("42", "decimal", "decimal")

    assert result.success is True
    assert result.converted_number == "42"


def test_invalid_binary_number():
    """Test with invalid binary number"""
    result = convert_number("102", "binary", "decimal")

    assert result.success is False
    assert "Invalid binary" in result.message


def test_invalid_octal_number():
    """Test with invalid octal number"""
    result = convert_number("89", "octal", "decimal")

    assert result.success is False
    assert "Invalid octal" in result.message


def test_invalid_hexadecimal_number():
    """Test with invalid hexadecimal number"""
    result = convert_number("GH", "hexadecimal", "decimal")

    assert result.success is False
    assert "Invalid hexadecimal" in result.message


def test_empty_number():
    """Test with empty number"""
    result = convert_number("", "decimal", "binary")

    assert result.success is False


def test_lowercase_hexadecimal():
    """Test with lowercase hexadecimal"""
    result = convert_number("ff", "hexadecimal", "decimal")

    assert result.success is True
    assert result.converted_number == "255"


def test_large_number():
    """Test with large number"""
    result = convert_number("FFFFFFFF", "hexadecimal", "decimal")

    assert result.success is True
    assert result.converted_number == "4294967295"
