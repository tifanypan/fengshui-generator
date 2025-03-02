"""
Command position placement for furniture.
Handles placement of beds, desks, and other furniture that benefit from command position.
"""
from typing import Dict, List, Any, Optional
import logging
from ..enums import KuaGroup
from .utils import get_furniture_type, filter_available_positions, check_for_bad_placements

logger = logging.getLogger(__name__)


def place_in_command_position(item: Dict[str, Any], layout: Dict[str, Any],
                            command_positions: List[Dict[str, Any]], elements: List[Dict[str, Any]],
                            kua_group: Optional[KuaGroup] = None) -> Optional[Dict[str, Any]]:
    """
    Place furniture that requires a command position (bed, desk).
    Command position: can see the door but not directly in line with it,
    with solid wall support behind.
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        command_positions: List of command positions
        elements: Room elements (doors, windows, etc.)
        kua_group: Optional kua group for directional preferences
        
    Returns:
        Placement data or None if no suitable position found
    """
    # Check if we have any command positions
    if not command_positions:
        return None
    
    # Filter by furniture type if needed (beds vs. desks)
    suitable_positions = filter_suitable_positions(command_positions, item)
    
    # If no suitable positions, use any command position
    if not suitable_positions and command_positions:
        suitable_positions = command_positions
    
    # Sort positions by quality
    suitable_positions = sort_command_positions(suitable_positions)
    
    # Try each position until we find one that works
    for position in suitable_positions:
        # Check if position is already occupied
        if is_position_occupied(position, item, layout):
            continue
            
        # Check for bad feng shui placements (e.g., bed under window)
        has_bad_placement = check_bad_placement(position, item, elements)
        
        # If it's a bad placement, skip this position
        if has_bad_placement:
            continue
            
        # Position fits! Create placement data
        placement = create_command_placement(position, item, kua_group)
        
        # Add notes about missing wall support
        if not position.get("has_wall_behind", False):
            tradeoff = {
                "item_id": item["id"],
                "issue": "no_wall_behind",
                "description": f"{item['name']} is not against a solid wall",
                "severity": "medium",
                "mitigation": "Add a solid headboard or tall furniture behind it"
            }
            layout["tradeoffs"].append(tradeoff)
        
        # Check for any additional bad placements
        tradeoffs = check_for_bad_placements(item, placement, elements)
        layout["tradeoffs"].extend(tradeoffs)
        
        return placement
    
    # If we get here, no suitable position was found
    return None


def filter_suitable_positions(command_positions: List[Dict[str, Any]], 
                            item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Filter command positions by furniture type.
    
    Args:
        command_positions: List of command positions
        item: Furniture item to place
        
    Returns:
        List of suitable command positions
    """
    suitable_positions = []
    item_type = get_furniture_type(item["base_id"])
    
    for pos in command_positions:
        suitable_for = pos.get("suitable_for", ["bed", "desk"])
        
        if item_type in suitable_for or "any" in suitable_for:
            suitable_positions.append(pos)
    
    return suitable_positions


def sort_command_positions(positions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sort command positions by quality.
    
    Args:
        positions: List of command positions
        
    Returns:
        Sorted list of command positions
    """
    # Sort by quality (excellent, good, fair, poor)
    quality_values = {"excellent": 4, "good": 3, "fair": 2, "poor": 1}
    
    return sorted(
        positions,
        key=lambda p: (
            quality_values.get(p.get("quality"), 0),
            1 if p.get("has_wall_behind", False) else 0
        ),
        reverse=True
    )


def is_position_occupied(position: Dict[str, Any], item: Dict[str, Any], 
                       layout: Dict[str, Any]) -> bool:
    """
    Check if a position is already occupied by furniture.
    
    Args:
        position: Command position to check
        item: Furniture item to place
        layout: Current layout data
        
    Returns:
        True if position is occupied, False otherwise
    """
    from app.services.feng_shui.geometry_utils import position_overlaps
    
    # Calculate item position (centered on command position)
    pos_x = position["x"] - item["width"] / 2
    pos_y = position["y"] - item["height"] / 2
    
    # Check against all placed items
    for placed_item in layout.get("furniture_placements", []):
        if position_overlaps(
            pos_x, pos_y, item["width"], item["height"],
            placed_item
        ):
            return True
    
    return False


def check_bad_placement(position: Dict[str, Any], item: Dict[str, Any], 
                      elements: List[Dict[str, Any]]) -> bool:
    """
    Check if a placement would create bad feng shui.
    
    Args:
        position: Command position to check
        item: Furniture item to place
        elements: Room elements
        
    Returns:
        True if placement is bad, False otherwise
    """
    from app.services.feng_shui.geometry_utils import rectangles_overlap
    
    # Calculate item position (centered on command position)
    pos_x = position["x"] - item["width"] / 2
    pos_y = position["y"] - item["height"] / 2
    
    # For beds, check if position is under a window (bad feng shui)
    if "bed" in item["base_id"].lower():
        windows = [e for e in elements if e.get('element_type') == "window"]
        
        for window in windows:
            if rectangles_overlap(
                pos_x, pos_y, item["width"], item["height"],
                window.get("x", 0), window.get("y", 0), window.get("width", 0), window.get("height", 0)
            ):
                return True
    
    return False


def create_command_placement(position: Dict[str, Any], item: Dict[str, Any], 
                           kua_group: Optional[KuaGroup]) -> Dict[str, Any]:
    """
    Create placement data for an item in a command position.
    
    Args:
        position: Command position
        item: Furniture item to place
        kua_group: Optional kua group for directional preferences
        
    Returns:
        Placement data dictionary
    """
    # Calculate position (centered on command position)
    x_position = position["x"] - item["width"] / 2
    y_position = position["y"] - item["height"] / 2
    
    # Determine optimal rotation based on kua number if available
    rotation = 0
    if kua_group and "bed" in item["base_id"].lower():
        # In a full implementation, use kua direction rotation function
        # This is simplified for now
        rotation = 0
    
    # Create placement
    return {
        "item_id": item["id"],
        "base_id": item["base_id"],
        "name": item["name"],
        "x": x_position,
        "y": y_position,
        "width": item["width"],
        "height": item["height"],
        "rotation": rotation,
        "in_command_position": True,
        "against_wall": position.get("has_wall_behind", False),
        "feng_shui_quality": position.get("quality", "fair")
    }