from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import file_upload, room_type

app = FastAPI(
    title="Feng Shui Room Generator API",
    description="API for generating Feng Shui optimized room layouts",
    version="0.1.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(file_upload.router)
app.include_router(room_type.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Feng Shui Room Generator API"}