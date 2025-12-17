"""
Service utilities for generating hashes
"""

from base64 import b64encode
import hashlib
from pathlib import Path

from app.models.hash import FileHashResponse, HashResponse
from app.utils.file_handler import get_file_size


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


def hash_file(
    file_path: Path, algorithm: str = "sha256", uppercase: bool = False
) -> FileHashResponse:
    """
    Generate hash digests for a file using the chosen algorithm.

    Args:
        file_path: Path to the file to hash
        algorithm: Hash algorithm to use (md5, sha1, sha256, sha512)
        uppercase: Return hex digest in uppercase

    Returns:
        FileHashResponse with hash results
    """
    try:
        algo = algorithm.lower()
        if algo not in {"md5", "sha1", "sha256", "sha512"}:
            return FileHashResponse(
                success=False,
                message=f"Unsupported algorithm: {algorithm}. Supported: md5, sha1, sha256, sha512",
                filename=file_path.name if file_path else "",
                algorithm=algorithm,
                hex_digest="",
                base64_digest="",
            )

        # Get file size
        file_size = get_file_size(file_path)

        # Create hasher
        hasher = hashlib.new(algo)

        # Read file in chunks to handle large files efficiently
        with open(file_path, "rb") as f:
            # Read file in 64KB chunks
            while chunk := f.read(65536):
                hasher.update(chunk)

        # Get digests
        hex_digest = hasher.hexdigest()
        if uppercase:
            hex_digest = hex_digest.upper()

        base64_digest = b64encode(hasher.digest()).decode("ascii")

        return FileHashResponse(
            success=True,
            message=f"File hash generated successfully using {algo.upper()}",
            filename=file_path.name,
            algorithm=algo,  # type: ignore[arg-type]
            hex_digest=hex_digest,
            base64_digest=base64_digest,
            file_size=file_size,
        )
    except FileNotFoundError:
        return FileHashResponse(
            success=False,
            message="File not found",
            filename=file_path.name if file_path else "",
            algorithm=algorithm,
            hex_digest="",
            base64_digest="",
        )
    except PermissionError:
        return FileHashResponse(
            success=False,
            message="Permission denied: Cannot read file",
            filename=file_path.name if file_path else "",
            algorithm=algorithm,
            hex_digest="",
            base64_digest="",
        )
    except Exception as exc:
        return FileHashResponse(
            success=False,
            message=f"Error generating file hash: {str(exc)}",
            filename=file_path.name if file_path else "",
            algorithm=algorithm,
            hex_digest="",
            base64_digest="",
        )
