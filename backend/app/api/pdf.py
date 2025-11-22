"""
PDF processing API endpoints
"""

import shutil
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.pdf import PDFInfoResponse, PDFProcessingResponse
from app.services.pdf_service import (
    compress_pdf,
    get_pdf_info,
    merge_pdfs,
    reorganize_pdf,
    split_pdf,
)
from app.utils.file_handler import (
    delete_file,
    generate_unique_filename,
    save_upload_file,
)
from app.utils.validators import validate_pdf_format

router = APIRouter(prefix="/pdf", tags=["PDF"])


@router.post("/info", response_model=PDFInfoResponse)
async def get_pdf_file_info(
    file: UploadFile = File(..., description="PDF file to inspect"),
):
    """
    Get information about a PDF file (page count, metadata)
    """
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    input_path = None
    try:
        input_path = await save_upload_file(file)
        info = get_pdf_info(input_path)

        if not info:
            raise HTTPException(status_code=500, detail="Could not read PDF info")

        return info
    finally:
        if input_path:
            delete_file(input_path)


@router.post("/merge", response_model=PDFProcessingResponse)
async def merge_pdf_files(
    files: List[UploadFile] = File(..., description="PDF files to merge (in order)"),
):
    # ... (reste inchangé) ...
    """
    Merge multiple PDF files into one
    """
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required for merging")

    # Validate all files
    for file in files:
        if not validate_pdf_format(file.filename):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a valid PDF")

    input_paths = []
    output_path = None

    try:
        # Save all uploaded files
        for file in files:
            input_path = await save_upload_file(file)
            input_paths.append(input_path)

        # Create output path
        output_filename = generate_unique_filename("merged.pdf")
        output_path = TEMP_DIR / output_filename

        # Merge PDFs
        result = merge_pdfs(input_paths, output_path)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result

    finally:
        # Clean up input files
        for input_path in input_paths:
            delete_file(input_path)


@router.post("/compress", response_model=PDFProcessingResponse)
async def compress_pdf_file(
    file: UploadFile = File(..., description="PDF file to compress"),
):
    # ... (reste inchangé) ...
    """
    Compress a PDF file
    """
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    input_path = None
    output_path = None

    try:
        input_path = await save_upload_file(file)
        output_filename = generate_unique_filename(f"compressed_{file.filename}")
        output_path = TEMP_DIR / output_filename
        result = compress_pdf(input_path, output_path)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message or "Failed to compress PDF")

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error compressing PDF: {str(e)}")
    finally:
        if input_path:
            delete_file(input_path)


@router.post("/split", response_model=PDFProcessingResponse)
async def split_pdf_file(
    file: UploadFile = File(..., description="PDF file to split"),
    pages: Optional[str] = Form(None, description="Comma-separated page numbers (e.g., '1,3,5')"),
    page_ranges: Optional[str] = Form(
        None, description="Comma-separated page ranges (e.g., '1-3,5-7')"
    ),
):
    """
    Split a PDF file into multiple files and return them as a ZIP
    """
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    input_path = None
    output_dir = None

    try:
        input_path = await save_upload_file(file)

        pages_list = None
        ranges_list = None

        if pages:
            pages_list = [int(p.strip()) for p in pages.split(",")]

        if page_ranges:
            ranges_list = [r.strip() for r in page_ranges.split(",")]

        # Create output directory
        dir_name = f"split_{generate_unique_filename('').replace('.', '')}"
        output_dir = TEMP_DIR / dir_name
        output_dir.mkdir(exist_ok=True)

        # Split PDF
        result = split_pdf(input_path, output_dir, pages_list, ranges_list)

        if not result.success:
            shutil.rmtree(output_dir)
            raise HTTPException(status_code=500, detail=result.message)

        # Create ZIP of the directory
        zip_filename = f"{dir_name}.zip"
        zip_path = TEMP_DIR / zip_filename

        shutil.make_archive(str(zip_path.with_suffix("")), "zip", output_dir)

        # Cleanup output dir containing split pdfs (we only keep the zip)
        shutil.rmtree(output_dir)

        # Update result with zip info
        result.filename = zip_filename
        result.download_url = f"/api/v1/download/{zip_filename}"
        result.message = "PDF split successfully (download as ZIP)"

        return result

    finally:
        if input_path:
            delete_file(input_path)


@router.post("/reorganize", response_model=PDFProcessingResponse)
async def reorganize_pdf_pages(
    file: UploadFile = File(..., description="PDF file to reorganize"),
    page_order: str = Form(..., description="Comma-separated new page order (e.g., '3,1,2,4')"),
):
    # ... (reste inchangé) ...
    """
    Reorganize PDF pages
    """
    if not validate_pdf_format(file.filename):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    input_path = None
    output_path = None

    try:
        page_order_list = [int(p.strip()) for p in page_order.split(",")]
        input_path = await save_upload_file(file)
        output_filename = generate_unique_filename(f"reorganized_{file.filename}")
        output_path = TEMP_DIR / output_filename
        result = reorganize_pdf(input_path, output_path, page_order_list)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        return result
    finally:
        if input_path:
            delete_file(input_path)
