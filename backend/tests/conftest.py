import shutil
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Ajouter le dossier backend au path pour les imports
sys.path.append(str(Path(__file__).parent.parent))

from app.config import TEMP_DIR
from app.main import app

# Créer un dossier temporaire pour les tests
TEST_ASSETS_DIR = Path(__file__).parent / "assets"
TEST_TEMP_DIR = Path(__file__).parent / "temp"


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Setup test environment: create temp dirs"""
    TEST_ASSETS_DIR.mkdir(exist_ok=True)
    TEST_TEMP_DIR.mkdir(exist_ok=True)

    # S'assurer que le TEMP_DIR de l'app existe aussi
    TEMP_DIR.mkdir(exist_ok=True, parents=True)

    yield

    # Cleanup après tous les tests
    if TEST_TEMP_DIR.exists():
        shutil.rmtree(TEST_TEMP_DIR)


@pytest.fixture
def client():
    """FastAPI Test Client"""
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Create a dummy image for testing"""
    from PIL import Image

    img_path = TEST_TEMP_DIR / "test_image.png"
    img = Image.new("RGB", (100, 100), color="red")
    img.save(img_path)
    return img_path


@pytest.fixture
def sample_pdf():
    """Create a dummy PDF for testing"""
    from reportlab.pdfgen import canvas

    pdf_path = TEST_TEMP_DIR / "test_file.pdf"
    c = canvas.Canvas(str(pdf_path))
    c.drawString(100, 750, "Hello World")
    c.showPage()  # Page 1
    c.drawString(100, 750, "Page 2")
    c.save()
    return pdf_path


# Note: Pour la vidéo, on peut soit avoir un petit fichier dans assets/, soit le générer avec ffmpeg
# Pour l'instant on va simuler ou utiliser un asset si présent
