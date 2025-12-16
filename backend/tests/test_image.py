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


def test_create_icon_success(client, sample_image):
    """Test creating an icon from an image"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/to-icon",
            files={"file": ("test_image.png", f, "image/png")},
            data={"size": "256"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"].endswith(".ico")
    assert "download_url" in data
    assert data["dimensions"] == {"width": 256, "height": 256}


def test_create_icon_different_sizes(client, sample_image):
    """Test creating icons with different sizes"""
    for size in [16, 32, 64, 128, 256]:
        with open(sample_image, "rb") as f:
            response = client.post(
                "/api/v1/image/to-icon",
                files={"file": ("test_image.png", f, "image/png")},
                data={"size": str(size)},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["dimensions"] == {"width": size, "height": size}


def test_create_icon_invalid_size_too_small(client, sample_image):
    """Test creating icon with size too small"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/to-icon",
            files={"file": ("test_image.png", f, "image/png")},
            data={"size": "10"},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Icon size must be between" in data.get("detail", "")


def test_create_icon_invalid_size_too_large(client, sample_image):
    """Test creating icon with size too large"""
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/to-icon",
            files={"file": ("test_image.png", f, "image/png")},
            data={"size": "1024"},
        )

    assert response.status_code == 400
    data = response.json()
    assert "Icon size must be between" in data.get("detail", "")


def test_create_icon_invalid_file(client, sample_pdf):
    """Test creating icon with non-image file"""
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/image/to-icon",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"size": "256"},
        )

    assert response.status_code in [400, 422]
