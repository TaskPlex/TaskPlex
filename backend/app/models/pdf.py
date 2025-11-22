from typing import List, Optional

from pydantic import BaseModel


class PDFProcessingResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    download_url: Optional[str] = None
    download_urls: Optional[List[str]] = None
    total_pages: Optional[int] = None
    original_size: Optional[int] = None
    processed_size: Optional[int] = None
    filenames: Optional[List[str]] = None


class PDFSplitRequest(BaseModel):
    pages: Optional[str] = None
    page_ranges: Optional[str] = None


class PDFReorganizeRequest(BaseModel):
    page_order: str


class PDFInfoResponse(BaseModel):
    filename: str
    page_count: int
    file_size: int
    encrypted: bool
    metadata: Optional[dict] = None
