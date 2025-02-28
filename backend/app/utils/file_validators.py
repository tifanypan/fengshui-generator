import os
import filetype
import magic
from fastapi import UploadFile, HTTPException
from typing import List, Set

# Allowed MIME types and file extensions
ALLOWED_MIME_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/heic': ['.heic'],
    'image/svg+xml': ['.svg'],
    'image/vnd.dxf': ['.dxf'],
}

# Max file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate that the file has an allowed extension."""
    file_ext = os.path.splitext(filename.lower())[1]
    return file_ext in allowed_extensions

def validate_mime_type(file_content: bytes) -> str:
    """Validate and return the MIME type of the file."""
    mime = magic.Magic(mime=True)
    detected_mime = mime.from_buffer(file_content)
    
    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {detected_mime}. Allowed types: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )
    
    return detected_mime

def validate_file_size(file_size: int) -> bool:
    """Validate that the file size is within limits."""
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    return True

async def validate_upload_file(file: UploadFile) -> bool:
    """Validate uploaded file (type, size, extension)."""
    # Read a portion of the file for MIME type detection
    file_content = await file.read(2048)
    
    # Reset file cursor position after reading
    await file.seek(0)
    
    # Get file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    # Reset file cursor position again
    await file.seek(0)
    
    # Validate file size
    validate_file_size(file_size)
    
    # Validate MIME type
    mime_type = validate_mime_type(content)
    
    # Validate file extension
    if not validate_file_extension(file.filename, ALLOWED_MIME_TYPES[mime_type]):
        raise HTTPException(
            status_code=400,
            detail=f"File extension doesn't match its content. Expected: {ALLOWED_MIME_TYPES[mime_type]}"
        )
    
    return True