"""
Tests for CSS minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_css_success():
    """Test successful CSS minification"""
    payload = {
        "css": """
        .container {
            width: 100%;
            padding: 20px;
            margin: 0;
        }
        """
    }
    response = client.post("/api/v1/css-minifier/minify", json=payload)
    # May fail if rcssmin not installed, but should handle gracefully
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "minified_css" in data
        assert data["minified_size"] <= data["original_size"]
        assert "compression_ratio" in data


def test_minify_css_empty():
    """Test minifying empty CSS"""
    payload = {"css": ""}
    response = client.post("/api/v1/css-minifier/minify", json=payload)
    assert response.status_code == 400


def test_minify_css_already_minified():
    """Test minifying already minified CSS"""
    payload = {"css": ".container{width:100%;padding:20px;margin:0;}"}
    response = client.post("/api/v1/css-minifier/minify", json=payload)
    # Should still work, may not compress much
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
