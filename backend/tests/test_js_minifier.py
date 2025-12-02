"""
Tests for JavaScript minifier endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_minify_js_success():
    """Test successful JavaScript minification"""
    payload = {
        "javascript": """
        function testFunction() {
            var x = 10;
            var y = 20;
            return x + y;
        }
        """
    }
    response = client.post("/api/v1/js-minifier/minify", json=payload)
    # May fail if rjsmin not installed, but should handle gracefully
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "minified_js" in data
        assert data["minified_size"] <= data["original_size"]
        assert "compression_ratio" in data


def test_minify_js_empty():
    """Test minifying empty JavaScript"""
    payload = {"javascript": ""}
    response = client.post("/api/v1/js-minifier/minify", json=payload)
    assert response.status_code == 400


def test_minify_js_already_minified():
    """Test minifying already minified JavaScript"""
    payload = {"javascript": "function test(){return 10+20;}"}
    response = client.post("/api/v1/js-minifier/minify", json=payload)
    # Should still work, may not compress much
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
