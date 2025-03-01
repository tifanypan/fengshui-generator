from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging

from app.database.session import get_db
from app.models.room import FloorPlan
from app.services.layout_generator import LayoutGenerator

router = APIRouter(
    prefix="/api/layouts",
    tags=["layouts"],
)

logger = logging.getLogger(__name__)

@router.post("/{floor_plan_id}")
async def generate_layouts(
    floor_plan_id: int,
    furniture_selections: Dict[str, Any] = Body(...),
    primary_life_goal: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Generate feng shui layouts for a floor plan with the provided furniture selections.
    
    Args:
        floor_plan_id: ID of the floor plan
        furniture_selections: Dictionary of selected furniture with quantities
        primary_life_goal: Optional life goal to prioritize (premium feature)
        
    Returns:
        Dictionary containing generated layouts
    """
    try:
        # Verify floor plan exists
        floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
        if not floor_plan:
            raise HTTPException(status_code=404, detail="Floor plan not found")
        
        # Get room data
        room_data = {
            "dimensions": {
                "width": floor_plan.width or 0,
                "length": floor_plan.height or 0,  # Using height as length
                "unit": "meters"
            },
            "compass": {
                "orientation": floor_plan.compass_orientation or "N"
            },
            "roomType": floor_plan.room_type.code if floor_plan.room_type else None,
            "file_path": floor_plan.file_path,
            "file_type": floor_plan.file_type,
            "occupants": [
                {
                    "gender": occupant.gender,
                    "birth_year": occupant.birth_year,
                    "birth_month": occupant.birth_month,
                    "birth_day": occupant.birth_day,
                    "is_primary": occupant.is_primary,
                    "kua_number": occupant.kua_number
                }
                for occupant in floor_plan.occupants
            ],
            "elements": [
                {
                    "element_type": element.element_type,
                    "x": element.x,
                    "y": element.y,
                    "width": element.width,
                    "height": element.height,
                    "rotation": element.rotation,
                    "properties": element.properties or {}
                }
                for element in floor_plan.elements
            ],
            "furniture": furniture_selections
        }
        
        # Generate layouts
        layout_generator = LayoutGenerator()
        layouts = layout_generator.generate_layouts(
            room_data=room_data,
            furniture_selections=furniture_selections,
            primary_life_goal=primary_life_goal
        )
        
        return {
            "success": True,
            "layouts": layouts
        }
        
    except Exception as e:
        logger.error(f"Error generating layouts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate layouts: {str(e)}"
        )

@router.get("/{floor_plan_id}/recommendations")
async def get_feng_shui_recommendations(
    floor_plan_id: int,
    db: Session = Depends(get_db)
):
    """
    Get feng shui recommendations for a floor plan without generating full layouts.
    
    Args:
        floor_plan_id: ID of the floor plan
        
    Returns:
        Dictionary containing feng shui recommendations
    """
    try:
        # Verify floor plan exists
        floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
        if not floor_plan:
            raise HTTPException(status_code=404, detail="Floor plan not found")
        
        # Get room type and generate basic recommendations
        room_type = floor_plan.room_type.code if floor_plan.room_type else None
        
        # Generate basic recommendations based on room type
        recommendations = []
        
        if room_type == "bedroom":
            recommendations.extend([
                {
                    "type": "general",
                    "category": "sleep",
                    "title": "Optimal sleep environment",
                    "description": "For better sleep quality, consider using soft, calming colors like blue, green, or lavender. Avoid electronics near the bed and use blackout curtains.",
                    "importance": "high"
                },
                {
                    "type": "placement",
                    "category": "bed_placement",
                    "title": "Ideal bed placement",
                    "description": "Place your bed in the command position (diagonally across from the door, but not directly in line with it) with a solid wall behind it for stability and support.",
                    "importance": "high"
                }
            ])
        elif room_type == "office":
            recommendations.extend([
                {
                    "type": "general",
                    "category": "productivity",
                    "title": "Enhance productivity",
                    "description": "Place inspiring artwork at eye level and use task lighting to improve focus. Keep the desk clear of clutter for better energy flow.",
                    "importance": "high"
                },
                {
                    "type": "placement",
                    "category": "desk_placement",
                    "title": "Ideal desk placement",
                    "description": "Position your desk in the command position with a view of the door but not directly in line with it. Ensure your back is to a solid wall for support.",
                    "importance": "high"
                }
            ])
        elif room_type == "living_room":
            recommendations.extend([
                {
                    "type": "general",
                    "category": "energy_flow",
                    "title": "Improve energy flow",
                    "description": "Arrange seating to encourage conversation. Use rounded corners on furniture when possible to create better energy flow.",
                    "importance": "medium"
                },
                {
                    "type": "placement",
                    "category": "sofa_placement",
                    "title": "Ideal sofa placement",
                    "description": "Place the main sofa against a solid wall for stability. Arrange seating in a way that allows everyone to see each other easily for better communication.",
                    "importance": "high"
                }
            ])
        
        # Add general recommendations for all room types
        recommendations.extend([
            {
                "type": "enhancement",
                "category": "decluttering",
                "title": "Maintain clear energy with decluttering",
                "description": "Regularly clear clutter to maintain positive energy flow. Keep pathways open and organize storage to prevent energy stagnation.",
                "importance": "high"
            },
            {
                "type": "enhancement",
                "category": "lighting",
                "title": "Optimize lighting for energy balance",
                "description": "Use layered lighting with a mix of overhead, task, and accent lights. Natural light is best during the day, with warm lighting in the evening for better rest.",
                "importance": "medium"
            },
            {
                "type": "enhancement",
                "category": "plants",
                "title": "Add living plants for positive energy",
                "description": "Incorporate healthy plants to improve air quality and add vibrant energy. Place them in areas that need activation or to soften sharp corners.",
                "importance": "medium"
            }
        ])
        
        return {
            "success": True,
            "recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )