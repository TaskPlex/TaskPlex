# Script de build pour le backend Python sous Windows

Write-Host "🚧 Building TaskPlex Backend for Windows..."

# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel temporaire
python -m venv venv_build
.\venv_build\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt
pip install pyinstaller

# Nettoyer les builds précédents
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }

# Compiler avec PyInstaller
# Note: Pour Windows, il faut faire attention aux hidden imports et au format de sortie
pyinstaller --clean --noconfirm --onefile --name taskplex-backend `
    --hidden-import=uvicorn.loops.auto `
    --hidden-import=uvicorn.loops.asyncio `
    --hidden-import=uvicorn.protocols.http.auto `
    --hidden-import=uvicorn.protocols.http.h11 `
    --hidden-import=uvicorn.lifespan.on `
    --hidden-import=app.api.video `
    --hidden-import=app.api.image `
    --hidden-import=app.api.pdf `
    --hidden-import=app.api.regex `
    --hidden-import=app.api.units `
    --hidden-import=multipart `
    --collect-all=ffmpeg_python `
    run.py

Write-Host "✅ Build finished."

# Déplacer l'exécutable vers src-tauri/binaries
# Format cible : <nom>-<target-triple>.exe
# Sur Windows x64 : taskplex-backend-x86_64-pc-windows-msvc.exe

$TargetTriple = "x86_64-pc-windows-msvc"
$BinaryName = "taskplex-backend.exe"
$DestDir = "../frontend/src-tauri/binaries"
$DestFile = "$DestDir/taskplex-backend-$TargetTriple.exe"

if (-not (Test-Path $DestDir)) { New-Item -ItemType Directory -Force -Path $DestDir }

Move-Item -Force "dist/$BinaryName" $DestFile

Write-Host "✅ Binary moved to $DestFile"

Write-Host "🎉 Backend ready for Tauri!"
