from pathlib import Path
import sys

from fastapi.testclient import TestClient
import pytest

# Add backend folder to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from app.config import TEMP_DIR
from app.main import app

# Assets directory for test fixtures
TEST_ASSETS_DIR = Path(__file__).parent / "assets"


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Setup test environment: create necessary directories"""
    TEST_ASSETS_DIR.mkdir(exist_ok=True)

    # Ensure the app's TEMP_DIR exists
    TEMP_DIR.mkdir(exist_ok=True, parents=True)

    yield

    # No cleanup needed - pytest's tmp_path handles temporary files automatically


@pytest.fixture
def client():
    """FastAPI Test Client"""
    return TestClient(app)


@pytest.fixture
def sample_image(tmp_path):
    """Create a dummy image for testing

    Uses pytest's tmp_path fixture for isolation in parallel tests.
    """
    from PIL import Image

    img_path = tmp_path / "test_image.png"
    img = Image.new("RGB", (100, 100), color="red")
    img.save(img_path)
    return img_path


@pytest.fixture
def sample_pdf(tmp_path):
    """Create a dummy PDF for testing

    Uses pytest's tmp_path fixture which provides a unique temporary directory
    per test, avoiding race conditions in parallel test execution.
    """
    import fitz  # PyMuPDF

    pdf_path = tmp_path / "test_file.pdf"
    doc = fitz.open()  # Create new PDF

    # Add first page
    page = doc.new_page()
    page.insert_text((50, 50), "Hello World")

    # Add second page
    page = doc.new_page()
    page.insert_text((50, 50), "Page 2")

    doc.save(pdf_path)
    doc.close()

    # Verify file was created
    assert pdf_path.exists(), f"PDF file was not created at {pdf_path}"
    assert pdf_path.stat().st_size > 0, f"PDF file is empty at {pdf_path}"

    return pdf_path


# Note: Pour la vidéo, on peut soit avoir un petit fichier dans assets/, soit le générer avec ffmpeg
# Pour l'instant on va simuler ou utiliser un asset si présent
