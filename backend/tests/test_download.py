def test_download_file(client, sample_image):
    """Test file download endpoint"""
    # First create a file via compression to get a valid download URL
    with open(sample_image, "rb") as f:
        response = client.post(
            "/api/v1/image/compress",
            files={"file": ("test_image.png", f, "image/png")},
            data={"quality": 50},
        )

    download_url = response.json()["download_url"]
    # The URL is like /api/v1/download/filename.ext

    # Download it
    response_dl = client.get(download_url)
    assert response_dl.status_code == 200
    assert len(response_dl.content) > 0


def test_download_not_found(client):
    """Test downloading non-existent file"""
    response = client.get("/api/v1/download/non_existent_file_12345.txt")
    assert response.status_code == 404
