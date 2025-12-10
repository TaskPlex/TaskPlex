from typing import List
import uuid

from app.models.uuid_generator import UUIDGenerateResponse


def generate_uuids(version: str = "v4", count: int = 1) -> UUIDGenerateResponse:
    if version != "v4":
        return UUIDGenerateResponse(
            success=False,
            message="Only UUID v4 is supported",
            uuids=[],
        )

    if count < 1 or count > 50:
        return UUIDGenerateResponse(
            success=False,
            message="count must be between 1 and 50",
            uuids=[],
        )

    generated: List[str] = [str(uuid.uuid4()) for _ in range(count)]

    return UUIDGenerateResponse(
        success=True,
        message="UUIDs generated successfully",
        uuids=generated,
    )
