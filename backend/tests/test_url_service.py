from app.services.url_service import decode_url, encode_url


def test_encode_url_success():
    res = encode_url("https://example.com/test param")
    assert res.success is True
    assert res.result == "https%3A%2F%2Fexample.com%2Ftest%20param"


def test_decode_url_success():
    res = decode_url("https%3A%2F%2Fexample.com%2Ftest%20param")
    assert res.success is True
    assert "test param" in res.result
