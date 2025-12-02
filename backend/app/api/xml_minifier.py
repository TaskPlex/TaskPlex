"""
XML minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.xml_minifier import XMLMinifierRequest, XMLMinifierResponse
from app.services.xml_minifier_service import minify_xml

router = APIRouter(prefix="/xml-minifier", tags=["XML Minifier"])


@router.post("/minify", response_model=XMLMinifierResponse)
async def minify_xml_endpoint(request: XMLMinifierRequest):
    """
    Minify XML code

    - **xml**: XML code to minify
    """
    result = minify_xml(xml_str=request.xml)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
