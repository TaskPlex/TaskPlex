"""
CSV converter service
Handles conversion between CSV and JSON formats
"""

import csv
import io
import json
from pathlib import Path

from app.models.csv_converter import CSVToJSONResponse, JSONToCSVResponse


def csv_to_json(input_path: Path, output_path: Path | None = None) -> CSVToJSONResponse:
    """
    Convert CSV file to JSON

    Args:
        input_path: Path to the input CSV file
        output_path: Optional path to save the JSON file

    Returns:
        CSVToJSONResponse with converted JSON data
    """
    try:
        rows = []

        # Read CSV file
        with open(input_path, "r", encoding="utf-8") as csvfile:
            # Try to detect delimiter
            sample = csvfile.read(1024)
            csvfile.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter

            reader = csv.DictReader(csvfile, delimiter=delimiter)

            for row in reader:
                # Convert empty strings to None for cleaner JSON
                cleaned_row = {k: (v if v else None) for k, v in row.items()}
                rows.append(cleaned_row)

        rows_count = len(rows)

        # Convert to JSON string
        json_data = json.dumps(rows, indent=2, ensure_ascii=False)

        # Save to file if output_path provided
        download_url = None
        filename = None
        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as jsonfile:
                jsonfile.write(json_data)

            filename = output_path.name
            download_url = f"/api/v1/download/{filename}"

        return CSVToJSONResponse(
            success=True,
            message=f"Successfully converted {rows_count} rows from CSV to JSON",
            json_data=json_data,
            download_url=download_url,
            filename=filename,
            rows_count=rows_count,
        )

    except FileNotFoundError:
        return CSVToJSONResponse(
            success=False,
            message="CSV file not found",
            json_data="",
            rows_count=0,
        )
    except csv.Error as e:
        return CSVToJSONResponse(
            success=False,
            message=f"Error reading CSV file: {str(e)}",
            json_data="",
            rows_count=0,
        )
    except json.JSONEncodeError as e:
        return CSVToJSONResponse(
            success=False,
            message=f"Error encoding JSON: {str(e)}",
            json_data="",
            rows_count=0,
        )
    except Exception as e:
        return CSVToJSONResponse(
            success=False,
            message=f"Unexpected error: {str(e)}",
            json_data="",
            rows_count=0,
        )


def json_to_csv(input_path: Path, output_path: Path | None = None) -> JSONToCSVResponse:
    """
    Convert JSON file to CSV

    Args:
        input_path: Path to the input JSON file
        output_path: Optional path to save the CSV file

    Returns:
        JSONToCSVResponse with converted CSV data
    """
    try:
        # Read JSON file
        with open(input_path, "r", encoding="utf-8") as jsonfile:
            data = json.load(jsonfile)

        # Ensure data is a list
        if not isinstance(data, list):
            data = [data]

        if not data:
            return JSONToCSVResponse(
                success=False,
                message="JSON file is empty or contains no data",
                csv_data="",
                rows_count=0,
            )

        # Get all unique keys from all objects
        all_keys = set()
        for item in data:
            if isinstance(item, dict):
                all_keys.update(item.keys())

        fieldnames = sorted(list(all_keys))

        if not fieldnames:
            return JSONToCSVResponse(
                success=False,
                message="JSON data contains no valid objects",
                csv_data="",
                rows_count=0,
            )

        # Convert to CSV string using StringIO
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for item in data:
            if isinstance(item, dict):
                # Convert None to empty string for CSV
                cleaned_item = {k: (v if v is not None else "") for k, v in item.items()}
                writer.writerow(cleaned_item)

        csv_data = output.getvalue()
        output.close()
        rows_count = len([item for item in data if isinstance(item, dict)])

        # Save to file if output_path provided
        download_url = None
        filename = None
        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "w", encoding="utf-8", newline="") as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for item in data:
                    if isinstance(item, dict):
                        cleaned_item = {k: (v if v is not None else "") for k, v in item.items()}
                        writer.writerow(cleaned_item)

            filename = output_path.name
            download_url = f"/api/v1/download/{filename}"

        return JSONToCSVResponse(
            success=True,
            message=f"Successfully converted {rows_count} rows from JSON to CSV",
            csv_data=csv_data,
            download_url=download_url,
            filename=filename,
            rows_count=rows_count,
        )

    except FileNotFoundError:
        return JSONToCSVResponse(
            success=False,
            message="JSON file not found",
            csv_data="",
            rows_count=0,
        )
    except json.JSONDecodeError as e:
        return JSONToCSVResponse(
            success=False,
            message=f"Invalid JSON format: {str(e)}",
            csv_data="",
            rows_count=0,
        )
    except Exception as e:
        return JSONToCSVResponse(
            success=False,
            message=f"Unexpected error: {str(e)}",
            csv_data="",
            rows_count=0,
        )
