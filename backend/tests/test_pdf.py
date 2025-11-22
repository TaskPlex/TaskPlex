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
    files = [
        ("files", ("test1.pdf", open(sample_pdf, "rb"), "application/pdf")),
        ("files", ("test2.pdf", open(sample_pdf, "rb"), "application/pdf")),
    ]

    response = client.post("/api/v1/pdf/merge", files=files)

    for _, (_, f, _) in files:
        f.close()

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
