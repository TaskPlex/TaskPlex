"""
JSON minifier API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.json_minifier import JSONMinifierRequest, JSONMinifierResponse
from app.services.json_minifier_service import minify_json_code

router = APIRouter(prefix="/json-minifier", tags=["JSON Minifier"])


@router.post("/minify", response_model=JSONMinifierResponse)
async def minify_json_endpoint(request: JSONMinifierRequest):
    """
    Minify JSON code

    - **json**: JSON string to minify
    """
    result = minify_json_code(json_str=request.json)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
