"""
Image processing service using Pillow
"""

from pathlib import Path

from PIL import Image

from app.config import IMAGE_COMPRESSION_QUALITY
from app.models.image import ImageProcessingResponse
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
