from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from app.database.session import get_db
from app.models.room import FloorPlan, RoomType
from app.utils.file_validators import validate_upload_file
from app.services.file_conversion import save_upload_file, get_image_dimensions

router = APIRouter(
    prefix="/api/floor-plan",
    tags=["floor-plan"],
)

@router.post("/upload")
async def upload_floor_plan(
    file: UploadFile = File(...),
    room_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload a floor plan file."""
    # Validate the file
    try:
        await validate_upload_file(file)
    except HTTPException as e:
        return {"success": False, "error": e.detail}
    
    # Check if room type exists
    room_type_obj = db.query(RoomType).filter(RoomType.code == room_type).first()
    if not room_type_obj:
        return {"success": False, "error": f"Invalid room type: {room_type}"}
    
    # Save the file
    file_path = await save_upload_file(file)
    
    # Get dimensions if it's an image
    width, height = get_image_dimensions(file_path)
    
    # Create floor plan record
    new_floor_plan = FloorPlan(
        room_type_id=room_type_obj.id,
        file_path=file_path,
        original_filename=file.filename,
        file_type=file.content_type,
        width=width,
        height=height
    )
    
    db.add(new_floor_plan)
    db.commit()
    db.refresh(new_floor_plan)
    
    return {
        "success": True, 
        "floor_plan_id": new_floor_plan.id,
        "room_type": room_type,
        "filename": file.filename,
        "dimensions": {"width": width, "height": height}
    }