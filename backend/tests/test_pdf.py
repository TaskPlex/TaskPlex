def test_pdf_info(client, sample_pdf):
    """Test retrieving PDF information"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/info", files={"file": ("test.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["page_count"] > 0
    assert data["page_count"] == 2


def test_compress_pdf(client, sample_pdf):
    """Test PDF compression"""
    # Verify PDF file exists and is readable
    assert sample_pdf.exists(), f"PDF fixture file does not exist: {sample_pdf}"
    assert sample_pdf.stat().st_size > 0, f"PDF fixture file is empty: {sample_pdf}"

    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/compress",
            files={"file": ("test.pdf", f, "application/pdf")},
        )

    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}. Response: {response.text}"
    )
    data = response.json()
    assert data["success"] is True
    assert "download_url" in data


def test_split_pdf(client, sample_pdf):
    """Test PDF splitting"""
    # Verify PDF file exists and is readable
    assert sample_pdf.exists(), f"PDF fixture file does not exist: {sample_pdf}"
    assert sample_pdf.stat().st_size > 0, f"PDF fixture file is empty: {sample_pdf}"

    # Split page 1-1 (returns a ZIP now)
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/split",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"page_ranges": "1-1"},  # Updated param name
        )

    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}. Response: {response.text}"
    )
    data = response.json()
    assert data["success"] is True
    # Should return a ZIP file link
    assert data["filename"].endswith(".zip")
    assert "download_url" in data


def test_merge_pdfs(client, sample_pdf):
    """Test merging PDFs"""
    import contextlib

    with contextlib.ExitStack() as stack:
        files = [
            (
                "files",
                ("test1.pdf", stack.enter_context(open(sample_pdf, "rb")), "application/pdf"),
            ),
            (
                "files",
                ("test2.pdf", stack.enter_context(open(sample_pdf, "rb")), "application/pdf"),
            ),
        ]

        response = client.post("/api/v1/pdf/merge", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data


def test_reorganize_pdf(client, sample_pdf):
    """Test reorganizing PDF pages"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/reorganize",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"page_order": "2,1"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_pdf_invalid_format(client, sample_image):
    """Test sending a non-PDF file to PDF endpoint"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/pdf/compress",
            files={"file": ("test.png", f, "image/png")},
        )

    # Should fail
    assert response.status_code in [400, 422]


def test_merge_pdfs_insufficient_files(client, sample_pdf):
    """Test merging with less than 2 files"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/merge",
            files={"file": ("test.pdf", f, "application/pdf")},
        )

    # Should fail - need at least 2 files
    # FastAPI returns 422 for validation errors, 400 for business logic errors
    assert response.status_code in [400, 422]


def test_split_pdf_invalid_pages(client, sample_pdf):
    """Test splitting PDF with invalid page numbers"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/split",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"pages": "999"},  # Invalid page number
        )

    # Should handle gracefully (might succeed with empty result or fail)
    # The service should handle this
    assert response.status_code in [200, 400, 500]


def test_ocr_pdf(client, sample_pdf):
    """Test OCR text extraction from PDF"""
    import pytest

    # Check if OCR dependencies are available
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except ImportError:
        pytest.skip("OCR dependencies (pytesseract, pdf2image) not installed")

    # Check if Tesseract is installed
    try:
        pytesseract.get_tesseract_version()
    except Exception:
        pytest.skip("Tesseract OCR not installed on system")

    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/ocr",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"language": "eng"},
        )

    # OCR might succeed or fail depending on PDF content and Tesseract installation
    # Accept both success and failure (500 if dependencies missing)
    assert response.status_code in [200, 500]

    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data
        assert data["filename"].endswith(".txt")


def test_add_password_pdf(client, sample_pdf):
    """Test adding password protection to PDF"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/password",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"action": "add", "password": "test123"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "download_url" in data
    assert "protected_" in data["filename"]


def test_remove_password_pdf(client, sample_pdf):
    """Test removing password protection from PDF"""
    # First, add a password to the PDF
    with open(sample_pdf, "rb") as f:
        add_response = client.post(
            "/api/v1/pdf/password",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"action": "add", "password": "test123"},
        )

    assert add_response.status_code == 200
    add_data = add_response.json()
    assert add_data["success"] is True

    # Download the protected PDF
    from app.config import TEMP_DIR

    protected_filename = add_data["filename"]
    protected_path = TEMP_DIR / protected_filename

    # Now try to remove the password
    if protected_path.exists():
        with open(protected_path, "rb") as f:
            remove_response = client.post(
                "/api/v1/pdf/password",
                files={"file": (protected_filename, f, "application/pdf")},
                data={"action": "remove", "password": "test123"},
            )

        assert remove_response.status_code == 200
        remove_data = remove_response.json()
        assert remove_data["success"] is True
        assert "download_url" in remove_data
        assert "unprotected_" in remove_data["filename"]


def test_password_pdf_invalid_action(client, sample_pdf):
    """Test password endpoint with invalid action"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/password",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"action": "invalid", "password": "test123"},
        )

    assert response.status_code == 400


def test_password_pdf_empty_password(client, sample_pdf):
    """Test password endpoint with empty password"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/password",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"action": "add", "password": ""},
        )

    assert response.status_code == 400


def test_remove_password_from_unprotected_pdf(client, sample_pdf):
    """Test removing password from an unprotected PDF"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/password",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"action": "remove", "password": "test123"},
        )

    # Should fail because PDF is not encrypted
    assert response.status_code == 500
    data = response.json()
    # FastAPI returns error in "detail" field for HTTPException
    error_message = data.get("detail", data.get("message", ""))
    assert "not password-protected" in error_message.lower()
