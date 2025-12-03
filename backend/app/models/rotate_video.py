"""
Rotate video models
"""

from typing import Literal

from pydantic import BaseModel, Field


class RotateVideoRequest(BaseModel):
    """Request model for video rotation"""

    angle: Literal[90, 180, 270] = Field(
        ..., description="Rotation angle in degrees (90, 180, or 270)"
    )
