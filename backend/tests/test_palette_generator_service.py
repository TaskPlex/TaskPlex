"""
Tests for palette generator service
"""

import pytest

from app.models.palette_generator import PaletteGeneratorRequest, PaletteScheme
from app.services.palette_generator_service import generate_palette


def test_generate_palette_complementary():
    """Test complementary palette generation"""
    request = PaletteGeneratorRequest(
        base_color="#FF0000", scheme=PaletteScheme.COMPLEMENTARY, count=5
    )
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 5
    assert result.scheme == "complementary"
    assert result.base_color == "#ff0000"
    assert all(color.hex.startswith("#") for color in result.colors)
    assert all(color.rgb.startswith("rgb") for color in result.colors)
    assert all(color.hsl.startswith("hsl") for color in result.colors)


def test_generate_palette_triadic():
    """Test triadic palette generation"""
    request = PaletteGeneratorRequest(base_color="#00FF00", scheme=PaletteScheme.TRIADIC, count=6)
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 6
    assert result.scheme == "triadic"


def test_generate_palette_analogous():
    """Test analogous palette generation"""
    request = PaletteGeneratorRequest(base_color="#0000FF", scheme=PaletteScheme.ANALOGOUS, count=5)
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 5
    assert result.scheme == "analogous"


def test_generate_palette_monochromatic():
    """Test monochromatic palette generation"""
    request = PaletteGeneratorRequest(
        base_color="#4f46e5", scheme=PaletteScheme.MONOCHROMATIC, count=4
    )
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 4
    assert result.scheme == "monochromatic"


def test_generate_palette_split_complementary():
    """Test split complementary palette generation"""
    request = PaletteGeneratorRequest(
        base_color="#FF00FF", scheme=PaletteScheme.SPLIT_COMPLEMENTARY, count=5
    )
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 5
    assert result.scheme == "split_complementary"


def test_generate_palette_tetradic():
    """Test tetradic palette generation"""
    request = PaletteGeneratorRequest(base_color="#FFFF00", scheme=PaletteScheme.TETRADIC, count=8)
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 8
    assert result.scheme == "tetradic"


def test_generate_palette_invalid_color():
    """Test palette generation with invalid color"""
    request = PaletteGeneratorRequest(
        base_color="invalid", scheme=PaletteScheme.COMPLEMENTARY, count=5
    )
    result = generate_palette(request)

    assert not result.success
    assert "Error" in result.message


def test_generate_palette_min_count():
    """Test palette generation with minimum count"""
    request = PaletteGeneratorRequest(
        base_color="#FF0000", scheme=PaletteScheme.COMPLEMENTARY, count=2
    )
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 2


def test_generate_palette_max_count():
    """Test palette generation with maximum count"""
    request = PaletteGeneratorRequest(
        base_color="#FF0000", scheme=PaletteScheme.COMPLEMENTARY, count=10
    )
    result = generate_palette(request)

    assert result.success
    assert len(result.colors) == 10
