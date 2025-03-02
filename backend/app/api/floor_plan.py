from fastapi import APIRouter, Depends, HTTPException, Body, Header, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging

from app.database.session import get_db
from app.models.room import FloorPlan, Occupant
from app.models.element import Element

router = APIRouter(
    prefix="/api/floor-plan",
    tags=["floor-plan"],
)

@router.put("/{floor_plan_id}/compass")
async def update_compass_orientation(
    floor_plan_id: int,
    orientation: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Update compass orientation for a floor plan."""
    # Verify floor plan exists
    floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
    if not floor_plan:
        return {"success": False, "error": "Floor plan not found"}
    
    # Validate orientation
    valid_orientations = ["North", "East", "South", "West", "N", "E", "S", "W"]
    if orientation not in valid_orientations:
        return {"success": False, "error": f"Invalid orientation: {orientation}. Must be one of: {valid_orientations}"}
    
    # Update orientation
    floor_plan.compass_orientation = orientation
    db.commit()
    
    return {"success": True, "orientation": orientation}


@router.post("/{floor_plan_id}/occupants")
async def store_occupant_details(
    floor_plan_id: int,
    occupants: List[Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db)
):
    """Store occupant details for feng shui calculations."""
    # Verify floor plan exists
    floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
    if not floor_plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")
    
    # Delete existing occupants
    db.query(Occupant).filter(Occupant.floor_plan_id == floor_plan_id).delete()
    
    # Create new occupants
    for occupant_data in occupants:
        occupant = Occupant(
            floor_plan_id=floor_plan_id,
            birth_year=occupant_data.get("birthYear"),
            birth_month=occupant_data.get("birthMonth"),
            birth_day=occupant_data.get("birthDay"),
            gender=occupant_data.get("gender"),
            is_primary=occupant_data.get("primary", False),
            kua_number=occupant_data.get("kua_number")  # This will be calculated later if not provided
        )
        db.add(occupant)
    
    db.commit()
    
    return {"success": True, "message": "Occupant details stored successfully"}