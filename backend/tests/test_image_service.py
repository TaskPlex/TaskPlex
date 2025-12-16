import io
from pathlib import Path
from unittest.mock import patch

from PIL import Image
import pytest

from app.services.image_service import (
    compress_image,
    convert_image,
    create_collage,
    create_icon,
    extract_colors,
    resize_image,
    rotate_image,
)


def create_temp_image(path: Path, size=(100, 50), color="red", mode="RGB"):
    img = Image.new(mode, size, color=color)
    img.save(path)
    return path


def test_compress_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.jpg"
    create_temp_image(input_path, size=(120, 80), color="red")

    result = compress_image(input_path, output_path, quality="low")

    assert result.success is True
    assert result.filename == output_path.name
    assert result.download_url.endswith(output_path.name)
    assert result.processed_size is not None
    assert result.original_size is not None
    assert result.compression_ratio is not None
    assert result.dimensions == {"width": 120, "height": 80}
    assert output_path.exists()


def test_convert_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.jpg"
    create_temp_image(input_path, size=(64, 64), color="blue")

    result = convert_image(input_path, output_path, output_format="jpg", quality="high")

    assert result.success is True
    assert result.filename.endswith(".jpg")
    assert result.download_url.endswith(".jpg")
    assert result.dimensions == {"width": 64, "height": 64}
    assert output_path.exists()


def test_rotate_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "rotated.png"
    create_temp_image(input_path, size=(10, 20), color="green")

    result = rotate_image(input_path, output_path, angle=90)

    assert result.success is True
    assert result.dimensions["width"] == 20
    assert result.dimensions["height"] == 10
    assert output_path.exists()


def test_resize_image_maintain_aspect_ratio(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path, size=(200, 100), color="purple")

    result = resize_image(
        input_path,
        output_path,
        width=100,
        height=None,
        maintain_aspect_ratio=True,
        resample="lanczos",
    )

    assert result.success is True
    assert result.dimensions == {"width": 100, "height": 50}
    assert output_path.exists()


def test_resize_image_no_dimensions(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path)

    result = resize_image(
        input_path,
        output_path,
        width=None,
        height=None,
        maintain_aspect_ratio=True,
        resample="lanczos",
    )

    assert result.success is False
    assert "dimension" in result.message.lower()


def test_resize_image_no_aspect(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path, size=(100, 50), color="orange")

    result = resize_image(
        input_path,
        output_path,
        width=30,
        height=40,
        maintain_aspect_ratio=False,
        resample="nearest",
    )

    assert result.success is True
    assert result.dimensions == {"width": 30, "height": 40}


def test_extract_colors_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    # Create a simple two-color image (half red, half blue)
    img = Image.new("RGB", (10, 10), color="red")
    for x in range(5, 10):
        for y in range(10):
            img.putpixel((x, y), (0, 0, 255))
    img.save(input_path)

    result = extract_colors(input_path, max_colors=2)

    assert result.success is True
    assert len(result.colors) <= 2
    hex_values = {c.hex for c in result.colors}
    assert "#ff0000" in hex_values or "#0000ff" in hex_values
    assert abs(sum(c.ratio for c in result.colors) - 1) < 0.01


def test_extract_colors_error(monkeypatch, tmp_path: Path):
    input_path = tmp_path / "input.png"
    create_temp_image(input_path)

    class DummyImage:
        def __enter__(self):  # pragma: no cover - used only for the error path
            raise OSError("boom")

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    with patch("app.services.image_service.Image.open", return_value=DummyImage()):
        result = extract_colors(input_path, max_colors=3)

    assert result.success is False
    assert "error" in result.message.lower()


def test_create_collage_success(tmp_path: Path):
    """Test successful collage creation"""
    # Create 4 test images
    image_paths = []
    colors = ["red", "blue", "green", "yellow"]
    for i, color in enumerate(colors):
        img_path = tmp_path / f"image_{i}.png"
        create_temp_image(img_path, size=(100, 100), color=color)
        image_paths.append(img_path)

    output_path = tmp_path / "collage.png"

    # Create 2x2 collage with order [0, 1, 2, 3]
    result = create_collage(image_paths, output_path, rows=2, cols=2, image_order=[0, 1, 2, 3])

    assert result.success is True
    assert result.filename == "collage.png"
    assert result.download_url.endswith("collage.png")
    assert result.dimensions is not None
    assert result.dimensions["width"] == 1600  # 2 * 800
    assert result.dimensions["height"] == 1600  # 2 * 800
    assert output_path.exists()


def test_create_collage_no_images(tmp_path: Path):
    """Test collage creation with no images"""
    output_path = tmp_path / "collage.png"
    result = create_collage([], output_path, rows=2, cols=2, image_order=[0, 1, 2, 3])

    assert result.success is False
    assert "at least one image" in result.message.lower()


def test_create_collage_invalid_order_length(tmp_path: Path):
    """Test collage creation with invalid order length"""
    image_paths = [tmp_path / "image_0.png"]
    create_temp_image(image_paths[0], size=(100, 100), color="red")
    output_path = tmp_path / "collage.png"

    # Order has 4 elements but we only have 1 image and need 2x2=4 cells
    result = create_collage(image_paths, output_path, rows=2, cols=2, image_order=[0, 0, 0, 0])

    # This should work (reusing the same image)
    assert result.success is True


def test_create_collage_invalid_image_index(tmp_path: Path):
    """Test collage creation with invalid image index"""
    image_paths = [tmp_path / "image_0.png"]
    create_temp_image(image_paths[0], size=(100, 100), color="red")
    output_path = tmp_path / "collage.png"

    # Order references index 5 but we only have 1 image (index 0)
    result = create_collage(image_paths, output_path, rows=1, cols=1, image_order=[5])

    assert result.success is False
    assert "invalid image index" in result.message.lower()


def test_create_collage_3x3_grid(tmp_path: Path):
    """Test creating a 3x3 collage"""
    # Create 9 test images
    image_paths = []
    for i in range(9):
        img_path = tmp_path / f"image_{i}.png"
        create_temp_image(img_path, size=(100, 100), color="red")
        image_paths.append(img_path)

    output_path = tmp_path / "collage.png"

    # Create 3x3 collage
    result = create_collage(image_paths, output_path, rows=3, cols=3, image_order=list(range(9)))

    assert result.success is True
    assert result.dimensions["width"] == 2400  # 3 * 800
    assert result.dimensions["height"] == 2400  # 3 * 800
    assert output_path.exists()


def test_create_icon_success(tmp_path: Path):
    """Test creating an icon from an image"""
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.ico"
    create_temp_image(input_path, size=(512, 512), color="blue")

    result = create_icon(input_path, output_path, size=256)

    assert result.success is True
    assert result.filename == "output.ico"
    assert result.download_url.endswith(".ico")
    assert result.dimensions == {"width": 256, "height": 256}
    assert output_path.exists()

    # Verify it's a valid ICO file
    with Image.open(output_path) as icon:
        assert icon.format == "ICO"
        assert icon.size == (256, 256)


def test_create_icon_different_sizes(tmp_path: Path):
    """Test creating icons with different sizes"""
    input_path = tmp_path / "input.png"
    create_temp_image(input_path, size=(200, 200), color="green")

    for size in [16, 32, 64, 128, 256]:
        output_path = tmp_path / f"output_{size}.ico"
        result = create_icon(input_path, output_path, size=size)

        assert result.success is True
        assert result.dimensions == {"width": size, "height": size}
        assert output_path.exists()


def test_create_icon_invalid_size_too_small(tmp_path: Path):
    """Test creating icon with size too small"""
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.ico"
    create_temp_image(input_path, size=(100, 100), color="red")

    result = create_icon(input_path, output_path, size=10)

    assert result.success is False
    assert "Invalid icon size" in result.message


def test_create_icon_invalid_size_too_large(tmp_path: Path):
    """Test creating icon with size too large"""
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.ico"
    create_temp_image(input_path, size=(100, 100), color="red")

    result = create_icon(input_path, output_path, size=1024)

    assert result.success is False
    assert "Invalid icon size" in result.message


def test_create_icon_rgba_image(tmp_path: Path):
    """Test creating icon from RGBA image (with transparency)"""
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.ico"
    create_temp_image(input_path, size=(128, 128), color="red", mode="RGBA")

    result = create_icon(input_path, output_path, size=64)

    assert result.success is True
    assert output_path.exists()

    # Verify ICO was created
    with Image.open(output_path) as icon:
        assert icon.format == "ICO"
        assert icon.size == (64, 64)
