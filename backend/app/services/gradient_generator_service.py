"""
Gradient generator service
"""

import io
import math
from pathlib import Path
from typing import List, Tuple

from PIL import Image, ImageDraw

from app.config import TEMP_DIR
from app.models.gradient_generator import (
    GradientGeneratorRequest,
    GradientGeneratorResponse,
    GradientType,
)
from app.services.color_service import detect_and_parse
from app.utils.file_handler import generate_unique_filename


def generate_gradient(request: GradientGeneratorRequest) -> GradientGeneratorResponse:
    """
    Generate a gradient image and CSS/SVG code

    Args:
        request: GradientGeneratorRequest with colors, type, dimensions, etc.

    Returns:
        GradientGeneratorResponse with image file and CSS/SVG code
    """
    try:
        # Parse colors to RGB
        rgb_colors = []
        for color in request.colors:
            (r, g, b), _ = detect_and_parse(color)
            rgb_colors.append((r, g, b))

        # Generate color stops if not provided
        stops = request.stops
        if stops is None:
            stops = [i / (len(rgb_colors) - 1) for i in range(len(rgb_colors))]

        # Validate stops
        if len(stops) != len(rgb_colors):
            return GradientGeneratorResponse(
                success=False,
                message="Number of stops must match number of colors",
            )

        # Generate image
        img = _create_gradient_image(
            request.width,
            request.height,
            rgb_colors,
            stops,
            request.type,
            request.angle,
        )

        # Save image
        output_filename = generate_unique_filename("gradient.png")
        output_path = TEMP_DIR / output_filename
        img.save(output_path, format="PNG")

        # Generate CSS code
        css_code = _generate_css_gradient(request.colors, stops, request.type, request.angle)

        # Generate SVG code
        svg_code = _generate_svg_gradient(
            request.width,
            request.height,
            request.colors,
            stops,
            request.type,
            request.angle,
        )

        return GradientGeneratorResponse(
            success=True,
            message="Gradient generated successfully",
            filename=output_filename,
            download_url=f"/api/v1/download/{output_filename}",
            css_code=css_code,
            svg_code=svg_code,
            width=request.width,
            height=request.height,
        )

    except Exception as e:
        return GradientGeneratorResponse(
            success=False,
            message=f"Error generating gradient: {str(e)}",
        )


def _create_gradient_image(
    width: int,
    height: int,
    rgb_colors: List[Tuple[int, int, int]],
    stops: List[float],
    gradient_type: GradientType,
    angle: int,
) -> Image.Image:
    """Create a gradient image using Pillow"""
    img = Image.new("RGB", (width, height))
    pixels = img.load()

    if gradient_type == GradientType.LINEAR:
        _fill_linear_gradient(pixels, width, height, rgb_colors, stops, angle)
    elif gradient_type == GradientType.RADIAL:
        _fill_radial_gradient(pixels, width, height, rgb_colors, stops)
    elif gradient_type == GradientType.CONIC:
        _fill_conic_gradient(pixels, width, height, rgb_colors, stops, angle)

    return img


def _interpolate_color(
    color1: Tuple[int, int, int], color2: Tuple[int, int, int], t: float
) -> Tuple[int, int, int]:
    """Interpolate between two colors"""
    r = int(color1[0] + (color2[0] - color1[0]) * t)
    g = int(color1[1] + (color2[1] - color1[1]) * t)
    b = int(color1[2] + (color2[2] - color1[2]) * t)
    return (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))


def _fill_linear_gradient(
    pixels,
    width: int,
    height: int,
    colors: List[Tuple[int, int, int]],
    stops: List[float],
    angle: int,
):
    """Fill image with linear gradient"""
    # Convert angle to radians
    angle_rad = math.radians(angle)

    # Calculate gradient direction vector
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)

    # Maximum distance from center
    center_x, center_y = width / 2, height / 2
    max_dist = math.sqrt(center_x**2 + center_y**2)

    for y in range(height):
        for x in range(width):
            # Calculate position relative to center
            dx = x - center_x
            dy = y - center_y

            # Project onto gradient direction
            dist = (dx * cos_a + dy * sin_a) / max_dist
            # Normalize to 0-1
            t = (dist + 1) / 2
            t = max(0, min(1, t))

            # Find which color segment we're in
            color = _get_color_at_position(colors, stops, t)
            pixels[x, y] = color


def _fill_radial_gradient(
    pixels, width: int, height: int, colors: List[Tuple[int, int, int]], stops: List[float]
):
    """Fill image with radial gradient"""
    center_x, center_y = width / 2, height / 2
    max_radius = math.sqrt(center_x**2 + center_y**2)

    for y in range(height):
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = math.sqrt(dx**2 + dy**2)
            t = dist / max_radius
            t = max(0, min(1, t))

            color = _get_color_at_position(colors, stops, t)
            pixels[x, y] = color


def _fill_conic_gradient(
    pixels,
    width: int,
    height: int,
    colors: List[Tuple[int, int, int]],
    stops: List[float],
    angle: int,
):
    """Fill image with conic gradient"""
    center_x, center_y = width / 2, height / 2

    for y in range(height):
        for x in range(width):
            dx = x - center_x
            dy = y - center_y

            # Calculate angle from center
            pixel_angle = math.degrees(math.atan2(dy, dx))
            # Normalize to 0-360 and add offset
            pixel_angle = (pixel_angle + angle + 360) % 360
            t = pixel_angle / 360

            color = _get_color_at_position(colors, stops, t)
            pixels[x, y] = color


def _get_color_at_position(
    colors: List[Tuple[int, int, int]], stops: List[float], position: float
) -> Tuple[int, int, int]:
    """Get interpolated color at a given position (0.0 to 1.0)"""
    # Clamp position
    position = max(0, min(1, position))

    # Find which segment we're in
    for i in range(len(stops) - 1):
        if stops[i] <= position <= stops[i + 1]:
            # Interpolate between colors[i] and colors[i+1]
            segment_length = stops[i + 1] - stops[i]
            if segment_length == 0:
                return colors[i]
            t = (position - stops[i]) / segment_length
            return _interpolate_color(colors[i], colors[i + 1], t)

    # Fallback
    return colors[-1] if position >= 1.0 else colors[0]


def _generate_css_gradient(
    colors: List[str], stops: List[float], gradient_type: GradientType, angle: int
) -> str:
    """Generate CSS gradient code"""
    color_stops = [f"{colors[i]} {stops[i] * 100:.1f}%" for i in range(len(colors))]

    if gradient_type == GradientType.LINEAR:
        return f"linear-gradient({angle}deg, {', '.join(color_stops)})"
    elif gradient_type == GradientType.RADIAL:
        return f"radial-gradient(circle, {', '.join(color_stops)})"
    elif gradient_type == GradientType.CONIC:
        return f"conic-gradient(from {angle}deg, {', '.join(color_stops)})"

    return ""


def _generate_svg_gradient(
    width: int,
    height: int,
    colors: List[str],
    stops: List[float],
    gradient_type: GradientType,
    angle: int,
) -> str:
    """Generate SVG gradient code"""
    if gradient_type == GradientType.LINEAR:
        angle_rad = math.radians(angle)
        x1 = 0.5 - 0.5 * math.cos(angle_rad)
        y1 = 0.5 - 0.5 * math.sin(angle_rad)
        x2 = 0.5 + 0.5 * math.cos(angle_rad)
        y2 = 0.5 + 0.5 * math.sin(angle_rad)

        stops_svg = "\n".join(
            [
                f'    <stop offset="{stops[i] * 100:.1f}%" stop-color="{colors[i]}" />'
                for i in range(len(colors))
            ]
        )

        return f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}">
{stops_svg}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>"""

    elif gradient_type == GradientType.RADIAL:
        stops_svg = "\n".join(
            [
                f'    <stop offset="{stops[i] * 100:.1f}%" stop-color="{colors[i]}" />'
                for i in range(len(colors))
            ]
        )

        return f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%">
{stops_svg}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>"""

    elif gradient_type == GradientType.CONIC:
        # SVG doesn't natively support conic gradients, use workaround
        stops_svg = "\n".join(
            [
                f'    <stop offset="{stops[i] * 100:.1f}%" stop-color="{colors[i]}" />'
                for i in range(len(colors))
            ]
        )

        return f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="50%" y1="50%" x2="50%" y2="0%">
{stops_svg}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>"""

    return ""
