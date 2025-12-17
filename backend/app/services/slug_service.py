"""
Slug generator service
"""

import re
import unicodedata

from app.models.slug import SlugRequest, SlugResponse


def generate_slug(request: SlugRequest) -> SlugResponse:
    """
    Generate a URL-friendly slug from text

    Args:
        request: SlugRequest with text to process

    Returns:
        SlugResponse with generated slug

    The slug generation process:
    1. Normalize to NFD (decomposed form) to separate base characters from accents
    2. Remove combining characters (accents, diacritics)
    3. Convert to lowercase
    4. Replace spaces and special characters with hyphens
    5. Remove non-ASCII characters
    6. Clean up multiple consecutive hyphens
    7. Remove leading/trailing hyphens
    """
    if not request.text or not request.text.strip():
        return SlugResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        original_text = request.text

        # Step 1: Normalize to NFD (decomposed form) to separate base characters from accents
        normalized = unicodedata.normalize("NFD", original_text)

        # Step 2: Remove combining characters (accents, diacritics)
        # Characters with category "Mn" (Nonspacing Mark) are accents
        no_accents = "".join(char for char in normalized if unicodedata.category(char) != "Mn")

        # Step 3: Convert to lowercase
        slug = no_accents.lower()

        # Handle special case: German eszett (ß) -> ss
        # This must be done before removing non-ASCII characters
        # This is not a combining character, so it needs special handling
        if "ß" in slug:
            slug = slug.replace("ß", "ss")

        # Step 4: Replace spaces and special characters with hyphens
        # Keep only alphanumeric characters, spaces, and hyphens
        slug = re.sub(r"[^\w\s-]", "", slug)

        # Step 5: Replace spaces and underscores with hyphens
        slug = re.sub(r"[\s_]+", "-", slug)

        # Step 6: Remove non-ASCII characters (anything not in [a-z0-9-])
        slug = re.sub(r"[^a-z0-9-]", "", slug)

        # Step 7: Clean up multiple consecutive hyphens
        slug = re.sub(r"-+", "-", slug)

        # Step 8: Remove leading and trailing hyphens
        slug = slug.strip("-")

        # If slug is empty after processing, return a default
        if not slug:
            slug = "slug"

        return SlugResponse(
            success=True,
            message="Slug generated successfully",
            original_text=original_text,
            slug=slug,
        )

    except Exception as e:
        return SlugResponse(
            success=False,
            message=f"Error generating slug: {str(e)}",
        )
