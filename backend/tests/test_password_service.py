from app.models.password import PasswordGenerateRequest
from app.services.password_service import check_password, generate_password


def test_generate_password_default():
    req = PasswordGenerateRequest()
    res = generate_password(req)
    assert res.success is True
    assert len(res.password) == req.length


def test_generate_password_no_charset():
    req = PasswordGenerateRequest(
        include_lowercase=False,
        include_uppercase=False,
        include_digits=False,
        include_symbols=False,
    )
    res = generate_password(req)
    assert res.success is False
    assert "No character sets" in res.message


def test_generate_password_exclude_ambiguous():
    req = PasswordGenerateRequest(exclude_ambiguous=True, length=50)
    res = generate_password(req)
    ambiguous = {"0", "O", "o", "1", "l", "I"}
    assert not any(ch in ambiguous for ch in res.password)


def test_check_password_strong():
    res = check_password("Th1sIs@VeryStrongPwd123!")
    assert res.success is True
    assert res.strength in {"strong", "medium"}
    assert res.score > 50


def test_check_password_weak_suggestions():
    res = check_password("abc")
    assert res.strength == "weak"
    assert res.suggestions
