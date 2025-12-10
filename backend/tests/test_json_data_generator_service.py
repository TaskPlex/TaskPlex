"""
Tests for JSON data generator service
"""

import json

import pytest

from app.services.json_data_generator_service import generate_json_data


def test_generate_json_data_simple():
    """Test generating simple JSON data"""
    template = json.dumps({"id": "{{regex:\\d{1,3}}}", "name": "{{regex:[A-Z][a-z]+}}"})
    result = generate_json_data(template, 3)

    assert result.success is True
    assert result.count == 3
    assert len(result.generated_data) == 3

    # Check that each item has the expected structure
    for item in result.generated_data:
        assert "id" in item
        assert "name" in item
        assert isinstance(item["id"], str)
        assert isinstance(item["name"], str)


def test_generate_json_data_with_email():
    """Test generating JSON data with email regex"""
    template = json.dumps({"email": "{{regex:[a-z]+@[a-z]+\\.com}}"})
    result = generate_json_data(template, 5)

    assert result.success is True
    assert result.count == 5
    assert len(result.generated_data) == 5

    # Check that emails are generated
    for item in result.generated_data:
        assert "email" in item
        assert "@" in item["email"]
        assert ".com" in item["email"]


def test_generate_json_data_nested():
    """Test generating nested JSON data"""
    template = json.dumps({"user": {"id": "{{regex:\\d{1,5}}}", "name": "{{regex:[A-Z][a-z]+}}"}})
    result = generate_json_data(template, 2)

    assert result.success is True
    assert result.count == 2

    for item in result.generated_data:
        assert "user" in item
        assert "id" in item["user"]
        assert "name" in item["user"]


def test_generate_json_data_with_array():
    """Test generating JSON data with arrays"""
    template = json.dumps({"items": ["{{regex:\\d{1,2}}}", "{{regex:[A-Z]{2}}}"]})
    result = generate_json_data(template, 3)

    assert result.success is True
    assert result.count == 3

    for item in result.generated_data:
        assert "items" in item
        assert isinstance(item["items"], list)
        assert len(item["items"]) == 2


def test_generate_json_data_mixed_values():
    """Test generating JSON data with mixed regex and static values"""
    template = json.dumps({"id": "{{regex:\\d{1,3}}}", "status": "active", "score": 100})
    result = generate_json_data(template, 2)

    assert result.success is True

    for item in result.generated_data:
        assert "id" in item
        assert item["status"] == "active"
        assert item["score"] == 100


def test_generate_json_data_invalid_template():
    """Test with invalid JSON template"""
    template = '{"invalid": json}'
    result = generate_json_data(template, 1)

    assert result.success is False
    assert "Invalid JSON template" in result.message


def test_generate_json_data_empty_template():
    """Test with empty template"""
    template = ""
    result = generate_json_data(template, 1)

    assert result.success is False


def test_generate_json_data_single_iteration():
    """Test generating single JSON object"""
    template = json.dumps({"id": "{{regex:\\d{1,3}}}"})
    result = generate_json_data(template, 1)

    assert result.success is True
    assert result.count == 1
    assert len(result.generated_data) == 1


def test_generate_json_data_multiple_regex_in_string():
    """Test with multiple regex patterns in a string"""
    template = json.dumps({"code": "{{regex:[A-Z]{2}}}-{{regex:\\d{3}}}"})
    result = generate_json_data(template, 3)

    assert result.success is True

    for item in result.generated_data:
        assert "code" in item
        assert "-" in item["code"]


def test_generate_json_data_complex_nested():
    """Test with complex nested structure"""
    template = json.dumps(
        {
            "user": {
                "id": "{{regex:\\d{1,5}}}",
                "profile": {
                    "name": "{{regex:[A-Z][a-z]+}}",
                    "email": "{{regex:[a-z]+@[a-z]+\\.com}}",
                },
            },
            "tags": ["{{regex:[a-z]+}}", "{{regex:[a-z]+}}"],
        }
    )
    result = generate_json_data(template, 2)

    assert result.success is True
    assert result.count == 2

    for item in result.generated_data:
        assert "user" in item
        assert "profile" in item["user"]
        assert "tags" in item
