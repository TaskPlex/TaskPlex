from pydantic import BaseModel, Field


class URLEncodeRequest(BaseModel):
    text: str = Field(..., description="Text to URL-encode")


class URLDecodeRequest(BaseModel):
    text: str = Field(..., description="URL-encoded text to decode")


class URLResponse(BaseModel):
    success: bool
    message: str
    result: str
