"""
Image processing service using Pillow
"""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.config import IMAGE_COMPRESSION_QUALITY
from app.models.image import ColorExtractionResponse, ColorInfo, ImageProcessingResponse
from app.utils.file_handler import calculate_compression_ratio, get_file_size


def compress_image(
    input_path: Path, output_path: Path, quality: str = "medium"
) -> ImageProcessingResponse:
    """
    Compress an image file

    Args:
        input_path: Path to input image
        output_path: Path to save compressed image
        quality: Compression quality preset (low, medium, high)

    Returns:
        ImageProcessingResponse with compression results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Open and compress image
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if saving as JPEG
            if output_path.suffix.lower() in [".jpg", ".jpeg"] and img.mode == "RGBA":
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
                img = rgb_img

            # Get dimensions
            dimensions = {"width": img.width, "height": img.height}

            # Get quality value
            quality_value = IMAGE_COMPRESSION_QUALITY.get(
                quality, IMAGE_COMPRESSION_QUALITY["medium"]
            )

            # Save with compression
            img.save(output_path, quality=quality_value, optimize=True)

        # Get compressed file size
        compressed_size = get_file_size(output_path)
        compression_ratio = calculate_compression_ratio(original_size, compressed_size)

        return ImageProcessingResponse(
            success=True,
            message="Image compressed successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=compressed_size,
            compression_ratio=compression_ratio,
            dimensions=dimensions,
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error compressing image: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def convert_image(
    input_path: Path, output_path: Path, output_format: str, quality: str = "medium"
) -> ImageProcessingResponse:
    """
    Convert an image to a different format

    Args:
        input_path: Path to input image
        output_path: Path to save converted image
        output_format: Target format (jpg, png, webp, etc.)
        quality: Conversion quality preset

    Returns:
        ImageProcessingResponse with conversion results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Normalize format for Pillow (jpg -> JPEG)
        pillow_format = output_format.upper()
        if pillow_format == "JPG":
            pillow_format = "JPEG"

        # Open and convert image
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if saving as JPEG
            if output_format.lower() in ["jpg", "jpeg"] and img.mode == "RGBA":
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
                img = rgb_img

            # Get dimensions
            dimensions = {"width": img.width, "height": img.height}

            # Get quality value
            quality_value = IMAGE_COMPRESSION_QUALITY.get(
                quality, IMAGE_COMPRESSION_QUALITY["medium"]
            )

            # Save in new format
            if output_format.lower() in ["jpg", "jpeg", "webp"]:
                img.save(
                    output_path,
                    format=pillow_format,
                    quality=quality_value,
                    optimize=True,
                )
            else:
                img.save(output_path, format=pillow_format, optimize=True)

        # Get converted file size
        converted_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Image converted to {output_format.upper()} successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=converted_size,
            dimensions=dimensions,
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error converting image: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def rotate_image(input_path: Path, output_path: Path, angle: int) -> ImageProcessingResponse:
    """
    Rotate an image by a specified angle

    Args:
        input_path: Path to input image
        output_path: Path to save rotated image
        angle: Rotation angle in degrees (90, 180, or 270)

    Returns:
        ImageProcessingResponse with rotation results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Open and rotate image
        with Image.open(input_path) as img:
            # Get original dimensions
            original_dimensions = {"width": img.width, "height": img.height}

            # Rotate image (expand=True to avoid cropping)
            rotated_img = img.rotate(-angle, expand=True)

            # Get new dimensions after rotation
            new_dimensions = {"width": rotated_img.width, "height": rotated_img.height}

            # Preserve original format
            output_format = img.format or "PNG"
            if output_format == "JPEG":
                # Convert RGBA to RGB if saving as JPEG
                if rotated_img.mode == "RGBA":
                    rgb_img = Image.new("RGB", rotated_img.size, (255, 255, 255))
                    rgb_img.paste(
                        rotated_img,
                        mask=rotated_img.split()[3] if len(rotated_img.split()) == 4 else None,
                    )
                    rotated_img = rgb_img

            # Save rotated image
            if output_format in ["JPEG", "JPG"]:
                rotated_img.save(output_path, format=output_format, quality=95, optimize=True)
            else:
                rotated_img.save(output_path, format=output_format, optimize=True)

        # Get rotated file size
        rotated_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Image rotated {angle} degrees successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=rotated_size,
            dimensions=new_dimensions,
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error rotating image: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def extract_colors(
    input_path: Path,
    max_colors: int = 6,
    sample_size: int = 200,
) -> ColorExtractionResponse:
    """
    Extract dominant colors from an image.

    Args:
        input_path: Path to input image.
        max_colors: Number of top colors to return.
        sample_size: Image is resized to max(sample_size, sample_size) to speed up extraction.
    """
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGB")
            # Downscale for performance
            img.thumbnail((sample_size, sample_size), Image.LANCZOS)
            pixels = list(img.getdata())

        total = len(pixels)
        # Count colors
        from collections import Counter

        counts = Counter(pixels)
        most_common = counts.most_common(max_colors)

        colors = []
        for (r, g, b), count in most_common:
            ratio = count / total if total else 0
            hex_value = f"#{r:02x}{g:02x}{b:02x}"
            colors.append(ColorInfo(hex=hex_value, ratio=ratio))

        return ColorExtractionResponse(
            success=True,
            message="Colors extracted successfully",
            filename=input_path.name,
            colors=colors,
        )
    except Exception as e:
        return ColorExtractionResponse(
            success=False,
            message=f"Error extracting colors: {str(e)}",
            filename=input_path.name,
            colors=[],
        )


def adjust_image(
    input_path: Path,
    output_path: Path,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
) -> ImageProcessingResponse:
    """
    Adjust brightness, contrast, and saturation of an image.

    Args:
        input_path: Path to input image.
        output_path: Path to save adjusted image.
        brightness: Brightness factor (1.0 = original).
        contrast: Contrast factor (1.0 = original).
        saturation: Color factor (1.0 = original).
    """
    try:
        original_size = get_file_size(input_path)

        with Image.open(input_path) as img:
            # Preserve dimensions
            dimensions = {"width": img.width, "height": img.height}

            work = img.convert("RGB")
            if brightness != 1.0:
                work = ImageEnhance.Brightness(work).enhance(brightness)
            if contrast != 1.0:
                work = ImageEnhance.Contrast(work).enhance(contrast)
            if saturation != 1.0:
                work = ImageEnhance.Color(work).enhance(saturation)

            output_format = img.format or "PNG"
            if output_format in ["JPEG", "JPG"] and work.mode == "RGBA":
                rgb_img = Image.new("RGB", work.size, (255, 255, 255))
                rgb_img.paste(work, mask=work.split()[3] if len(work.split()) == 4 else None)
                work = rgb_img

            if output_format in ["JPEG", "JPG"]:
                work.save(output_path, format=output_format, quality=95, optimize=True)
            else:
                work.save(output_path, format=output_format, optimize=True)

        processed_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message="Image adjusted successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
            dimensions=dimensions,
        )
    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error adjusting image: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def apply_filter(input_path: Path, output_path: Path, filter_name: str) -> ImageProcessingResponse:
    """
    Apply a visual filter to an image.

    Supported filters: grayscale, sepia, blur, sharpen, invert
    """
    try:
        original_size = get_file_size(input_path)

        with Image.open(input_path) as img:
            work = img.convert("RGB")
            filter_key = filter_name.lower()

            if filter_key == "grayscale":
                work = ImageOps.grayscale(work).convert("RGB")
            elif filter_key == "sepia":
                sepia_img = ImageOps.colorize(ImageOps.grayscale(work), "#704214", "#C0A080")
                work = sepia_img
            elif filter_key == "blur":
                work = work.filter(ImageFilter.BLUR)
            elif filter_key == "sharpen":
                work = work.filter(ImageFilter.SHARPEN)
            elif filter_key == "invert":
                work = ImageOps.invert(work)
            else:
                return ImageProcessingResponse(
                    success=False,
                    message=f"Unsupported filter: {filter_name}",
                    filename=output_path.name if output_path else None,
                )

            output_format = img.format or "PNG"
            work.save(output_path, format=output_format, optimize=True)

        processed_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message="Filter applied successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=processed_size,
            dimensions={"width": work.width, "height": work.height},
        )
    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error applying filter: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def resize_image(
    input_path: Path,
    output_path: Path,
    width: int | None = None,
    height: int | None = None,
    maintain_aspect_ratio: bool = True,
    resample: str = "lanczos",
) -> ImageProcessingResponse:
    """
    Resize an image to specified dimensions

    Args:
        input_path: Path to input image
        output_path: Path to save resized image
        width: Target width in pixels (optional)
        height: Target height in pixels (optional)
        maintain_aspect_ratio: Whether to maintain aspect ratio
        resample: Resampling algorithm (nearest, bilinear, bicubic, lanczos)

    Returns:
        ImageProcessingResponse with resize results
    """
    try:
        # Validate that at least one dimension is provided
        if width is None and height is None:
            return ImageProcessingResponse(
                success=False,
                message="At least one dimension (width or height) must be specified",
                filename=output_path.name if output_path else None,
            )

        # Get original file size
        original_size = get_file_size(input_path)

        # Map resample string to Pillow constant
        resample_map = {
            "nearest": Image.NEAREST,
            "bilinear": Image.BILINEAR,
            "bicubic": Image.BICUBIC,
            "lanczos": Image.LANCZOS,
        }
        resample_filter = resample_map.get(resample.lower(), Image.LANCZOS)

        # Open and resize image
        with Image.open(input_path) as img:
            # Get original dimensions
            original_dimensions = {"width": img.width, "height": img.height}
            original_width, original_height = img.size

            # Calculate target dimensions
            if maintain_aspect_ratio:
                if width is not None and height is not None:
                    # Both dimensions specified - maintain aspect ratio
                    aspect_ratio = original_width / original_height
                    if width / height > aspect_ratio:
                        # Height is the limiting factor
                        target_width = int(height * aspect_ratio)
                        target_height = height
                    else:
                        # Width is the limiting factor
                        target_width = width
                        target_height = int(width / aspect_ratio)
                elif width is not None:
                    # Only width specified
                    aspect_ratio = original_width / original_height
                    target_width = width
                    target_height = int(width / aspect_ratio)
                else:
                    # Only height specified
                    aspect_ratio = original_width / original_height
                    target_width = int(height * aspect_ratio)
                    target_height = height
            else:
                # Don't maintain aspect ratio - use exact dimensions
                target_width = width if width is not None else original_width
                target_height = height if height is not None else original_height

            # Resize image
            resized_img = img.resize((target_width, target_height), resample=resample_filter)

            # Get new dimensions
            new_dimensions = {"width": target_width, "height": target_height}

            # Preserve original format
            output_format = img.format or "PNG"
            if output_format == "JPEG":
                # Convert RGBA to RGB if saving as JPEG
                if resized_img.mode == "RGBA":
                    rgb_img = Image.new("RGB", resized_img.size, (255, 255, 255))
                    rgb_img.paste(
                        resized_img,
                        mask=resized_img.split()[3] if len(resized_img.split()) == 4 else None,
                    )
                    resized_img = rgb_img

            # Save resized image
            if output_format in ["JPEG", "JPG"]:
                resized_img.save(output_path, format=output_format, quality=95, optimize=True)
            else:
                resized_img.save(output_path, format=output_format, optimize=True)

        # Get resized file size
        resized_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Image resized to {target_width}x{target_height} successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=resized_size,
            dimensions=new_dimensions,
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error resizing image: {str(e)}",
            filename=output_path.name if output_path else None,
        )
