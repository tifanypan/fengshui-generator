# import os
# from pydantic_settings import BaseSettings
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# class Settings(BaseSettings):
#     DEBUG: bool = os.getenv("DEBUG", "False") == "True"
#     DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
#     UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
#     # Make sure upload directory exists
#     os.makedirs(UPLOAD_DIR, exist_ok=True)
    
#     # CORS settings
#     CORS_ORIGINS: list = ["http://localhost:3000"]

# settings = Settings()


# import os
# from pydantic_settings import BaseSettings
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# class Settings(BaseSettings):
#     DEBUG: bool = os.getenv("DEBUG", "False") == "True"
#     DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
#     UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
#     # Make sure upload directory exists
#     os.makedirs(UPLOAD_DIR, exist_ok=True)
    
#     # CORS settings
#     CORS_ORIGINS: list = ["http://localhost:3000"]

# settings = Settings()

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database settings - using SQLite by default
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/feng_shui.db")

# File uploads
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

# CORS settings (in case we need them here as well)
CORS_ORIGINS = [
    "http://localhost:3000",  # Default Next.js port
    "http://localhost:8000",  # Backend URL
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    # Add production URLs in actual deployment
]

# API settings
API_TITLE = "Feng Shui Layout Generator API"
API_DESCRIPTION = "API for generating feng shui-optimized room layouts"
API_VERSION = "1.0.0"

# Application settings
DEBUG = True  # Set to False in production
ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/heic': ['.heic'],
    'image/svg+xml': ['.svg'],
    'image/vnd.dxf': ['.dxf'],
}

# Create settings class to make it easier to access from other modules
class Settings:
    """Settings class for application configuration."""
    DATABASE_URL = DATABASE_URL
    UPLOAD_DIR = UPLOAD_DIR
    MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE
    CORS_ORIGINS = CORS_ORIGINS
    API_TITLE = API_TITLE
    API_DESCRIPTION = API_DESCRIPTION
    API_VERSION = API_VERSION
    DEBUG = DEBUG
    ALLOWED_FILE_TYPES = ALLOWED_FILE_TYPES

# Create settings instance
settings = Settings()