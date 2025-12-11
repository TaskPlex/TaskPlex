"""
Tests for gradient generator service
"""

import pytest

from app.models.gradient_generator import GradientGeneratorRequest, GradientType
from app.services.gradient_generator_service import generate_gradient


def test_generate_gradient_linear():
    """Test linear gradient generation"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#0000FF"],
        type=GradientType.LINEAR,
        width=800,
        height=600,
        angle=45,
    )
    result = generate_gradient(request)

    assert result.success
    assert result.filename is not None
    assert result.download_url is not None
    assert result.css_code is not None
    assert result.svg_code is not None
    assert result.width == 800
    assert result.height == 600
    assert "linear-gradient" in result.css_code


def test_generate_gradient_radial():
    """Test radial gradient generation"""
    request = GradientGeneratorRequest(
        colors=["#00FF00", "#FF00FF"],
        type=GradientType.RADIAL,
        width=400,
        height=400,
    )
    result = generate_gradient(request)

    assert result.success
    assert result.filename is not None
    assert "radial-gradient" in result.css_code


def test_generate_gradient_conic():
    """Test conic gradient generation"""
    request = GradientGeneratorRequest(
        colors=["#FFFF00", "#00FFFF", "#FF00FF"],
        type=GradientType.CONIC,
        width=600,
        height=600,
        angle=90,
    )
    result = generate_gradient(request)

    assert result.success
    assert result.filename is not None
    assert "conic-gradient" in result.css_code


def test_generate_gradient_multiple_colors():
    """Test gradient with multiple colors"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
        type=GradientType.LINEAR,
        width=800,
        height=600,
    )
    result = generate_gradient(request)

    assert result.success
    assert len(request.colors) == 4
    assert all(color in result.css_code for color in request.colors)


def test_generate_gradient_with_stops():
    """Test gradient with custom color stops"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#0000FF"],
        type=GradientType.LINEAR,
        width=800,
        height=600,
        stops=[0.0, 1.0],
    )
    result = generate_gradient(request)

    assert result.success
    assert "0.0%" in result.css_code or "0%" in result.css_code
    assert "100.0%" in result.css_code or "100%" in result.css_code


def test_generate_gradient_invalid_color():
    """Test gradient generation with invalid color"""
    request = GradientGeneratorRequest(
        colors=["invalid", "#0000FF"],
        type=GradientType.LINEAR,
        width=800,
        height=600,
    )
    result = generate_gradient(request)

    assert not result.success
    assert "Error" in result.message


def test_generate_gradient_mismatched_stops():
    """Test gradient with mismatched stops count"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#0000FF"],
        type=GradientType.LINEAR,
        width=800,
        height=600,
        stops=[0.0, 0.5, 1.0],  # 3 stops for 2 colors
    )
    result = generate_gradient(request)

    assert not result.success
    assert "stops" in result.message.lower()


def test_generate_gradient_min_dimensions():
    """Test gradient with minimum dimensions"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#0000FF"],
        type=GradientType.LINEAR,
        width=100,
        height=100,
    )
    result = generate_gradient(request)

    assert result.success
    assert result.width == 100
    assert result.height == 100


def test_generate_gradient_max_dimensions():
    """Test gradient with maximum dimensions"""
    request = GradientGeneratorRequest(
        colors=["#FF0000", "#0000FF"],
        type=GradientType.LINEAR,
        width=4000,
        height=4000,
    )
    result = generate_gradient(request)

    assert result.success
    assert result.width == 4000
    assert result.height == 4000
