"""
Unit conversion API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.units import UnitConversionRequest, UnitConversionResponse
from app.services.units_service import convert_units

router = APIRouter(prefix="/units", tags=["Units"])


@router.post("/convert", response_model=UnitConversionResponse)
async def convert_unit(request: UnitConversionRequest):
    """
    Convert a value from one unit to another

    - **value**: Value to convert
    - **from_unit**: Source unit (e.g., 'meter', 'kilogram', 'celsius')
    - **to_unit**: Target unit (e.g., 'feet', 'pound', 'fahrenheit')

    Examples:
    - Length: meter, kilometer, mile, foot, inch
    - Mass: kilogram, gram, pound, ounce
    - Temperature: celsius, fahrenheit, kelvin
    - Time: second, minute, hour, day
    - Speed: meter/second, kilometer/hour, mile/hour
    """
    result = convert_units(
        value=request.value, from_unit=request.from_unit, to_unit=request.to_unit
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
