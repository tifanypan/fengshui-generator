from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from typing import List, Dict

from app.database.session import get_db
from app.models.room import RoomType

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/room-types",
    tags=["room-types"],
)

@router.get("/")
async def get_room_types(db: Session = Depends(get_db)):
    """Get all room types."""
    try:
        room_types = db.query(RoomType).all()
        logger.info(f"Retrieved {len(room_types)} room types")
        return [{"id": rt.id, "code": rt.code, "name": rt.name} for rt in room_types]
    except Exception as e:
        logger.error(f"Error getting room types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/init")
async def initialize_room_types(db: Session = Depends(get_db)):
    """Initialize standard room types (should only be run once)."""
    try:
        # Check if room types already exist
        existing_types = db.query(RoomType).all()
        existing_codes = [rt.code for rt in existing_types]
        
        logger.info(f"Found {len(existing_types)} existing room types: {existing_codes}")
        
        # Define all required room types
        required_room_types = [
            {"code": "bedroom", "name": "Bedroom"},
            {"code": "office", "name": "Office"},
            {"code": "bedroom_office", "name": "Bedroom + Office"},
            {"code": "studio", "name": "Studio"},
            {"code": "living_room", "name": "Living Room"},
            {"code": "dining_room", "name": "Dining Room"},
            {"code": "kitchen_dining", "name": "Kitchen + Dining"},
            {"code": "kitchen_dining_living", "name": "Kitchen + Dining + Living"},
        ]

        # Check which ones need to be added
        added_count = 0
        for rt in required_room_types:
            if rt["code"] not in existing_codes:
                logger.info(f"Adding missing room type: {rt['code']}")
                db.add(RoomType(code=rt["code"], name=rt["name"]))
                added_count += 1
        
        # Commit if any were added
        if added_count > 0:
            db.commit()
            logger.info(f"Added {added_count} missing room types")
        
        # Log final state
        final_types = db.query(RoomType).all()
        final_codes = [rt.code for rt in final_types]
        logger.info(f"Final room types: {final_codes}")
        
        return {
            "message": f"Room types initialized successfully. Added {added_count} new types.",
            "existing_types": len(existing_types),
            "added_types": added_count,
            "total_types": len(final_types),
            "types": final_codes
        }
    
    except Exception as e:
        logger.error(f"Error initializing room types: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{code}")
async def get_room_type_by_code(code: str, db: Session = Depends(get_db)):
    """Get a specific room type by code."""
    try:
        room_type = db.query(RoomType).filter(RoomType.code == code).first()
        if not room_type:
            logger.warning(f"Room type not found: {code}")
            return {"success": False, "error": f"Room type not found: {code}"}
        
        logger.info(f"Found room type: {room_type.code}")
        return {"success": True, "room_type": {"id": room_type.id, "code": room_type.code, "name": room_type.name}}
    except Exception as e:
        logger.error(f"Error getting room type {code}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Add debugging endpoint
@router.get("/debug/list")
async def debug_list_room_types(db: Session = Depends(get_db)):
    """Debug endpoint to list all room types with detailed information."""
    try:
        room_types = db.query(RoomType).all()
        result = []
        
        for rt in room_types:
            result.append({
                "id": rt.id,
                "code": rt.code,
                "name": rt.name,
                "table": rt.__tablename__,
                "attributes": dir(rt)
            })
        
        return {
            "count": len(result),
            "room_types": result,
            "table_name": RoomType.__tablename__
        }
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}", exc_info=True)
        return {"error": str(e), "traceback": str(e.__traceback__)}