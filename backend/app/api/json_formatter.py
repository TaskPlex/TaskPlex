"""
JSON formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.json_formatter import JSONFormatterRequest, JSONFormatterResponse
from app.services.json_formatter_service import format_json

router = APIRouter(prefix="/json-formatter", tags=["JSON Formatter"])


@router.post("/format", response_model=JSONFormatterResponse)
async def format_json_endpoint(request: JSONFormatterRequest):
    """
    Format JSON

    - **json**: JSON string to format
    - **indent_size**: Indentation size for formatting (1-8)
    """
    result = format_json(
        json_str=request.json,
        indent_size=request.indent_size,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
