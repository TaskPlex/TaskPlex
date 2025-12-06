"""
Tests for text formatting endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestTextFormatterEndpoint:
    """Tests for /api/v1/text/format"""

    def test_format_text_success(self):
        payload = {
            "text": "Line1\\nLine2\\n\\nLine3",
        }
        response = client.post("/api/v1/text/format", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["formatted_text"] == "Line1\nLine2\n\nLine3"
        assert data["original_length"] == len(payload["text"])
        assert data["formatted_length"] == len("Line1\nLine2\n\nLine3")

    def test_format_text_without_escapes(self):
        payload = {"text": "No escapes here"}
        response = client.post("/api/v1/text/format", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["formatted_text"] == "No escapes here"

    def test_format_text_missing_text(self):
        response = client.post("/api/v1/text/format", json={})
        assert response.status_code == 422
