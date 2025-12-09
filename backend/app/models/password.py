from typing import List

from pydantic import BaseModel, Field


class PasswordGenerateRequest(BaseModel):
    length: int = Field(default=16, ge=4, le=128, description="Password length")
    include_lowercase: bool = Field(default=True)
    include_uppercase: bool = Field(default=True)
    include_digits: bool = Field(default=True)
    include_symbols: bool = Field(default=True)
    exclude_ambiguous: bool = Field(default=False)


class PasswordGenerateResponse(BaseModel):
    success: bool
    message: str
    password: str


class PasswordCheckRequest(BaseModel):
    password: str = Field(..., min_length=1)


class PasswordCheckResponse(BaseModel):
    success: bool
    message: str
    score: int = Field(ge=0, le=100)
    strength: str
    length: int
    has_lowercase: bool
    has_uppercase: bool
    has_digits: bool
    has_symbols: bool
    suggestions: List[str] = []
    entropy: float
