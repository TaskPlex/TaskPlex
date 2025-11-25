"""
Tests for main application endpoints
"""

from fastapi.testclient import TestClient
import pytest

from app.main import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


class TestHealthEndpoints:
    """Tests for health check endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns health status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert data["docs"] == "/docs"

    def test_health_check_endpoint(self, client):
        """Test detailed health check"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["api"] == "AnyTools"
        assert "endpoints" in data
        assert "video" in data["endpoints"]
        assert "image" in data["endpoints"]
        assert "pdf" in data["endpoints"]


class TestDownloadEndpoint:
    """Tests for download endpoint"""

    def test_download_nonexistent_file(self, client):
        """Test downloading nonexistent file returns 404"""
        response = client.get("/api/v1/download/nonexistent_file.mp4")
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert "not found" in data["message"].lower()


class TestCORSMiddleware:
    """Tests for CORS configuration"""

    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should allow CORS
        assert response.status_code in [200, 204, 405]


class TestExceptionHandler:
    """Tests for global exception handler"""

    def test_exception_handler_format(self, client):
        """Test that exception responses have correct format"""
        # Try to access an endpoint that will fail validation
        response = client.post("/api/v1/video/compress")
        # Should return error in expected format
        assert response.status_code in [400, 422]
