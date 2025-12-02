"""
XML formatter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.xml_formatter import XMLFormatterRequest, XMLFormatterResponse
from app.services.xml_formatter_service import format_xml

router = APIRouter(prefix="/xml-formatter", tags=["XML Formatter"])


@router.post("/format", response_model=XMLFormatterResponse)
async def format_xml_endpoint(request: XMLFormatterRequest):
    """
    Format XML

    - **xml**: XML string to format
    - **indent_size**: Indentation size for formatting (1-8)
    """
    result = format_xml(
        xml_str=request.xml,
        indent_size=request.indent_size,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
