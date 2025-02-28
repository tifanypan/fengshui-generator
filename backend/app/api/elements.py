from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.room import FloorPlan
from app.models.element import Element

router = APIRouter(
    prefix="/api/elements",
    tags=["elements"],
)

@router.post("/{floor_plan_id}")
async def save_elements(
    floor_plan_id: int,
    elements: List[Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db)
):
    """Save all elements for a floor plan."""
    # Verify floor plan exists
    floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
    if not floor_plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")
    
    # Delete existing elements
    db.query(Element).filter(Element.floor_plan_id == floor_plan_id).delete()
    
    # Create new elements
    for element_data in elements:
        element = Element(
            floor_plan_id=floor_plan_id,
            element_type=element_data["type"],
            x=element_data["x"],
            y=element_data["y"],
            width=element_data["width"],
            height=element_data["height"],
            rotation=element_data.get("rotation", 0),
            properties=element_data.get("properties", {})
        )
        db.add(element)
    
    db.commit()
    
    return {"success": True, "message": "Elements saved successfully"}

@router.get("/{floor_plan_id}")
async def get_elements(
    floor_plan_id: int,
    db: Session = Depends(get_db)
):
    """Get all elements for a floor plan."""
    # Verify floor plan exists
    floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
    if not floor_plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")
    
    # Get elements
    elements = db.query(Element).filter(Element.floor_plan_id == floor_plan_id).all()
    
    return [
        {
            "id": element.id,
            "type": element.element_type,
            "x": element.x,
            "y": element.y,
            "width": element.width,
            "height": element.height,
            "rotation": element.rotation,
            "properties": element.properties or {}
        }
        for element in elements
    ]