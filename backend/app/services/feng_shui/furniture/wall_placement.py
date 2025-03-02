"""
Wall placement for furniture.
Handles placement of furniture that should be against walls.
"""
from typing import Dict, List, Any, Optional
import logging
from ..enums import LayoutStrategy, KuaGroup
from .utils import filter_available_positions, choose_best_position, check_for_bad_placements

logger = logging.getLogger(__name__)


def place_against_wall(item: Dict[str, Any], layout: Dict[str, Any],
                     strategy: LayoutStrategy, walls: List[Dict[str, Any]],
                     elements: List[Dict[str, Any]],
                     room_width: float, room_length: float,
                     kua_group: Optional[KuaGroup] = None) -> Optional[Dict[str, Any]]:
    """
    Place furniture that should be against a wall (bookcases, dressers, etc.).
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        strategy: Layout strategy
        walls: List of wall elements
        elements: Room elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        kua_group: Optional kua group for directional preferences
        
    Returns:
        Placement data or None if no suitable position found
    """
    # Create virtual walls if none are defined
    processed_walls = process_walls(walls, room_width, room_length)
    
    # Get potential positions along walls
    wall_positions = generate_wall_positions(processed_walls, item)
    
    # Filter out positions that would overlap with existing furniture or room constraints
    available_positions = filter_available_positions(
        wall_positions, item["width"], item["height"], layout, room_width, room_length
    )
    
    # Try with rotated furniture if no positions found
    if not available_positions:
        rotated_positions = generate_rotated_wall_positions(processed_walls, item)
        
        # Filter rotated positions
        rotated_available = filter_available_positions(
            rotated_positions, 
            item["height"],  # Swap dimensions for rotation
            item["width"],   # Swap dimensions for rotation
            layout,
            room_width,
            room_length
        )
        
        available_positions = rotated_available
    
    # If still no positions, return None
    if not available_positions:
        return None
    
    # Choose best position considering kua direction if available
    best_position = choose_best_position(available_positions, item)
    
    # Get actual width and height based on rotation
    actual_width = item["height"] if best_position["rotation"] == 90 else item["width"]
    actual_height = item["width"] if best_position["rotation"] == 90 else item["height"]
    
    # Create placement data
    placement = {
        "item_id": item["id"],
        "base_id": item["base_id"],
        "name": item["name"],
        "x": best_position["x"],
        "y": best_position["y"],
        "width": actual_width,
        "height": actual_height,
        "rotation": best_position["rotation"],
        "in_command_position": False,
        "against_wall": True,
        "feng_shui_quality": best_position.get("quality", "good"),
        "wall_side": best_position.get("wall_side")
    }
    
    # Check for any bad placements
    tradeoffs = check_for_bad_placements(item, placement, elements)
    layout["tradeoffs"].extend(tradeoffs)
    
    return placement


def process_walls(walls: List[Dict[str, Any]], room_width: float, room_length: float) -> List[Dict[str, Any]]:
    """
    Process walls to standardize format and create virtual walls if needed.
    
    Args:
        walls: List of wall elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        
    Returns:
        List of processed wall dictionaries
    """
    if not walls:
        # If no walls defined, use room boundaries as walls
        wall_thickness = 0.2  # 20cm wall thickness
        
        return [
            # North wall
            {"x": 0, "y": 0, "width": room_width, "height": wall_thickness, "orientation": "horizontal"},
            # East wall
            {"x": room_width - wall_thickness, "y": 0, "width": wall_thickness, "height": room_length, "orientation": "vertical"},
            # South wall
            {"x": 0, "y": room_length - wall_thickness, "width": room_width, "height": wall_thickness, "orientation": "horizontal"},
            # West wall
            {"x": 0, "y": 0, "width": wall_thickness, "height": room_length, "orientation": "vertical"}
        ]
    else:
        # Use defined walls and calculate their orientation
        processed_walls = []
        for wall in walls:
            # Determine if wall is horizontal or vertical
            orientation = "horizontal" if wall.get("width", 0) > wall.get("height", 0) else "vertical"
            processed_walls.append({
                "x": wall.get("x", 0),
                "y": wall.get("y", 0),
                "width": wall.get("width", 0),
                "height": wall.get("height", 0),
                "orientation": orientation
            })
        return processed_walls


def generate_wall_positions(walls: List[Dict[str, Any]], item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate potential positions along walls.
    
    Args:
        walls: List of wall elements
        item: Furniture item to place
        
    Returns:
        List of potential position dictionaries
    """
    wall_positions = []
    
    for wall in walls:
        wall_x = wall.get("x", 0)
        wall_y = wall.get("y", 0)
        wall_width = wall.get("width", 0)
        wall_height = wall.get("height", 0)
        is_horizontal = wall.get("orientation") == "horizontal"
        
        # Different logic for horizontal vs vertical walls
        if is_horizontal:
            # For horizontal walls (north/south walls)
            # Try several positions along the wall
            step_size = 0.5  # Try positions every 0.5 meter
            max_steps = max(3, int(wall_width / step_size))  # At least 3 positions to try
            
            for step in range(max_steps):
                pos_x = wall_x + (step * wall_width / max_steps)
                
                # Adjust for wall thickness
                if wall_y < 1:  # North wall
                    pos_y = wall_y + wall_height
                else:  # South wall
                    pos_y = wall_y - item["height"]
                
                wall_positions.append({
                    "x": pos_x,
                    "y": pos_y,
                    "rotation": 0,
                    "quality": "good",
                    "wall_side": "north" if wall_y < 1 else "south"
                })
        else:
            # For vertical walls (east/west walls)
            step_size = 0.5  # Try positions every 0.5 meter
            max_steps = max(3, int(wall_height / step_size))  # At least 3 positions to try
            
            for step in range(max_steps):
                pos_y = wall_y + (step * wall_height / max_steps)
                
                # Adjust for wall thickness
                if wall_x < 1:  # West wall
                    pos_x = wall_x + wall_width
                else:  # East wall
                    pos_x = wall_x - item["width"]
                
                wall_positions.append({
                    "x": pos_x,
                    "y": pos_y,
                    "rotation": 0,
                    "quality": "good",
                    "wall_side": "west" if wall_x < 1 else "east"
                })
    
    return wall_positions


def generate_rotated_wall_positions(walls: List[Dict[str, Any]], item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate potential positions along walls with rotated furniture.
    
    Args:
        walls: List of wall elements
        item: Furniture item to place
        
    Returns:
        List of potential position dictionaries with rotation
    """
    rotated_positions = []
    
    # Swap width and height for the item when rotated
    rotated_width = item["height"]
    rotated_height = item["width"]
    
    for wall in walls:
        wall_x = wall.get("x", 0)
        wall_y = wall.get("y", 0)
        wall_width = wall.get("width", 0)
        wall_height = wall.get("height", 0)
        is_horizontal = wall.get("orientation") == "horizontal"
        
        # Different logic for horizontal vs vertical walls
        if is_horizontal:
            # Try positions along the horizontal wall
            step_size = 0.5
            max_steps = max(3, int(wall_width / step_size))
            
            for step in range(max_steps):
                pos_x = wall_x + (step * wall_width / max_steps)
                
                # Adjust for wall thickness
                if wall_y < 1:  # North wall
                    pos_y = wall_y + wall_height
                else:  # South wall
                    pos_y = wall_y - rotated_height
                
                rotated_positions.append({
                    "x": pos_x,
                    "y": pos_y,
                    "rotation": 90,  # 90 degree rotation
                    "quality": "good",
                    "wall_side": "north" if wall_y < 1 else "south"
                })
        else:
            # Try positions along the vertical wall
            step_size = 0.5
            max_steps = max(3, int(wall_height / step_size))
            
            for step in range(max_steps):
                pos_y = wall_y + (step * wall_height / max_steps)
                
                # Adjust for wall thickness
                if wall_x < 1:  # West wall
                    pos_x = wall_x + wall_width
                else:  # East wall
                    pos_x = wall_x - rotated_width
                
                rotated_positions.append({
                    "x": pos_x,
                    "y": pos_y,
                    "rotation": 90,  # 90 degree rotation
                    "quality": "good",
                    "wall_side": "west" if wall_x < 1 else "east"
                })
    
    return rotated_positions


def evaluate_wall_position_quality(position: Dict[str, Any], 
                                 kua_group: Optional[KuaGroup]) -> str:
    """
    Evaluate the feng shui quality of a wall position.
    
    Args:
        position: Wall position
        kua_group: Optional kua group for directional preferences
        
    Returns:
        Quality rating ("excellent", "good", "fair", "poor")
    """
    # Default quality
    quality = "good"
    
    # Check if position has a good wall side
    wall_side = position.get("wall_side", "")
    
    # If we have kua group information, check alignment with favorable directions
    if kua_group:
        from ..kua_calculator import get_favorable_directions
        
        favorable_directions = get_favorable_directions(kua_group)
        
        # Map wall sides to directions
        wall_to_direction = {
            "north": "N",
            "east": "E", 
            "south": "S",
            "west": "W"
        }
        
        direction = wall_to_direction.get(wall_side, "")
        
        if direction in favorable_directions.get("favorable", []):
            quality = "excellent"
        elif direction in favorable_directions.get("unfavorable", []):
            quality = "fair"
    
    return quality