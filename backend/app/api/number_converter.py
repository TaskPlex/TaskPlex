"""
Number base conversion API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.number_converter import (
    NumberConversionRequest,
    NumberConversionResponse,
)
from app.services.number_converter_service import convert_number

router = APIRouter(prefix="/number-converter", tags=["Number Converter"])


@router.post("/convert", response_model=NumberConversionResponse)
async def convert_number_endpoint(request: NumberConversionRequest):
    """
    Convert a number from one base to another

    - **number**: Number to convert (as string)
    - **from_base**: Source base - binary, decimal, hexadecimal, or octal
    - **to_base**: Target base - binary, decimal, hexadecimal, or octal

    Examples:
    - Binary to Decimal: number="1010", from_base="binary", to_base="decimal"
    - Decimal to Hexadecimal: number="255", from_base="decimal", to_base="hexadecimal"
    - Hexadecimal to Binary: number="FF", from_base="hexadecimal", to_base="binary"
    - Octal to Decimal: number="777", from_base="octal", to_base="decimal"
    """
    result = convert_number(
        number=request.number,
        from_base=request.from_base,
        to_base=request.to_base,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
