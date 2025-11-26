import uvicorn
import os
import sys
import multiprocessing

# Ajout du répertoire courant au path pour que les imports 'app' fonctionnent
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    # Nécessaire pour PyInstaller sur Windows
    multiprocessing.freeze_support()

    # Port configurable via variable d'environnement ou argument (utile pour Tauri)
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    print(f"Starting TaskPlex Backend on port {port}...")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
