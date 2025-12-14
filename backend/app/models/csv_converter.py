"""
CSV converter models
"""

from pydantic import BaseModel, Field


class CSVToJSONResponse(BaseModel):
    """Response model for CSV to JSON conversion"""

    success: bool
    message: str
    json_data: str = Field(..., description="Converted JSON data as string")
    download_url: str | None = Field(None, description="URL to download the JSON file")
    filename: str | None = Field(None, description="Generated filename")
    rows_count: int = Field(0, description="Number of rows converted")


class JSONToCSVResponse(BaseModel):
    """Response model for JSON to CSV conversion"""

    success: bool
    message: str
    csv_data: str = Field(..., description="Converted CSV data as string")
    download_url: str | None = Field(None, description="URL to download the CSV file")
    filename: str | None = Field(None, description="Generated filename")
    rows_count: int = Field(0, description="Number of rows converted")
