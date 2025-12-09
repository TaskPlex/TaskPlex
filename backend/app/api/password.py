"""
API routes for password generator and checker
"""

from fastapi import APIRouter, HTTPException

from app.models.password import (
    PasswordCheckRequest,
    PasswordCheckResponse,
    PasswordGenerateRequest,
    PasswordGenerateResponse,
)
from app.services.password_service import check_password, generate_password

router = APIRouter(prefix="/password", tags=["Password"])


@router.post("/generate", response_model=PasswordGenerateResponse)
async def generate_password_endpoint(request: PasswordGenerateRequest) -> PasswordGenerateResponse:
    if not any(
        [
            request.include_lowercase,
            request.include_uppercase,
            request.include_digits,
            request.include_symbols,
        ]
    ):
        raise HTTPException(status_code=400, detail="At least one character set must be enabled")

    result = generate_password(request)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result


@router.post("/check", response_model=PasswordCheckResponse)
async def check_password_endpoint(request: PasswordCheckRequest) -> PasswordCheckResponse:
    if not request.password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    return check_password(request.password)
