"""
Models for hash generation
"""

from pydantic import BaseModel, Field


class HashRequest(BaseModel):
    """Request payload for hash generation"""

    text: str = Field(..., min_length=1, description="Plain text to hash")
    algorithm: str = Field("sha256", description="Hash algorithm to use")
    uppercase: bool = Field(False, description="Return hex digest in uppercase")
    salt: str | None = Field(
        None, description="Optional salt concatenated before the text prior to hashing"
    )


class HashResponse(BaseModel):
    """Response payload for hash generation"""

    success: bool
    message: str
    algorithm: str
    hex_digest: str
    base64_digest: str
    salt_used: str | None = None


class FileHashResponse(BaseModel):
    """Response payload for file hash generation"""

    success: bool
    message: str
    filename: str = ""
    algorithm: str
    hex_digest: str
    base64_digest: str
    file_size: int | None = None
