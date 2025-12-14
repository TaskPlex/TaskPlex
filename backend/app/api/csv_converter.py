"""
CSV converter API endpoints
"""

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import TEMP_DIR
from app.models.csv_converter import CSVToJSONResponse, JSONToCSVResponse
from app.services.csv_converter_service import csv_to_json, json_to_csv
from app.utils.file_handler import (
    delete_file,
    generate_unique_filename,
    save_upload_file,
)

router = APIRouter(prefix="/csv-converter", tags=["CSV Converter"])


@router.post("/csv-to-json", response_model=CSVToJSONResponse)
async def csv_to_json_endpoint(
    file: UploadFile = File(..., description="CSV file to convert to JSON"),
):
    """
    Convert a CSV file to JSON format

    - **file**: CSV file to convert

    Returns JSON data and optional download URL
    """
    # Validate file format
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV file")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}.json")
        output_path = TEMP_DIR / output_filename

        # Convert CSV to JSON
        result = csv_to_json(input_path, output_path)

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)


@router.post("/json-to-csv", response_model=JSONToCSVResponse)
async def json_to_csv_endpoint(
    file: UploadFile = File(..., description="JSON file to convert to CSV"),
):
    """
    Convert a JSON file to CSV format

    - **file**: JSON file to convert

    Returns CSV data and optional download URL
    """
    # Validate file format
    if not file.filename or not file.filename.lower().endswith(".json"):
        raise HTTPException(status_code=400, detail="File must be a JSON file")

    input_path = None
    output_path = None

    try:
        # Save uploaded file
        input_path = await save_upload_file(file)

        # Create output path
        base_name = Path(file.filename).stem
        output_filename = generate_unique_filename(f"{base_name}.csv")
        output_path = TEMP_DIR / output_filename

        # Convert JSON to CSV
        result = json_to_csv(input_path, output_path)

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result

    finally:
        # Clean up input file
        if input_path:
            delete_file(input_path)
