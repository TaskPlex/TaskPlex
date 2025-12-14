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

from app.api import (
    accent_remover,
    barcode,
    code_formatter,
    code_minifier,
    color,
    css_formatter,
    css_minifier,
    csv_converter,
    gradient_generator,
    hash,
    html_formatter,
    html_minifier,
    html_validator,
    image,
    js_formatter,
    js_minifier,
    js_validator,
    json_data_generator,
    json_formatter,
    json_minifier,
    json_validator,
    lorem_ipsum,
    number_converter,
    palette_generator,
    password,
    pdf,
    py_validator,
    qrcode,
    regex,
    text,
    text_extractor,
    units,
    url_encoder,
    uuid_generator,
    video,
    word_counter,
    xml_formatter,
    xml_minifier,
    xml_validator,
)
from app.api import base64 as base64_api
from app.config import (
    API_DESCRIPTION,
    API_TITLE,
    API_VERSION,
    DEBUG,
    HOST,
    PORT,
    TEMP_DIR,
)
from app.tasks import tasks_router
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
            "word-counter": "/api/v1/word-counter",
            "qrcode": "/api/v1/qrcode",
            "barcode": "/api/v1/barcode",
            "code-formatter": "/api/v1/code-formatter",
            "code-minifier": "/api/v1/code-minifier",
            "html-formatter": "/api/v1/html-formatter",
            "html-validator": "/api/v1/html-validator",
            "html-minifier": "/api/v1/html-minifier",
            "css-formatter": "/api/v1/css-formatter",
            "css-minifier": "/api/v1/css-minifier",
            "js-formatter": "/api/v1/js-formatter",
            "js-minifier": "/api/v1/js-minifier",
            "js-validator": "/api/v1/js-validator",
            "json-formatter": "/api/v1/json-formatter",
            "json-minifier": "/api/v1/json-minifier",
            "json-validator": "/api/v1/json-validator",
            "lorem-ipsum": "/api/v1/lorem-ipsum",
            "xml-formatter": "/api/v1/xml-formatter",
            "xml-minifier": "/api/v1/xml-minifier",
            "xml-validator": "/api/v1/xml-validator",
            "py-validator": "/api/v1/py-validator",
            "text-extractor": "/api/v1/text-extractor",
            "palette-generator": "/api/v1/palette-generator",
            "gradient-generator": "/api/v1/gradient-generator",
        },
    }


# Include routers with /api/v1 prefix
app.include_router(video.router, prefix="/api/v1")
app.include_router(image.router, prefix="/api/v1")
app.include_router(pdf.router, prefix="/api/v1")
app.include_router(regex.router, prefix="/api/v1")
app.include_router(units.router, prefix="/api/v1")
app.include_router(qrcode.router, prefix="/api/v1")
app.include_router(barcode.router, prefix="/api/v1")
app.include_router(code_formatter.router, prefix="/api/v1")
app.include_router(code_minifier.router, prefix="/api/v1")
app.include_router(html_formatter.router, prefix="/api/v1")
app.include_router(html_validator.router, prefix="/api/v1")
app.include_router(html_minifier.router, prefix="/api/v1")
app.include_router(css_formatter.router, prefix="/api/v1")
app.include_router(css_minifier.router, prefix="/api/v1")
app.include_router(js_formatter.router, prefix="/api/v1")
app.include_router(js_minifier.router, prefix="/api/v1")
app.include_router(js_validator.router, prefix="/api/v1")
app.include_router(json_formatter.router, prefix="/api/v1")
app.include_router(json_minifier.router, prefix="/api/v1")
app.include_router(json_validator.router, prefix="/api/v1")
app.include_router(json_data_generator.router, prefix="/api/v1")
app.include_router(lorem_ipsum.router, prefix="/api/v1")
app.include_router(xml_formatter.router, prefix="/api/v1")
app.include_router(xml_minifier.router, prefix="/api/v1")
app.include_router(xml_validator.router, prefix="/api/v1")
app.include_router(py_validator.router, prefix="/api/v1")
app.include_router(text.router, prefix="/api/v1")
app.include_router(text_extractor.router, prefix="/api/v1")
app.include_router(word_counter.router, prefix="/api/v1")
app.include_router(accent_remover.router, prefix="/api/v1")
app.include_router(color.router, prefix="/api/v1")
app.include_router(palette_generator.router, prefix="/api/v1")
app.include_router(gradient_generator.router, prefix="/api/v1")
app.include_router(hash.router, prefix="/api/v1")
app.include_router(password.router, prefix="/api/v1")
app.include_router(url_encoder.router, prefix="/api/v1")
app.include_router(uuid_generator.router, prefix="/api/v1")
app.include_router(number_converter.router, prefix="/api/v1")
app.include_router(base64_api.router, prefix="/api/v1")
app.include_router(csv_converter.router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")


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
