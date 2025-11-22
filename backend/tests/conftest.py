from pathlib import Path
import shutil
import sys

from fastapi.testclient import TestClient
import pytest

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
    # Vérifier que le répertoire existe avant de le supprimer (peut être supprimé par les tests en parallèle)
    try:
        if TEST_TEMP_DIR.exists():
            shutil.rmtree(TEST_TEMP_DIR)
    except (FileNotFoundError, OSError):
        # Le répertoire peut avoir été supprimé par un autre worker en parallèle
        pass


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
    import os

    from reportlab.pdfgen import canvas

    # Ensure temp directory exists
    TEST_TEMP_DIR.mkdir(exist_ok=True, parents=True)

    # Use unique filename for parallel execution (include process ID)
    pid = os.getpid()
    pdf_path = TEST_TEMP_DIR / f"test_file_{pid}.pdf"

    # Remove existing file if it exists (for parallel test execution)
    if pdf_path.exists():
        pdf_path.unlink()

    c = canvas.Canvas(str(pdf_path))
    c.drawString(100, 750, "Hello World")
    c.showPage()  # Page 1
    c.drawString(100, 750, "Page 2")
    c.save()

    # Verify file was created
    assert pdf_path.exists(), f"PDF file was not created at {pdf_path}"
    assert pdf_path.stat().st_size > 0, f"PDF file is empty at {pdf_path}"

    return pdf_path


# Note: Pour la vidéo, on peut soit avoir un petit fichier dans assets/, soit le générer avec ffmpeg
# Pour l'instant on va simuler ou utiliser un asset si présent
