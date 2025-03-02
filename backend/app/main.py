from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from app.api import room_type, file_upload, elements, layouts, test_layouts
from app.database.models import create_tables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Create app
app = FastAPI(
    title="Feng Shui Room Generator API",
    description="API for generating feng shui-optimized room layouts",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost",
    os.environ.get("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(room_type.router)
app.include_router(file_upload.router)
app.include_router(elements.router)
app.include_router(layouts.router)

# Include test routes (these would be disabled in production)
if os.environ.get("ENVIRONMENT", "development") != "production":
    app.include_router(test_layouts.router)

# Create database tables on startup
@app.on_event("startup")
def startup_event():
    create_tables()

@app.get("/")
async def root():
    return {"message": "Feng Shui Room Generator API is running"}