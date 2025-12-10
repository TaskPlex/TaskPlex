from pydantic import BaseModel, Field


class UUIDGenerateRequest(BaseModel):
    version: str = Field(default="v4", description="UUID version (only v4 supported)")
    count: int = Field(default=1, ge=1, le=50, description="Number of UUIDs to generate (1-50)")


class UUIDGenerateResponse(BaseModel):
    success: bool
    message: str
    uuids: list[str]
