"""
Palette generator service
"""

import colorsys
import math
from typing import List, Tuple

from app.models.palette_generator import (
    ColorInfo,
    PaletteGeneratorRequest,
    PaletteGeneratorResponse,
    PaletteScheme,
)
from app.services.color_service import detect_and_parse, rgb_to_hsl


def generate_palette(request: PaletteGeneratorRequest) -> PaletteGeneratorResponse:
    """
    Generate a color palette from a base color using various schemes

    Args:
        request: PaletteGeneratorRequest with base color, scheme, and count

    Returns:
        PaletteGeneratorResponse with generated palette colors
    """
    try:
        # Parse base color
        (r, g, b), _ = detect_and_parse(request.base_color)
        h, s, l = rgb_to_hsl(r, g, b)

        colors: List[ColorInfo] = []
        base_hex = f"#{r:02x}{g:02x}{b:02x}"

        if request.scheme == PaletteScheme.MONOCHROMATIC:
            # Variations of the same hue with different saturation/lightness
            colors = _generate_monochromatic(h, s, l, request.count)

        elif request.scheme == PaletteScheme.COMPLEMENTARY:
            # Base color + its complement (opposite on color wheel)
            colors = _generate_complementary(h, s, l, request.count)

        elif request.scheme == PaletteScheme.TRIADIC:
            # Three colors evenly spaced (120° apart)
            colors = _generate_triadic(h, s, l, request.count)

        elif request.scheme == PaletteScheme.ANALOGOUS:
            # Colors adjacent on the color wheel (±30°)
            colors = _generate_analogous(h, s, l, request.count)

        elif request.scheme == PaletteScheme.SPLIT_COMPLEMENTARY:
            # Base color + two colors adjacent to its complement
            colors = _generate_split_complementary(h, s, l, request.count)

        elif request.scheme == PaletteScheme.TETRADIC:
            # Four colors forming a rectangle (two complementary pairs)
            colors = _generate_tetradic(h, s, l, request.count)

        # Ensure base color is first
        base_color_info = ColorInfo(
            hex=base_hex,
            rgb=f"rgb({r}, {g}, {b})",
            hsl=f"hsl({round(h):d}, {round(s)}%, {round(l)}%)",
        )
        if base_color_info.hex not in [c.hex for c in colors]:
            colors.insert(0, base_color_info)

        return PaletteGeneratorResponse(
            success=True,
            message=f"Generated {len(colors)} colors using {request.scheme.value} scheme",
            colors=colors[: request.count],
            scheme=request.scheme.value,
            base_color=base_hex,
        )

    except Exception as e:
        return PaletteGeneratorResponse(
            success=False,
            message=f"Error generating palette: {str(e)}",
        )


def _hsl_to_rgb_hex(h: float, s: float, l: float) -> Tuple[str, str, str]:
    """Convert HSL to RGB and return hex, rgb, hsl strings"""
    r_f, g_f, b_f = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    r = int(max(0, min(255, round(r_f * 255))))
    g = int(max(0, min(255, round(g_f * 255))))
    b = int(max(0, min(255, round(b_f * 255))))
    hex_value = f"#{r:02x}{g:02x}{b:02x}"
    rgb_value = f"rgb({r}, {g}, {b})"
    hsl_value = f"hsl({round(h):d}, {round(s)}%, {round(l)}%)"
    return hex_value, rgb_value, hsl_value


def _generate_monochromatic(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate monochromatic palette (same hue, varying saturation/lightness)"""
    colors = []
    for i in range(count):
        # Vary lightness and saturation
        new_l = max(10, min(90, l + (i - count / 2) * 15))
        new_s = max(20, min(100, s + (i - count / 2) * 10))
        hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(h, new_s, new_l)
        colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))
    return colors


def _generate_complementary(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate complementary palette (base + opposite color)"""
    colors = []
    # Base color variations
    for i in range(count // 2 + 1):
        new_l = max(20, min(80, l + (i - count / 4) * 10))
        hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(h, s, new_l)
        colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    # Complementary color (180° away)
    comp_h = (h + 180) % 360
    for i in range(count - len(colors)):
        new_l = max(20, min(80, l + (i - count / 4) * 10))
        hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(comp_h, s, new_l)
        colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    return colors


def _generate_triadic(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate triadic palette (three colors 120° apart)"""
    colors = []
    hues = [h, (h + 120) % 360, (h + 240) % 360]
    colors_per_hue = max(1, count // 3)

    for hue in hues:
        for i in range(colors_per_hue):
            new_l = max(20, min(80, l + (i - colors_per_hue / 2) * 10))
            hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(hue, s, new_l)
            colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    return colors[:count]


def _generate_analogous(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate analogous palette (adjacent colors ±30°)"""
    colors = []
    step = 30 / (count - 1) if count > 1 else 0

    for i in range(count):
        new_h = (h - 15 + i * step) % 360
        new_l = max(30, min(70, l + (i - count / 2) * 5))
        hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(new_h, s, new_l)
        colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    return colors


def _generate_split_complementary(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate split complementary palette (base + two colors adjacent to complement)"""
    colors = []
    # Base color
    hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(h, s, l)
    colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    # Split complementary colors (150° and 210° from base)
    split1_h = (h + 150) % 360
    split2_h = (h + 210) % 360

    remaining = count - 1
    for i, split_h in enumerate([split1_h, split2_h]):
        if i < remaining:
            new_l = max(30, min(70, l + (i % 2 - 0.5) * 10))
            hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(split_h, s, new_l)
            colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    # Add variations if more colors needed
    while len(colors) < count:
        for split_h in [split1_h, split2_h]:
            if len(colors) >= count:
                break
            new_l = max(20, min(80, l + (len(colors) % 3 - 1) * 15))
            hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(split_h, s, new_l)
            colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    return colors[:count]


def _generate_tetradic(h: float, s: float, l: float, count: int) -> List[ColorInfo]:
    """Generate tetradic palette (four colors forming a rectangle)"""
    colors = []
    # Four hues: base, base+90°, base+180°, base+270°
    hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360]
    colors_per_hue = max(1, count // 4)

    for hue in hues:
        for i in range(colors_per_hue):
            if len(colors) >= count:
                break
            new_l = max(25, min(75, l + (i - colors_per_hue / 2) * 8))
            hex_val, rgb_val, hsl_val = _hsl_to_rgb_hex(hue, s, new_l)
            colors.append(ColorInfo(hex=hex_val, rgb=rgb_val, hsl=hsl_val))

    return colors[:count]
