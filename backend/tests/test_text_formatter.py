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


class TestColorConverterEndpoint:
    """Tests for /api/v1/color/convert"""

    def test_convert_color_from_hex(self):
        payload = {"color": "#ff3366"}
        response = client.post("/api/v1/color/convert", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["input_format"] == "hex"
        assert data["formats"]["hex"].lower() == "#ff3366"
        assert data["formats"]["rgb"].startswith("rgb(")
        assert data["formats"]["hsl"].startswith("hsl(")
        assert data["formats"]["cmyk"].startswith("cmyk(")

    def test_convert_color_from_hsl(self):
        payload = {"color": "hsl(210, 50%, 40%)"}
        response = client.post("/api/v1/color/convert", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["input_format"] == "hsl"
        assert data["formats"]["hex"].startswith("#")
        assert 0 <= data["components"]["r"] <= 255
        assert 0 <= data["components"]["g"] <= 255
        assert 0 <= data["components"]["b"] <= 255

    def test_convert_color_invalid_input(self):
        response = client.post("/api/v1/color/convert", json={"color": "invalid"})
        assert response.status_code == 400
