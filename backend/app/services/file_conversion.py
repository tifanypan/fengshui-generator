import os
import uuid
import shutil
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.config import settings

async def save_upload_file(file: UploadFile) -> str:
    """Save uploaded file to disk and return the path."""
    # Create a unique filename
    filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path

def get_image_dimensions(file_path: str) -> tuple:
    """Get the dimensions of an image file."""
    try:
        with Image.open(file_path) as img:
            return img.size  # Returns (width, height)
    except Exception as e:
        # Not an image or couldn't be opened
        return (0, 0)