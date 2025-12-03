"""
Rotate image models
"""

from typing import Literal

from pydantic import BaseModel, Field


class RotateImageRequest(BaseModel):
    """Request model for image rotation"""

    angle: Literal[90, 180, 270] = Field(
        ..., description="Rotation angle in degrees (90, 180, or 270)"
    )
