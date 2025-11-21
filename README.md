# TaskPlex

A powerful, modern, and open-source utility suite for processing Videos, Images, and PDFs. 
Available as a **Web Application** (Docker) and a native **Desktop Application** (Linux/Windows/macOS) powered by Tauri.

![TaskPlex Dashboard](https://placehold.co/1200x600?text=TaskPlex+Dashboard)

## 🚀 Features

### 🎥 Video Tools
- **Compression**: Reduce file size while maintaining quality.
- **Conversion**: Convert between MP4, AVI, MKV, MOV, etc.
- **Preview**: Built-in video player to preview results.

### 🖼️ Image Tools
- **Optimization**: Compress JPG, PNG, WEBP images.
- **Conversion**: Change image formats instantly.
- **Comparison**: Visual Before/After comparison slider.

### 📄 PDF Tools
- **Dashboard**: Specialized dashboard for PDF operations.
- **Merge**: Combine multiple PDFs into one.
- **Split**: Extract pages or split documents.
- **Compress**: Optimize PDF file size.
- **Organize**: Drag & Drop interface to reorder, rotate, or delete pages.

### 🛠️ Utilities (Coming Soon)
- **Regex Tester**: Real-time regular expression testing.
- **Unit Converter**: Convert length, mass, temperature, etc.

---

## 🏗️ Architecture

TaskPlex uses a modern hybrid architecture:

- **Frontend**: React 19, Vite, TailwindCSS v3, TypeScript.
- **Backend**: Python 3.11, FastAPI, FFmpeg, PyMuPDF.
- **Desktop**: Tauri v2 (Sidecar pattern: embeds the Python backend as a binary).
- **Web**: Dockerized environment (Nginx + Uvicorn).

```
.
├── backend/        # FastAPI Application (Python)
├── frontend/       # React Application (Vite + Tauri)
├── scripts/        # Build scripts for Sidecar
├── docker-compose.yml
└── README.md
```

---

## 📦 Installation & Usage

### Option 1: Web Mode (Docker)

Run the full stack in a containerized environment.

```bash
# Start the application
docker-compose up --build
```
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000

### Option 2: Desktop Mode (Tauri)

Run as a native desktop application with the Python backend embedded.

#### Prerequisites
- Node.js 18+
- Rust & Cargo
- Python 3.11+
- **Linux Deps**: `webkit2gtk4.1-devel`, `openssl-devel`, `curl`, `wget`, `file`, `libappindicator-gtk3-devel`, `librsvg2-devel`

#### Development

1. **Build the Python Sidecar**:
   ```bash
   ./scripts/build-backend-linux.sh
   ```

2. **Run in Dev Mode**:
   ```bash
   cd frontend
   npm install
   npm run tauri dev
   ```

#### Build Release (Executable)

Create a standalone executable (`.deb`, `.rpm`, `.AppImage`, `.exe`):

```bash
cd frontend
npm run tauri build
```

The executables will be available in `frontend/src-tauri/target/release/bundle/`.

---

## 🛠️ Tech Stack

- **Language**: TypeScript, Python, Rust
- **UI Framework**: React, TailwindCSS
- **App Framework**: Tauri v2
- **API**: FastAPI
- **Processing**: FFmpeg, Pillow, PyMuPDF (Fitz)

## 📄 License

MIT License - Created by Tangjuyo.
