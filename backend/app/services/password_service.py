import math
import secrets
import string
from typing import Tuple

from app.models.password import (
    PasswordCheckResponse,
    PasswordGenerateRequest,
    PasswordGenerateResponse,
)

AMBIGUOUS = {"0", "O", "o", "1", "l", "I"}


def _build_charset(req: PasswordGenerateRequest) -> str:
    charset = ""
    if req.include_lowercase:
        charset += string.ascii_lowercase
    if req.include_uppercase:
        charset += string.ascii_uppercase
    if req.include_digits:
        charset += string.digits
    if req.include_symbols:
        charset += "!@#$%^&*()-_=+[]{};:,.?/\\|`~"

    if req.exclude_ambiguous:
        charset = "".join(ch for ch in charset if ch not in AMBIGUOUS)
    return charset


def generate_password(req: PasswordGenerateRequest) -> PasswordGenerateResponse:
    charset = _build_charset(req)

    if not charset:
        return PasswordGenerateResponse(
            success=False,
            message="No character sets selected",
            password="",
        )

    password = "".join(secrets.choice(charset) for _ in range(req.length))

    return PasswordGenerateResponse(
        success=True,
        message="Password generated successfully",
        password=password,
    )


def _entropy(password: str, charset_size: int) -> float:
    if not password or charset_size <= 1:
        return 0.0
    return round(len(password) * math.log2(charset_size), 2)


def _analyze_charset(password: str) -> Tuple[bool, bool, bool, bool, int]:
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    symbols = "!@#$%^&*()-_=+[]{};:,.?/\\|`~"
    has_symbol = any(c in symbols for c in password)

    charset_size = 0
    if has_lower:
        charset_size += 26
    if has_upper:
        charset_size += 26
    if has_digit:
        charset_size += 10
    if has_symbol:
        charset_size += len(symbols)

    return has_lower, has_upper, has_digit, has_symbol, charset_size


def check_password(password: str) -> PasswordCheckResponse:
    has_lower, has_upper, has_digit, has_symbol, charset_size = _analyze_charset(password)
    length = len(password)

    # Simple scoring heuristic
    score = 0
    score += min(length * 4, 40)  # length contribution
    variety = sum([has_lower, has_upper, has_digit, has_symbol])
    score += variety * 15  # up to 60
    score = min(score, 100)

    suggestions = []
    if length < 12:
        suggestions.append("Use at least 12 characters.")
    if not has_lower:
        suggestions.append("Add lowercase letters.")
    if not has_upper:
        suggestions.append("Add uppercase letters.")
    if not has_digit:
        suggestions.append("Add digits.")
    if not has_symbol:
        suggestions.append("Add symbols for more complexity.")

    if score >= 80:
        strength = "strong"
    elif score >= 50:
        strength = "medium"
    else:
        strength = "weak"

    entropy_bits = _entropy(password, charset_size)

    return PasswordCheckResponse(
        success=True,
        message="Password analyzed successfully",
        score=score,
        strength=strength,
        length=length,
        has_lowercase=has_lower,
        has_uppercase=has_upper,
        has_digits=has_digit,
        has_symbols=has_symbol,
        suggestions=suggestions,
        entropy=entropy_bits,
    )
