import os

def test_pdf_info(client, sample_pdf):
    """Test retrieving PDF information"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/info",
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["page_count"] > 0
    assert data["page_count"] == 2

def test_compress_pdf(client, sample_pdf):
    """Test PDF compression"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/compress",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"compression_level": "medium"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "download_url" in data

def test_split_pdf(client, sample_pdf):
    """Test PDF splitting"""
    # Split page 1-1 (returns a ZIP now)
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf/split",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"page_ranges": "1-1"} # Updated param name
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Should return a ZIP file link
    assert data["filename"].endswith(".zip")
    assert "download_url" in data

def test_merge_pdfs(client, sample_pdf):
    """Test merging PDFs"""
    files = [
        ("files", ("test1.pdf", open(sample_pdf, "rb"), "application/pdf")),
        ("files", ("test2.pdf", open(sample_pdf, "rb"), "application/pdf"))
    ]
    
    response = client.post(
        "/api/v1/pdf/merge",
        files=files
    )
    
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
            data={"page_order": "2,1"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
