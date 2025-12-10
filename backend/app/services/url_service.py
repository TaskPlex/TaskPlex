import urllib.parse

from app.models.url import URLResponse


def encode_url(text: str) -> URLResponse:
    """
    Encode a full URL or any arbitrary string.
    Use safe="" so that reserved chars like '/' are encoded (expected by users).
    """
    try:
        result = urllib.parse.quote(text, safe="")
        return URLResponse(success=True, message="URL encoded successfully", result=result)
    except Exception as exc:
        return URLResponse(success=False, message=f"Error encoding URL: {exc}", result="")


def decode_url(text: str) -> URLResponse:
    try:
        result = urllib.parse.unquote(text)
        return URLResponse(success=True, message="URL decoded successfully", result=result)
    except Exception as exc:
        return URLResponse(success=False, message=f"Error decoding URL: {exc}", result="")
