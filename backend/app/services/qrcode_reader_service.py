"""
QR Code reading service
"""

from pathlib import Path

from PIL import Image
from pyzbar import pyzbar

from app.models.qrcode import QRCodeReadResponse


def read_qrcode(image_path: Path) -> QRCodeReadResponse:
    """
    Read QR code data from an image file

    Args:
        image_path: Path to image file containing QR code

    Returns:
        QRCodeReadResponse with decoded data
    """
    try:
        # Open and process image
        with Image.open(image_path) as img:
            # Convert to RGB if needed (pyzbar works best with RGB)
            if img.mode != "RGB":
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "RGBA":
                    rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
                else:
                    rgb_img.paste(img)
                img = rgb_img

            # Decode QR codes from image
            decoded_objects = pyzbar.decode(img)

            if not decoded_objects:
                return QRCodeReadResponse(
                    success=False,
                    message="No QR code found in the image. Please ensure the image contains a valid QR code.",
                )

            # Get the first QR code data (most common use case)
            qr_data = decoded_objects[0]
            data = qr_data.data.decode("utf-8")
            qr_type = qr_data.type

            return QRCodeReadResponse(
                success=True,
                message="QR code read successfully",
                data=data,
                qr_type=qr_type,
            )

    except UnicodeDecodeError:
        return QRCodeReadResponse(
            success=False,
            message="Error decoding QR code data. The QR code may contain binary or unsupported data.",
        )
    except Exception as e:
        return QRCodeReadResponse(
            success=False,
            message=f"Error reading QR code: {str(e)}",
        )
