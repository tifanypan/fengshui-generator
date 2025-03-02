# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import logging
# import os

# from app.database.models import create_tables
# from app.api import room_type, file_upload, elements, layouts, test_layouts, floor_plan

# app = FastAPI(title="Feng Shui Room Layout Generator API")

# # Configure CORS
# origins = [
#     "http://localhost:3000",  # For local Next.js development
#     "http://localhost:8000",  # For local development
#     "http://localhost",
#     "*",  # For development only - remove in production!
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
# )

# # Create database tables on startup
# @app.on_event("startup")
# def startup_db_client():
#     try:
#         create_tables()
#         logging.info("Database tables created successfully")
#     except Exception as e:
#         logging.error(f"Error creating database tables: {str(e)}")

# # Include API routers
# app.include_router(room_type.router)
# app.include_router(file_upload.router)
# app.include_router(elements.router)
# app.include_router(layouts.router)
# app.include_router(test_layouts.router)
# app.include_router(floor_plan.router)

# @app.get("/")
# def read_root():
#     return {"message": "Feng Shui Room Layout Generator API is running"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

# Import API routers
from app.api import room_type, file_upload, elements, layouts, floor_plan

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Feng Shui Layout Generator API",
    description="API for generating feng shui-optimized room layouts",
    version="1.0.0",
)

# Configure CORS - THIS IS IMPORTANT FOR FRONTEND-BACKEND COMMUNICATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(room_type.router)
app.include_router(file_upload.router)
app.include_router(elements.router)
app.include_router(layouts.router)
app.include_router(floor_plan.router)

# Create base endpoint
@app.get("/")
async def root():
    """Root endpoint for API health check."""
    return {
        "status": "running",
        "message": "Welcome to the Feng Shui Layout Generator API",
        "version": "1.0.0",
    }

# Create uploads directory if it doesn't exist
@app.on_event("startup")
async def startup_event():
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        logger.info(f"Created uploads directory at {uploads_dir}")
    logger.info("Application startup complete")

# Optional - test endpoint for confirming connection
@app.get("/api/test")
async def test_connection():
    """Test endpoint to verify API connection."""
    return {"status": "ok", "message": "Connection successful"}