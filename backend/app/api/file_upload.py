# from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
# from sqlalchemy.orm import Session
# from typing import List
# import os

# from app.database.session import get_db
# from app.models.room import FloorPlan, RoomType
# from app.utils.file_validators import validate_upload_file
# from app.services.file_conversion import save_upload_file, get_image_dimensions

# router = APIRouter(
#     prefix="/api/floor-plan",
#     tags=["floor-plan"],
# )

# @router.post("/upload")
# async def upload_floor_plan(
#     file: UploadFile = File(...),
#     room_type: str = Form(...),
#     db: Session = Depends(get_db)
# ):
#     """Upload a floor plan file."""
#     # Validate the file
#     try:
#         await validate_upload_file(file)
#     except HTTPException as e:
#         return {"success": False, "error": e.detail}
    
#     # Check if room type exists
#     room_type_obj = db.query(RoomType).filter(RoomType.code == room_type).first()
#     if not room_type_obj:
#         return {"success": False, "error": f"Invalid room type: {room_type}"}
    
#     # Save the file
#     file_path = await save_upload_file(file)
    
#     # Get dimensions if it's an image
#     width, height = get_image_dimensions(file_path)
    
#     # Create floor plan record
#     new_floor_plan = FloorPlan(
#         room_type_id=room_type_obj.id,
#         file_path=file_path,
#         original_filename=file.filename,
#         file_type=file.content_type,
#         width=width,
#         height=height
#     )
    
#     db.add(new_floor_plan)
#     db.commit()
#     db.refresh(new_floor_plan)
    
#     return {
#         "success": True, 
#         "floor_plan_id": new_floor_plan.id,
#         "room_type": room_type,
#         "filename": file.filename,
#         "dimensions": {"width": width, "height": height}
#     }
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import logging

from app.database.session import get_db
from app.models.room import FloorPlan, RoomType
from app.utils.file_validators import validate_upload_file
from app.services.file_conversion import save_upload_file, get_image_dimensions

# Set up logger
logger = logging.getLogger(__name__)

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
    try:
        # Log upload attempt
        logger.info(f"Upload attempt - Room Type: {room_type}, File: {file.filename}")
        
        # Validate the file
        try:
            await validate_upload_file(file)
        except HTTPException as e:
            logger.warning(f"File validation failed for {file.filename}: {e.detail}")
            return {"success": False, "error": e.detail}
        
        # Get or create the room type
        room_type_obj = get_or_create_room_type(db, room_type)
        
        if not room_type_obj:
            # Try to initialize all room types and try again
            initialize_all_room_types(db)
            room_type_obj = get_or_create_room_type(db, room_type)
            
            if not room_type_obj:
                logger.error(f"Could not create or find room type: {room_type}")
                return {"success": False, "error": f"Invalid room type: {room_type}"}
        
        # Save the file
        file_path = await save_upload_file(file)
        logger.info(f"File saved to {file_path}")
        
        # Get dimensions if it's an image
        width, height = get_image_dimensions(file_path)
        logger.info(f"Image dimensions: {width}x{height}")
        
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
        
        logger.info(f"Floor plan created with ID: {new_floor_plan.id}")
        
        return {
            "success": True, 
            "floor_plan_id": new_floor_plan.id,
            "room_type": room_type,
            "filename": file.filename,
            "dimensions": {"width": width, "height": height}
        }
    except Exception as e:
        logger.error(f"Error in upload_floor_plan: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Server error: {str(e)}"}

def get_or_create_room_type(db: Session, room_type: str) -> Optional[RoomType]:
    """Get or create a room type if it doesn't exist."""
    # First try to get the room type
    room_type_obj = db.query(RoomType).filter(RoomType.code == room_type).first()
    
    # If found, return it
    if room_type_obj:
        logger.info(f"Found existing room type: {room_type}")
        return room_type_obj
    
    # List valid room types for debugging
    valid_types = db.query(RoomType).all()
    valid_codes = [rt.code for rt in valid_types]
    logger.warning(f"Room type not found: {room_type}. Existing types: {valid_codes}")
    
    # Known room types we can auto-create
    valid_room_types = [
        "bedroom", "office", "bedroom_office", "studio", 
        "living_room", "dining_room", "kitchen_dining", "kitchen_dining_living"
    ]
    
    # Auto-create if it's a known type
    if room_type in valid_room_types:
        try:
            # Auto-create the room type
            logger.info(f"Auto-creating room type: {room_type}")
            new_room_type = RoomType(
                code=room_type, 
                name=room_type.replace('_', ' ').title()
            )
            db.add(new_room_type)
            db.commit()
            db.refresh(new_room_type)
            
            logger.info(f"Room type created: {new_room_type.code} (ID: {new_room_type.id})")
            return new_room_type
        except Exception as e:
            logger.error(f"Error creating room type {room_type}: {str(e)}")
            db.rollback()
            return None
    
    # Return None if we couldn't get or create
    return None

def initialize_all_room_types(db: Session):
    """Initialize all standard room types."""
    logger.info("Initializing all room types")
    try:
        # Define all required room types
        room_types = [
            {"code": "bedroom", "name": "Bedroom"},
            {"code": "office", "name": "Office"},
            {"code": "bedroom_office", "name": "Bedroom + Office"},
            {"code": "studio", "name": "Studio"},
            {"code": "living_room", "name": "Living Room"},
            {"code": "dining_room", "name": "Dining Room"},
            {"code": "kitchen_dining", "name": "Kitchen + Dining"},
            {"code": "kitchen_dining_living", "name": "Kitchen + Dining + Living"},
        ]
        
        # Check which ones are missing
        existing_types = db.query(RoomType).all()
        existing_codes = [rt.code for rt in existing_types]
        
        # Add missing types
        added_count = 0
        for rt in room_types:
            if rt["code"] not in existing_codes:
                logger.info(f"Adding missing room type: {rt['code']}")
                db.add(RoomType(code=rt["code"], name=rt["name"]))
                added_count += 1
        
        # Commit if any were added
        if added_count > 0:
            db.commit()
            logger.info(f"Added {added_count} missing room types")
        else:
            logger.info("No new room types needed to be added")
        
        # Log final state for debugging
        final_types = db.query(RoomType).all()
        final_codes = [rt.code for rt in final_types]
        logger.info(f"Room types after initialization: {final_codes}")
        
    except Exception as e:
        logger.error(f"Error initializing room types: {str(e)}")
        db.rollback()