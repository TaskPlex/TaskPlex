"""
API routes for UUID generation
"""

from fastapi import APIRouter, HTTPException

from app.models.uuid_generator import UUIDGenerateRequest, UUIDGenerateResponse
from app.services.uuid_service import generate_uuids

router = APIRouter(prefix="/uuid", tags=["UUID"])


@router.post("/generate", response_model=UUIDGenerateResponse)
async def generate_uuid_endpoint(request: UUIDGenerateRequest) -> UUIDGenerateResponse:
    result = generate_uuids(version=request.version, count=request.count)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result
