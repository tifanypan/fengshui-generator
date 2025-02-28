import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    # Make sure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:3000"]

settings = Settings()
