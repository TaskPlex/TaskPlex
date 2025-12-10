from app.services.html_validator_service import validate_html


def test_validate_html_success():
    """Valid HTML should be reported as valid with no errors."""
    html = "<div><p>Hello</p><img src='x' /></div>"
    res = validate_html(html)
    assert res.success is True
    assert res.valid is True
    assert res.errors == []


def test_validate_html_unclosed_tag():
    """Unclosed tags should be reported as invalid with errors listed."""
    html = "<div><span>Test</div>"
    res = validate_html(html)
    assert res.success is True
    assert res.valid is False
    assert len(res.errors) >= 1
    assert any("Unclosed tag" in err.message or "Mismatched" in err.message for err in res.errors)


def test_validate_html_empty_input():
    """Empty HTML should return a failure response."""
    res = validate_html("")
    assert res.success is False
    assert res.valid is False
    assert len(res.errors) >= 1
