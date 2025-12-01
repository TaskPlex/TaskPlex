"""
PDF processing service using pypdf and PyMuPDF
"""

from pathlib import Path
from typing import List, Optional

import fitz  # PyMuPDF
from pypdf import PdfReader, PdfWriter

try:
    from pdf2image import convert_from_path
    import pytesseract

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

from app.models.pdf import PDFInfoResponse, PDFProcessingResponse
from app.utils.file_handler import get_file_size


def get_pdf_info(input_path: Path) -> Optional[PDFInfoResponse]:
    """
    Get information about a PDF file
    """
    try:
        file_size = get_file_size(input_path)

        with open(input_path, "rb") as f:
            reader = PdfReader(f)
            page_count = len(reader.pages)
            encrypted = reader.is_encrypted
            metadata = reader.metadata

            # Convert metadata to simple dict if present
            meta_dict = {}
            if metadata:
                for key, value in metadata.items():
                    if isinstance(value, str):
                        meta_dict[key.replace("/", "")] = value

        return PDFInfoResponse(
            filename=input_path.name,
            page_count=page_count,
            file_size=file_size,
            encrypted=encrypted,
            metadata=meta_dict,
        )
    except Exception as e:
        print(f"Error reading PDF info: {e}")
        return None


# ... (rest of the functions: merge_pdfs, compress_pdf, split_pdf, reorganize_pdf - keep existing)
def merge_pdfs(input_paths: List[Path], output_path: Path) -> PDFProcessingResponse:
    """
    Merge multiple PDF files into one

    Args:
        input_paths: List of paths to PDF files to merge
        output_path: Path to save merged PDF

    Returns:
        PDFProcessingResponse with merge results
    """
    try:
        writer = PdfWriter()

        total_pages = 0
        for pdf_path in input_paths:
            writer.append(str(pdf_path))
            # Count pages
            with open(pdf_path, "rb") as f:
                reader = PdfReader(f)
                total_pages += len(reader.pages)

        # Write merged PDF
        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        processed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message=f"Successfully merged {len(input_paths)} PDFs",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=total_pages,
            processed_size=processed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error merging PDFs: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def compress_pdf(input_path: Path, output_path: Path) -> PDFProcessingResponse:
    """
    Compress a PDF file using PyMuPDF

    Args:
        input_path: Path to input PDF
        output_path: Path to save compressed PDF

    Returns:
        PDFProcessingResponse with compression results
    """
    try:
        original_size = get_file_size(input_path)

        # Open PDF with PyMuPDF
        doc = fitz.open(input_path)

        # Save with compression options
        doc.save(
            output_path,
            garbage=4,  # Maximum garbage collection
            deflate=True,  # Compress content streams
            clean=True,  # Clean and sanitize content streams
        )

        total_pages = len(doc)
        doc.close()

        compressed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message="PDF compressed successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=total_pages,
            original_size=original_size,
            processed_size=compressed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error compressing PDF: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def split_pdf(
    input_path: Path,
    output_dir: Path,
    pages: Optional[List[int]] = None,
    page_ranges: Optional[List[str]] = None,
) -> PDFProcessingResponse:
    """
    Split a PDF file into multiple files

    Args:
        input_path: Path to input PDF
        output_dir: Directory to save split PDFs
        pages: List of specific pages to extract (1-indexed)
        page_ranges: List of page ranges (e.g., ['1-3', '5-7'])

    Returns:
        PDFProcessingResponse with split results
    """
    try:
        with open(input_path, "rb") as file:
            reader = PdfReader(file)
            total_pages = len(reader.pages)

            output_files = []

            # If no pages or ranges specified, split into individual pages
            if not pages and not page_ranges:
                for i in range(total_pages):
                    writer = PdfWriter()
                    writer.add_page(reader.pages[i])

                    output_filename = f"{input_path.stem}_page_{i + 1}.pdf"
                    output_path = output_dir / output_filename

                    with open(output_path, "wb") as output_file:
                        writer.write(output_file)

                    output_files.append(output_filename)

            # Extract specific pages
            elif pages:
                for page_num in pages:
                    if 1 <= page_num <= total_pages:
                        writer = PdfWriter()
                        writer.add_page(reader.pages[page_num - 1])

                        output_filename = f"{input_path.stem}_page_{page_num}.pdf"
                        output_path = output_dir / output_filename

                        with open(output_path, "wb") as output_file:
                            writer.write(output_file)

                        output_files.append(output_filename)

            # Extract page ranges
            elif page_ranges:
                for page_range in page_ranges:
                    start, end = map(int, page_range.split("-"))
                    if 1 <= start <= end <= total_pages:
                        writer = PdfWriter()

                        for i in range(start - 1, end):
                            writer.add_page(reader.pages[i])

                        output_filename = f"{input_path.stem}_pages_{start}-{end}.pdf"
                        output_path = output_dir / output_filename

                        with open(output_path, "wb") as output_file:
                            writer.write(output_file)

                        output_files.append(output_filename)

        return PDFProcessingResponse(
            success=True,
            message=f"PDF split into {len(output_files)} files",
            filenames=output_files,
            total_pages=total_pages,
        )

    except Exception as e:
        return PDFProcessingResponse(success=False, message=f"Error splitting PDF: {str(e)}")


def reorganize_pdf(
    input_path: Path, output_path: Path, page_order: List[int]
) -> PDFProcessingResponse:
    """
    Reorganize PDF pages according to specified order

    Args:
        input_path: Path to input PDF
        output_path: Path to save reorganized PDF
        page_order: New order of pages (1-indexed)

    Returns:
        PDFProcessingResponse with reorganization results
    """
    try:
        with open(input_path, "rb") as file:
            reader = PdfReader(file)
            total_pages = len(reader.pages)

            # Validate page numbers
            for page_num in page_order:
                if page_num < 1 or page_num > total_pages:
                    return PDFProcessingResponse(
                        success=False,
                        message=f"Invalid page number: {page_num}. PDF has {total_pages} pages.",
                    )

            # Create new PDF with reordered pages
            writer = PdfWriter()

            for page_num in page_order:
                writer.add_page(reader.pages[page_num - 1])

            # Write reorganized PDF
            with open(output_path, "wb") as output_file:
                writer.write(output_file)

        processed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message="PDF reorganized successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=len(page_order),
            processed_size=processed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error reorganizing PDF: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def add_password_pdf(input_path: Path, output_path: Path, password: str) -> PDFProcessingResponse:
    """
    Add password protection to a PDF file

    Args:
        input_path: Path to input PDF
        output_path: Path to save password-protected PDF
        password: Password to encrypt the PDF

    Returns:
        PDFProcessingResponse with password protection results
    """
    try:
        original_size = get_file_size(input_path)

        # Read the PDF
        with open(input_path, "rb") as file:
            reader = PdfReader(file)
            writer = PdfWriter()

            # Copy all pages
            for page in reader.pages:
                writer.add_page(page)

            # Add password encryption
            writer.encrypt(password)

            # Write encrypted PDF
            with open(output_path, "wb") as output_file:
                writer.write(output_file)

        # Get page count
        with open(input_path, "rb") as file:
            reader = PdfReader(file)
            total_pages = len(reader.pages)

        processed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message="PDF password protection added successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=total_pages,
            original_size=original_size,
            processed_size=processed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error adding password to PDF: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def remove_password_pdf(
    input_path: Path, output_path: Path, password: str
) -> PDFProcessingResponse:
    """
    Remove password protection from a PDF file

    Args:
        input_path: Path to input password-protected PDF
        output_path: Path to save unprotected PDF
        password: Password to decrypt the PDF

    Returns:
        PDFProcessingResponse with password removal results
    """
    try:
        original_size = get_file_size(input_path)

        # Read the encrypted PDF
        with open(input_path, "rb") as file:
            reader = PdfReader(file)

            # Check if PDF is encrypted
            if not reader.is_encrypted:
                return PDFProcessingResponse(
                    success=False,
                    message="PDF is not password-protected",
                    filename=output_path.name if output_path else None,
                )

            # Try to decrypt with provided password
            if not reader.decrypt(password):
                return PDFProcessingResponse(
                    success=False,
                    message="Incorrect password provided",
                    filename=output_path.name if output_path else None,
                )

            # Create new PDF without password
            writer = PdfWriter()

            # Copy all pages
            for page in reader.pages:
                writer.add_page(page)

            # Write unencrypted PDF
            with open(output_path, "wb") as output_file:
                writer.write(output_file)

        total_pages = len(reader.pages)
        processed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message="PDF password removed successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=total_pages,
            original_size=original_size,
            processed_size=processed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error removing password from PDF: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def extract_text_with_ocr(
    input_path: Path, output_path: Path, language: str = "eng"
) -> PDFProcessingResponse:
    """
    Extract text from PDF using OCR (Optical Character Recognition)
    Useful for scanned PDFs or PDFs with images

    Args:
        input_path: Path to input PDF
        output_path: Path to save text file
        language: Tesseract language code (default: "eng" for English)

    Returns:
        PDFProcessingResponse with OCR results
    """
    if not OCR_AVAILABLE:
        return PDFProcessingResponse(
            success=False,
            message="OCR dependencies not available. Please install: pip install pytesseract pdf2image",
        )

    try:
        # Check if Tesseract is installed
        try:
            pytesseract.get_tesseract_version()
        except Exception as e:
            return PDFProcessingResponse(
                success=False,
                message=f"Tesseract OCR not found. Please install Tesseract on your system. Error: {str(e)}",
            )

        # Convert PDF pages to images
        try:
            images = convert_from_path(str(input_path), dpi=300)
        except Exception as e:
            error_msg = str(e)
            if "poppler" in error_msg.lower() or "pdftoppm" in error_msg.lower():
                return PDFProcessingResponse(
                    success=False,
                    message="Poppler not installed. Please install poppler-utils (Linux) or poppler (macOS/Windows).",
                )
            raise

        if not images:
            return PDFProcessingResponse(
                success=False,
                message="Could not convert PDF pages to images",
            )

        # Extract text from each page using OCR
        extracted_text = []
        for i, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(image, lang=language)
                if text.strip():
                    extracted_text.append(f"--- Page {i + 1} ---\n{text}\n")
            except Exception as e:
                # If OCR fails for a page, continue with other pages
                extracted_text.append(f"--- Page {i + 1} ---\n[OCR Error: {str(e)}]\n")

        if not extracted_text:
            return PDFProcessingResponse(
                success=False,
                message="No text could be extracted from the PDF",
            )

        # Write extracted text to file
        full_text = "\n".join(extracted_text)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_text)

        # Get file size
        processed_size = get_file_size(output_path)

        return PDFProcessingResponse(
            success=True,
            message=f"Text extracted from {len(images)} pages",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            total_pages=len(images),
            processed_size=processed_size,
        )

    except Exception as e:
        return PDFProcessingResponse(
            success=False,
            message=f"Error performing OCR: {str(e)}",
            filename=output_path.name if output_path else None,
        )
