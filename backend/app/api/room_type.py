from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.room import RoomType

router = APIRouter(
    prefix="/api/room-types",
    tags=["room-types"],
)

@router.get("/")
async def get_room_types(db: Session = Depends(get_db)):
    """Get all room types."""
    room_types = db.query(RoomType).all()
    return [{"id": rt.id, "code": rt.code, "name": rt.name} for rt in room_types]

@router.post("/init")
async def initialize_room_types(db: Session = Depends(get_db)):
    """Initialize standard room types (should only be run once)."""
    # Check if room types already exist
    if db.query(RoomType).count() > 0:
        return {"message": "Room types already initialized"}
    
    # ✅ Correctly indented list
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

    # Add room types to database
    for rt in room_types:
        db.add(RoomType(code=rt["code"], name=rt["name"]))
    
    db.commit()
    return {"message": "Room types initialized successfully"}
