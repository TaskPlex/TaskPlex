"""
AnyTools API - Main application file
FastAPI application with multi-purpose file processing endpoints
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

from app.api import image, pdf, regex, units, video
from app.config import (
    API_DESCRIPTION,
    API_TITLE,
    API_VERSION,
    DEBUG,
    HOST,
    PORT,
    TEMP_DIR,
)
from app.utils.file_handler import cleanup_temp_files


# Background task for periodic cleanup
async def periodic_cleanup():
    """
    Background task that runs every 5 minutes to clean up old temporary files
    """
    while True:
        await asyncio.sleep(300)  # Wait 5 minutes
        try:
            cleanup_temp_files()
            print("🧹 Periodic cleanup: Old temporary files removed")
        except Exception as e:
            print(f"❌ Error during periodic cleanup: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Clean up any old temp files
    print("🚀 Starting AnyTools API...")
    cleanup_temp_files()
    print("✅ Temporary files cleaned up (files older than 10 minutes removed)")

    # Start background cleanup task
    cleanup_task = asyncio.create_task(periodic_cleanup())
    print("🔄 Periodic cleanup task started (runs every 5 minutes)")

    yield

    # Shutdown: Cancel background task and clean up temp files
    print("🛑 Shutting down AnyTools API...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    cleanup_temp_files()
    print("✅ Cleanup completed")


# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "message": "AnyTools API is running",
        "version": API_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Detailed health check endpoint
    """
    return {
        "status": "healthy",
        "api": "AnyTools",
        "version": API_VERSION,
        "endpoints": {
            "video": "/api/v1/video",
            "image": "/api/v1/image",
            "pdf": "/api/v1/pdf",
            "regex": "/api/v1/regex",
            "units": "/api/v1/units",
        },
    }


# Include routers with /api/v1 prefix
app.include_router(video.router, prefix="/api/v1")
app.include_router(image.router, prefix="/api/v1")
app.include_router(pdf.router, prefix="/api/v1")
app.include_router(regex.router, prefix="/api/v1")
app.include_router(units.router, prefix="/api/v1")


# Download endpoint for processed files
@app.get("/api/v1/download/{filename}", tags=["Download"])
async def download_file(filename: str):
    """
    Download a processed file from temporary storage
    """
    file_path = TEMP_DIR / filename
    if not file_path.exists():
        return JSONResponse(
            status_code=404, content={"success": False, "message": "File not found"}
        )
    return FileResponse(path=file_path, filename=filename, media_type="application/octet-stream")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unexpected errors
    """
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": f"Internal server error: {str(exc)}",
            "path": str(request.url),
        },
    )


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
