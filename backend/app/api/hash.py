"""
API routes for hash generation
"""

from fastapi import APIRouter, HTTPException

from app.models.hash import HashRequest, HashResponse
from app.services.hash_service import generate_hash

router = APIRouter(prefix="/hash", tags=["Hash"])


@router.post("/generate", response_model=HashResponse)
async def generate_hash_endpoint(request: HashRequest) -> HashResponse:
    """
    Generate a hash for the given text using the specified algorithm.
    """
    result = generate_hash(request.text, request.algorithm, request.uppercase, request.salt)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result
