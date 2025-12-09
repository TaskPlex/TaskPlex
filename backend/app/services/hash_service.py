"""
Service utilities for generating hashes
"""

from base64 import b64encode
import hashlib

from app.models.hash import HashResponse


def generate_hash(
    text: str, algorithm: str = "sha256", uppercase: bool = False, salt: str | None = None
) -> HashResponse:
    """Generate hash digests for the given text using the chosen algorithm."""
    try:
        algo = algorithm.lower()
        if algo not in {"md5", "sha1", "sha256", "sha512"}:
            raise ValueError("Unsupported algorithm")

        hasher = hashlib.new(algo)
        payload = f"{salt}{text}" if salt else text
        hasher.update(payload.encode("utf-8"))

        hex_digest = hasher.hexdigest()
        if uppercase:
            hex_digest = hex_digest.upper()

        base64_digest = b64encode(hasher.digest()).decode("ascii")

        return HashResponse(
            success=True,
            message="Hash generated successfully",
            algorithm=algo,  # type: ignore[arg-type]
            hex_digest=hex_digest,
            base64_digest=base64_digest,
            salt_used=salt or None,
        )
    except Exception as exc:
        return HashResponse(
            success=False,
            message=f"Error generating hash: {exc}",
            algorithm=algorithm,
            hex_digest="",
            base64_digest="",
            salt_used=salt or None,
        )
