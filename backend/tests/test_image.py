def test_compress_image(client, sample_image):
    """Test image compression endpoint"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/compress",
            files={"file": ("test_image.png", f, "image/png")},
            data={"quality": 50},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "download_url" in data
    assert "compression_ratio" in data


def test_convert_image(client, sample_image):
    """Test image conversion endpoint"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/convert",
            files={"file": ("test_image.png", f, "image/png")},
            data={"output_format": "jpg", "quality": 80},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"].endswith(".jpg")
    assert "download_url" in data


def test_invalid_image_format(client, sample_pdf):
    """Test sending a non-image file to image endpoint"""
    # Sending a PDF instead of an image
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/image/compress",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"quality": 50},
        )

    # Should fail (400 or 422 depending on validation, let's check 400 for logic error)
    assert response.status_code in [400, 422]


def test_convert_image_invalid_output_format(client, sample_image):
    """Test image conversion with invalid output format"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/convert",
            files={"file": ("test_image.png", f, "image/png")},
            data={"output_format": "invalid_format", "quality": 80},
        )

    # Should fail due to invalid output format
    assert response.status_code == 400
