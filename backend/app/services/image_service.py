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


def flip_image(
    input_path: Path, output_path: Path, direction: str = "horizontal"
) -> ImageProcessingResponse:
    """
    Flip an image horizontally or vertically

    Args:
        input_path: Path to input image
        output_path: Path to save flipped image
        direction: Flip direction ("horizontal" or "vertical")

    Returns:
        ImageProcessingResponse with flip results
    """
    try:
        # Get original file size
        original_size = get_file_size(input_path)

        # Open and flip image
        with Image.open(input_path) as img:
            # Get dimensions
            dimensions = {"width": img.width, "height": img.height}

            # Flip image based on direction
            if direction.lower() == "horizontal":
                flipped_img = ImageOps.mirror(img)
            elif direction.lower() == "vertical":
                flipped_img = ImageOps.flip(img)
            else:
                return ImageProcessingResponse(
                    success=False,
                    message=f"Invalid flip direction: {direction}. Use 'horizontal' or 'vertical'",
                    filename=output_path.name if output_path else None,
                )

            # Preserve original format
            output_format = img.format or "PNG"
            if output_format == "JPEG":
                # Convert RGBA to RGB if saving as JPEG
                if flipped_img.mode == "RGBA":
                    rgb_img = Image.new("RGB", flipped_img.size, (255, 255, 255))
                    rgb_img.paste(
                        flipped_img,
                        mask=flipped_img.split()[3] if len(flipped_img.split()) == 4 else None,
                    )
                    flipped_img = rgb_img

            # Save flipped image
            if output_format in ["JPEG", "JPG"]:
                flipped_img.save(output_path, format=output_format, quality=95, optimize=True)
            else:
                flipped_img.save(output_path, format=output_format, optimize=True)

        # Get flipped file size
        flipped_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Image flipped {direction} successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=flipped_size,
            dimensions=dimensions,
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error flipping image: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def create_collage(
    image_paths: list[Path],
    output_path: Path,
    rows: int,
    cols: int,
    image_order: list[int],
) -> ImageProcessingResponse:
    """
    Create a collage from multiple images arranged in a grid

    Args:
        image_paths: List of paths to input images
        output_path: Path to save the collage
        rows: Number of rows in the grid
        cols: Number of columns in the grid
        image_order: Order of images in the grid (indices from 0 to len(image_paths)-1)

    Returns:
        ImageProcessingResponse with collage creation results
    """
    try:
        total_cells = rows * cols
        num_images = len(image_paths)

        # Validate that we have enough images
        if num_images == 0:
            return ImageProcessingResponse(
                success=False,
                message="At least one image is required",
                filename=output_path.name if output_path else None,
            )

        # Validate image order
        if len(image_order) != total_cells:
            return ImageProcessingResponse(
                success=False,
                message=f"Image order must have {total_cells} elements (rows * cols)",
                filename=output_path.name if output_path else None,
            )

        # Validate that all indices in image_order are valid
        for idx in image_order:
            if idx < 0 or idx >= num_images:
                return ImageProcessingResponse(
                    success=False,
                    message=f"Invalid image index {idx}. Must be between 0 and {num_images - 1}",
                    filename=output_path.name if output_path else None,
                )

        # Open all images and get their dimensions
        images = []
        for img_path in image_paths:
            try:
                with Image.open(img_path) as img:
                    # Convert to RGB if necessary
                    if img.mode != "RGB":
                        rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                        if img.mode == "RGBA":
                            rgb_img.paste(
                                img, mask=img.split()[3] if len(img.split()) == 4 else None
                            )
                        else:
                            rgb_img.paste(img)
                        images.append(rgb_img.copy())
                    else:
                        images.append(img.copy())
            except Exception as e:
                return ImageProcessingResponse(
                    success=False,
                    message=f"Error opening image {img_path.name}: {str(e)}",
                    filename=output_path.name if output_path else None,
                )

        # Calculate cell size based on the first image's aspect ratio
        # We'll use a standard size and let images fill their cells
        # Use a reasonable default size (e.g., 800x800 per cell)
        cell_width = 800
        cell_height = 800

        # Create the collage canvas
        collage_width = cell_width * cols
        collage_height = cell_height * rows
        collage = Image.new("RGB", (collage_width, collage_height), (255, 255, 255))

        # Place images in the grid according to image_order
        for grid_idx, image_idx in enumerate(image_order):
            row = grid_idx // cols
            col = grid_idx % cols

            # Get the image to place
            img = images[image_idx]

            # Resize image to cover the cell while preserving aspect ratio
            # Then crop to exact cell size (cover behavior - like CSS object-fit: cover)
            img_aspect = img.width / img.height
            cell_aspect = cell_width / cell_height

            if img_aspect > cell_aspect:
                # Image is wider than cell - fit to height, then crop width
                new_height = cell_height
                new_width = int(cell_height * img_aspect)
            else:
                # Image is taller than cell - fit to width, then crop height
                new_width = cell_width
                new_height = int(cell_width / img_aspect)

            # Resize image to cover size
            resized_img = img.resize((new_width, new_height), Image.LANCZOS)

            # Crop to exact cell dimensions (center crop)
            left = (new_width - cell_width) // 2
            top = (new_height - cell_height) // 2
            right = left + cell_width
            bottom = top + cell_height
            cropped_img = resized_img.crop((left, top, right, bottom))

            # Calculate position
            x_offset = col * cell_width
            y_offset = row * cell_height

            # Paste image onto collage (fills cell exactly, no white spaces)
            collage.paste(cropped_img, (x_offset, y_offset))

        # Save the collage
        collage.save(output_path, format="PNG", quality=95, optimize=True)

        # Get file size
        collage_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Collage created successfully ({rows}x{cols} grid)",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            processed_size=collage_size,
            dimensions={"width": collage_width, "height": collage_height},
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error creating collage: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def create_icon(
    input_path: Path,
    output_path: Path,
    size: int = 256,
) -> ImageProcessingResponse:
    """
    Convert an image to an ICO file

    Args:
        input_path: Path to input image
        output_path: Path to save ICO file
        size: Icon size in pixels (default: 256, must be between 16 and 512)

    Returns:
        ImageProcessingResponse with icon creation results
    """
    try:
        # Validate size
        if size < 16 or size > 512:
            return ImageProcessingResponse(
                success=False,
                message=f"Invalid icon size: {size}. Size must be between 16 and 512 pixels",
                filename=output_path.name if output_path else None,
            )

        # Get original file size
        original_size = get_file_size(input_path)

        # Open input image
        with Image.open(input_path) as img:
            # Convert to RGBA if necessary (ICO format supports transparency)
            if img.mode not in ("RGBA", "RGB"):
                if img.mode == "P" and "transparency" in img.info:
                    img = img.convert("RGBA")
                elif img.mode == "LA":
                    # Grayscale with alpha
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")
                    # Add alpha channel for RGB images (fully opaque)
                    rgba_img = Image.new("RGBA", img.size, (255, 255, 255, 255))
                    rgba_img.paste(img)
                    img = rgba_img

            # Get original dimensions
            original_dimensions = {"width": img.width, "height": img.height}

            # Resize image to square (ICO files typically use square icons)
            icon_img = img.resize((size, size), Image.LANCZOS)

            # Save as ICO file
            icon_img.save(output_path, format="ICO")

        # Get icon file size
        icon_size = get_file_size(output_path)

        return ImageProcessingResponse(
            success=True,
            message=f"Icon created successfully ({size}x{size}px)",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=icon_size,
            dimensions={"width": size, "height": size},
        )

    except Exception as e:
        return ImageProcessingResponse(
            success=False,
            message=f"Error creating icon: {str(e)}",
            filename=output_path.name if output_path else None,
        )
