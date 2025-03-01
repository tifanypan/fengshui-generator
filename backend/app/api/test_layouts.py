from fastapi import APIRouter, Depends, HTTPException, Body, Header, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
import os

from app.database.session import get_db
from app.models.room import FloorPlan
from app.services.layout_generator import LayoutGenerator

# Create a dedicated router for test endpoints
router = APIRouter(
    prefix="/api/test/layouts",
    tags=["test"],
)

logger = logging.getLogger(__name__)

# Secret key for test endpoint access (should be in env variables in real app)
# In production, you'd use a more secure approach
TEST_API_KEY = os.environ.get("TEST_API_KEY", "dev_test_key_2025")

def verify_test_api_key(x_api_key: str = Header(None)):
    """Simple API key verification for test endpoints"""
    if not x_api_key or x_api_key != TEST_API_KEY:
        raise HTTPException(
            status_code=403, 
            detail="Invalid API key for test endpoint"
        )
    return True

@router.post("/{floor_plan_id}")
async def test_generate_layouts(
    floor_plan_id: int,
    furniture_selections: Dict[str, Any] = Body(...),
    primary_life_goal: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: bool = Depends(verify_test_api_key)
):
    """
    Test endpoint for generating feng shui layouts without payment requirement.
    This endpoint is for development and testing only.
    
    Args:
        floor_plan_id: ID of the floor plan
        furniture_selections: Dictionary of selected furniture with quantities
        primary_life_goal: Optional life goal to prioritize
        
    Returns:
        Dictionary containing generated layouts and detailed debug information
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
        
        # Add debug information for testing
        debug_info = {
            "test_mode": True,
            "room_dimensions": {
                "width_meters": floor_plan.width,
                "length_meters": floor_plan.height,
                "total_area": (floor_plan.width or 0) * (floor_plan.height or 0)
            },
            "furniture_count": sum(
                item.get("quantity", 0) 
                for item in furniture_selections.get("items", {}).values()
            ),
            "elements_count": len(floor_plan.elements),
            "has_life_goal": primary_life_goal is not None,
            "feng_shui_scores": {
                "optimal": layouts.get("optimal_layout", {}).get("feng_shui_score", 0),
                "space_conscious": layouts.get("space_conscious_layout", {}).get("feng_shui_score", 0),
                "life_goal": layouts.get("life_goal_layout", {}).get("feng_shui_score", 0) if primary_life_goal else None
            }
        }
        
        return {
            "success": True,
            "layouts": layouts,
            "debug_info": debug_info
        }
        
    except Exception as e:
        logger.error(f"Error in test layout generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate test layouts: {str(e)}"
        )

@router.get("/preset-scenarios")
async def get_test_scenarios(
    _: bool = Depends(verify_test_api_key)
):
    """
    Returns a list of preset test scenarios for evaluating the feng shui engine.
    
    Returns:
        List of test scenario configurations
    """
    # Define standard test scenarios for different room types and situations
    scenarios = [
        {
            "name": "Standard Bedroom",
            "room_type": "bedroom",
            "dimensions": {"width": 3.6, "length": 4.2},
            "compass_orientation": "N",
            "furniture": {
                "queen_bed": 1,
                "nightstand": 2,
                "dresser": 1,
                "bookshelf": 1,
                "desk": 0,
                "mirror": 1
            },
            "special_considerations": {}
        },
        {
            "name": "Small Studio",
            "room_type": "studio",
            "dimensions": {"width": 3.0, "length": 4.0},
            "compass_orientation": "E",
            "furniture": {
                "full_bed": 1,
                "nightstand": 1,
                "desk": 1,
                "office_chair": 1,
                "bookshelf": 1,
                "dining_table": 1,
                "sofa_small": 1
            },
            "special_considerations": {
                "smallSpace": True
            },
            "studio_config": {
                "hasSleeping": True,
                "hasWorkspace": True,
                "hasDining": True
            }
        },
        {
            "name": "Accessible Office",
            "room_type": "office",
            "dimensions": {"width": 4.0, "length": 4.5},
            "compass_orientation": "S",
            "furniture": {
                "desk": 1,
                "office_chair": 1,
                "bookshelf": 2,
                "filing_cabinet": 1,
                "plant_large": 1,
                "whiteboard": 1
            },
            "special_considerations": {
                "wheelchair": True
            }
        },
        {
            "name": "Large Living Room",
            "room_type": "living_room",
            "dimensions": {"width": 5.0, "length": 6.5},
            "compass_orientation": "W",
            "furniture": {
                "sofa": 1,
                "lounge_chair": 2,
                "coffee_table": 1,
                "tv_stand": 1,
                "side_table": 2,
                "plant_large": 2,
                "bookcase": 1
            },
            "special_considerations": {
                "pets": True
            }
        },
        {
            "name": "Wealth-Focused Bedroom",
            "room_type": "bedroom",
            "dimensions": {"width": 4.0, "length": 4.8},
            "compass_orientation": "N",
            "furniture": {
                "king_bed": 1,
                "nightstand": 2,
                "dresser": 1,
                "wardrobe": 1,
                "plant_small": 1
            },
            "special_considerations": {},
            "primary_life_goal": "wealth"
        }
    ]
    
    return {
        "success": True,
        "scenarios": scenarios
    }