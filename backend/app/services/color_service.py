"""
Service utilities for color conversion
"""

from __future__ import annotations

import colorsys
import re
from typing import Tuple

from app.models.color import (
    ColorComponents,
    ColorConversionResponse,
    ColorFormats,
)

# Regex patterns for supported formats
HEX_PATTERN = re.compile(r"^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$")
RGB_PATTERN = re.compile(
    r"^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$",
    re.IGNORECASE,
)
HSL_PATTERN = re.compile(
    r"^hsl\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$",
    re.IGNORECASE,
)


def clamp_rgb(value: float) -> int:
    """Clamp a numeric value to an RGB integer (0-255)."""
    return int(max(0, min(255, round(value))))


def parse_hex(value: str) -> Tuple[int, int, int]:
    match = HEX_PATTERN.match(value.strip())
    if not match:
        raise ValueError("Invalid HEX value")

    hex_value = match.group(1)
    if len(hex_value) == 3:
        # Expand shorthand (e.g., #abc -> #aabbcc)
        hex_value = "".join(ch * 2 for ch in hex_value)

    r = int(hex_value[0:2], 16)
    g = int(hex_value[2:4], 16)
    b = int(hex_value[4:6], 16)
    return r, g, b


def parse_rgb(value: str) -> Tuple[int, int, int]:
    match = RGB_PATTERN.match(value.strip())
    if not match:
        raise ValueError("Invalid RGB value")

    r, g, b = (int(match.group(i)) for i in range(1, 4))
    for channel in (r, g, b):
        if not 0 <= channel <= 255:
            raise ValueError("RGB channels must be between 0 and 255")
    return r, g, b


def parse_hsl(value: str) -> Tuple[int, int, int]:
    match = HSL_PATTERN.match(value.strip())
    if not match:
        raise ValueError("Invalid HSL value")

    h = float(match.group(1)) % 360
    s = float(match.group(2))
    l = float(match.group(3))

    if not 0 <= s <= 100 or not 0 <= l <= 100:
        raise ValueError("HSL saturation and lightness must be between 0 and 100")

    # colorsys uses H, L, S order with values in [0, 1]
    r_f, g_f, b_f = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return clamp_rgb(r_f * 255), clamp_rgb(g_f * 255), clamp_rgb(b_f * 255)


def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """Convert RGB to HSL (degrees, percentages)."""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h * 360, s * 100, l * 100


def rgb_to_cmyk(r: int, g: int, b: int) -> Tuple[float, float, float, float]:
    """Convert RGB to CMYK percentages."""
    if (r, g, b) == (0, 0, 0):
        return 0.0, 0.0, 0.0, 100.0

    c = 1 - (r / 255)
    m = 1 - (g / 255)
    y = 1 - (b / 255)
    k = min(c, m, y)

    c = (c - k) / (1 - k) if k < 1 else 0
    m = (m - k) / (1 - k) if k < 1 else 0
    y = (y - k) / (1 - k) if k < 1 else 0

    return c * 100, m * 100, y * 100, k * 100


def detect_and_parse(color_value: str) -> tuple[Tuple[int, int, int], str]:
    """Detect the format and return RGB tuple + format name."""
    normalized = color_value.strip()

    if HEX_PATTERN.match(normalized):
        return parse_hex(normalized), "hex"

    if RGB_PATTERN.match(normalized.lower()):
        return parse_rgb(normalized), "rgb"

    if HSL_PATTERN.match(normalized.lower()):
        return parse_hsl(normalized), "hsl"

    raise ValueError("Unsupported color format. Use HEX, RGB, or HSL.")


def convert_color(color_value: str) -> ColorConversionResponse:
    """
    Convert a color value between HEX, RGB, HSL, and CMYK representations.
    """
    try:
        (r, g, b), input_format = detect_and_parse(color_value)

        # Normalize values
        hex_value = f"#{r:02x}{g:02x}{b:02x}"
        h, s, l = rgb_to_hsl(r, g, b)
        c, m, y, k = rgb_to_cmyk(r, g, b)

        formats = ColorFormats(
            hex=hex_value,
            rgb=f"rgb({r}, {g}, {b})",
            hsl=f"hsl({round(h):d}, {round(s)}%, {round(l)}%)",
            cmyk=f"cmyk({round(c)}%, {round(m)}%, {round(y)}%, {round(k)}%)",
        )

        components = ColorComponents(
            r=r,
            g=g,
            b=b,
            h=round(h, 2),
            s=round(s, 2),
            l=round(l, 2),
            c=round(c, 2),
            m=round(m, 2),
            y=round(y, 2),
            k=round(k, 2),
        )

        return ColorConversionResponse(
            success=True,
            message="Color converted successfully",
            input_format=input_format,
            normalized_hex=hex_value,
            formats=formats,
            components=components,
        )
    except Exception as exc:
        return ColorConversionResponse(
            success=False,
            message=f"Error converting color: {exc}",
            input_format="unknown",
            normalized_hex="",
            formats=ColorFormats(hex="", rgb="", hsl="", cmyk=""),
            components=ColorComponents(r=0, g=0, b=0, h=0, s=0, l=0, c=0, m=0, y=0, k=0),
        )
