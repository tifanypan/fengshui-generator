"""
Bagua mapper for feng shui room analysis.
Maps room to the nine bagua areas based on compass orientation.
"""
from typing import Dict, Any
from app.services.furniture_mapping import BaguaArea  # Import from existing service
from .enums import Direction


def create_bagua_map(room_width: float, room_length: float, compass_orientation: str) -> Dict[str, Dict[str, Any]]:
    """
    Create a bagua map for the room based on compass orientation.
    
    Args:
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        compass_orientation: Compass orientation of the room ("N", "E", "S", "W")
        
    Returns:
        Dictionary mapping bagua areas to their coordinates and attributes
    """
    # Divide room into a 3x3 grid for bagua mapping
    third_width = room_width / 3
    third_length = room_length / 3
    
    # Create bagua sectors based on compass orientation
    # The mapping depends on which direction is at the top of the floor plan
    bagua_sectors = {}
    
    # Default mapping (North orientation - North is at the top of the plan)
    if compass_orientation == Direction.NORTH.value:
        # Row 1 (top)
        bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
        
        # Row 2 (middle)
        bagua_sectors[BaguaArea.FAMILY.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CHILDREN.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
        
        # Row 3 (bottom)
        bagua_sectors[BaguaArea.WEALTH.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.FAME.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.RELATIONSHIPS.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
    
    # East orientation - East is at the top of the plan
    elif compass_orientation == Direction.EAST.value:
        # Rotate the bagua map 90 degrees counterclockwise
        # Row 1 (top)
        bagua_sectors[BaguaArea.FAMILY.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.HEALTH.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.WEALTH.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
        
        # Row 2 (middle)
        bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.FAME.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
        
        # Row 3 (bottom)
        bagua_sectors[BaguaArea.CAREER.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CHILDREN.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
    
    # South orientation - South is at the top of the plan
    elif compass_orientation == Direction.SOUTH.value:
        # Rotate the bagua map 180 degrees
        # Row 1 (top)
        bagua_sectors[BaguaArea.RELATIONSHIPS.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.FAME.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.WEALTH.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
        
        # Row 2 (middle)
        bagua_sectors[BaguaArea.CHILDREN.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.FAMILY.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
        
        # Row 3 (bottom)
        bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
    
    # West orientation - West is at the top of the plan
    elif compass_orientation == Direction.WEST.value:
        # Rotate the bagua map 90 degrees clockwise
        # Row 1 (top)
        bagua_sectors[BaguaArea.CHILDREN.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
        
        # Row 2 (middle)
        bagua_sectors[BaguaArea.FAME.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
        
        # Row 3 (bottom)
        bagua_sectors[BaguaArea.WEALTH.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.HEALTH.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
        bagua_sectors[BaguaArea.FAMILY.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
    
    # Add feng shui element associations to each bagua area
    bagua_elements = {
        BaguaArea.CAREER.value: {"element": "water", "life_area": "career", "colors": ["black", "blue"]},
        BaguaArea.KNOWLEDGE.value: {"element": "earth", "life_area": "wisdom", "colors": ["blue", "green"]},
        BaguaArea.FAMILY.value: {"element": "wood", "life_area": "family", "colors": ["green"]},
        BaguaArea.WEALTH.value: {"element": "wood", "life_area": "prosperity", "colors": ["purple", "green"]},
        BaguaArea.FAME.value: {"element": "fire", "life_area": "reputation", "colors": ["red"]},
        BaguaArea.RELATIONSHIPS.value: {"element": "earth", "life_area": "love", "colors": ["pink", "red", "white"]},
        BaguaArea.CHILDREN.value: {"element": "metal", "life_area": "creativity", "colors": ["white", "grey"]},
        BaguaArea.HELPFUL_PEOPLE.value: {"element": "metal", "life_area": "travel", "colors": ["grey", "white"]},
        BaguaArea.CENTER.value: {"element": "earth", "life_area": "health", "colors": ["yellow", "brown"]}
    }
    
    # Merge coordinates with element information
    for area, coords in bagua_sectors.items():
        if area in bagua_elements:
            bagua_sectors[area].update(bagua_elements[area])
    
    return bagua_sectors


def find_bagua_area_for_position(bagua_map: Dict[str, Dict[str, Any]], x: float, y: float) -> str:
    """
    Find which bagua area a position falls into.
    
    Args:
        bagua_map: The bagua map generated by create_bagua_map
        x, y: Position coordinates
        
    Returns:
        Bagua area name or "unknown" if not found
    """
    for area_name, area in bagua_map.items():
        area_x = area.get("x", 0)
        area_y = area.get("y", 0)
        area_width = area.get("width", 0)
        area_height = area.get("height", 0)
        
        # Check if position is within this area
        if (area_x <= x < area_x + area_width and 
            area_y <= y < area_y + area_height):
            return area_name
    
    return "unknown"


def get_recommended_elements_for_area(bagua_area: str) -> Dict[str, Any]:
    """
    Get recommended feng shui elements for a bagua area.
    
    Args:
        bagua_area: Bagua area name
        
    Returns:
        Dictionary with recommended elements, colors, and materials
    """
    recommendations = {
        BaguaArea.CAREER.value: {
            "elements": ["water"],
            "colors": ["black", "dark blue"],
            "materials": ["glass", "mirror"],
            "shapes": ["wavy", "asymmetric"]
        },
        BaguaArea.KNOWLEDGE.value: {
            "elements": ["earth", "wood"],
            "colors": ["blue", "green", "black"],
            "materials": ["ceramic", "wood"],
            "shapes": ["square", "rectangle"]
        },
        BaguaArea.FAMILY.value: {
            "elements": ["wood"],
            "colors": ["green"],
            "materials": ["wood", "plant"],
            "shapes": ["rectangular", "columnar"]
        },
        BaguaArea.WEALTH.value: {
            "elements": ["wood", "water"],
            "colors": ["purple", "green", "blue"],
            "materials": ["wood", "living plants", "flowing water"],
            "shapes": ["flowing", "lush"]
        },
        BaguaArea.FAME.value: {
            "elements": ["fire"],
            "colors": ["red", "orange", "strong yellow"],
            "materials": ["candles", "lighting", "animal prints"],
            "shapes": ["triangular", "pointed"]
        },
        BaguaArea.RELATIONSHIPS.value: {
            "elements": ["earth", "fire"],
            "colors": ["pink", "red", "white"],
            "materials": ["ceramic", "clay", "candles"],
            "shapes": ["square", "pairs"]
        },
        BaguaArea.CHILDREN.value: {
            "elements": ["metal"],
            "colors": ["white", "pastel"],
            "materials": ["metal", "stone"],
            "shapes": ["round", "oval"]
        },
        BaguaArea.HELPFUL_PEOPLE.value: {
            "elements": ["metal"],
            "colors": ["grey", "white", "metallic"],
            "materials": ["metal", "stone"],
            "shapes": ["round", "circular"]
        },
        BaguaArea.CENTER.value: {
            "elements": ["earth"],
            "colors": ["yellow", "orange", "brown"],
            "materials": ["ceramic", "clay", "stone"],
            "shapes": ["square", "flat"]
        }
    }
    
    return recommendations.get(bagua_area, {
        "elements": [],
        "colors": [],
        "materials": [],
        "shapes": []
    })