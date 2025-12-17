"""
Tests for slug generator service
"""

import pytest

from app.models.slug import SlugRequest
from app.services.slug_service import generate_slug


def test_generate_slug_success():
    """Test that slug is successfully generated from text"""
    request = SlugRequest(text="Mon Super Article !")
    result = generate_slug(request)

    assert result.success is True
    assert result.slug == "mon-super-article"
    assert result.original_text == "Mon Super Article !"


def test_generate_slug_with_accents():
    """Test slug generation with accented characters"""
    request = SlugRequest(text="Café & Restaurant")
    result = generate_slug(request)

    assert result.success is True
    assert result.slug == "cafe-restaurant"
    assert "é" not in result.slug
    assert "&" not in result.slug


def test_generate_slug_with_numbers():
    """Test slug generation with numbers"""
    request = SlugRequest(text="Hello World 2024")
    result = generate_slug(request)

    assert result.success is True
    assert result.slug == "hello-world-2024"


def test_generate_slug_multiple_spaces():
    """Test slug generation with multiple spaces"""
    request = SlugRequest(text="Hello    World")
    result = generate_slug(request)

    assert result.success is True
    assert result.slug == "hello-world"
    assert "--" not in result.slug  # No double hyphens


def test_generate_slug_special_characters():
    """Test slug generation with special characters"""
    request = SlugRequest(text="Hello @World #2024!")
    result = generate_slug(request)

    assert result.success is True
    assert "@" not in result.slug
    assert "#" not in result.slug
    assert "!" not in result.slug
    assert result.slug == "hello-world-2024"


def test_generate_slug_empty_text():
    """Test that empty text returns an error"""
    request = SlugRequest(text="")
    result = generate_slug(request)

    assert result.success is False
    assert "empty" in result.message.lower()


def test_generate_slug_empty_text_with_spaces():
    """Test that whitespace-only text returns an error"""
    request = SlugRequest(text="   ")
    result = generate_slug(request)

    assert result.success is False
    assert "empty" in result.message.lower()


def test_generate_slug_leading_trailing_hyphens():
    """Test that leading and trailing hyphens are removed"""
    request = SlugRequest(text="  Hello World  ")
    result = generate_slug(request)

    assert result.success is True
    assert not result.slug.startswith("-")
    assert not result.slug.endswith("-")


def test_generate_slug_german_eszett():
    """Test slug generation with German eszett (ß)"""
    request = SlugRequest(text="Straße")
    result = generate_slug(request)

    assert result.success is True
    assert "ss" in result.slug
    assert "ß" not in result.slug


def test_generate_slug_only_special_characters():
    """Test slug generation with only special characters (should return default)"""
    request = SlugRequest(text="!@#$%^&*()")
    result = generate_slug(request)

    assert result.success is True
    # Should return "slug" as default when all characters are removed
    assert result.slug == "slug"


def test_generate_slug_underscores():
    """Test that underscores are converted to hyphens"""
    request = SlugRequest(text="hello_world")
    result = generate_slug(request)

    assert result.success is True
    assert "_" not in result.slug
    assert result.slug == "hello-world"


def test_generate_slug_mixed_separators():
    """Test slug generation with mixed separators (spaces, underscores, hyphens)"""
    request = SlugRequest(text="hello world_test-123")
    result = generate_slug(request)

    assert result.success is True
    assert result.slug == "hello-world-test-123"
    assert "--" not in result.slug  # No double hyphens
