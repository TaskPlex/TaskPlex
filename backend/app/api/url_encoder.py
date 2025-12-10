"""
API routes for URL encode/decode
"""

from fastapi import APIRouter, HTTPException

from app.models.url import URLDecodeRequest, URLEncodeRequest, URLResponse
from app.services.url_service import decode_url, encode_url

router = APIRouter(prefix="/url", tags=["URL"])


@router.post("/encode", response_model=URLResponse)
async def encode_url_endpoint(request: URLEncodeRequest) -> URLResponse:
    if request.text is None:
        raise HTTPException(status_code=400, detail="Text is required")
    result = encode_url(request.text)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result


@router.post("/decode", response_model=URLResponse)
async def decode_url_endpoint(request: URLDecodeRequest) -> URLResponse:
    if request.text is None:
        raise HTTPException(status_code=400, detail="Text is required")
    result = decode_url(request.text)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result
