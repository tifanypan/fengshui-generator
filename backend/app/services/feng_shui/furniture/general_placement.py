"""
General furniture placement for feng shui.
Fallback placement strategy when specific placement methods fail.
"""
from typing import Dict, List, Any, Optional
import logging
from ..enums import LayoutStrategy
from .utils import filter_available_positions, check_for_bad_placements

logger = logging.getLogger(__name__)


def place_furniture_general(item: Dict[str, Any], layout: Dict[str, Any],
                           strategy: LayoutStrategy, usable_spaces: List[Dict[str, Any]],
                           elements: List[Dict[str, Any]],
                           room_width: float, room_length: float) -> Optional[Dict[str, Any]]:
    """
    General furniture placement method as a fallback.
    Tries to find any suitable location based on room constraints.
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        strategy: Layout strategy
        usable_spaces: List of usable spaces
        elements: Room elements
        room_width: Width of the room
        room_length: Length of the room
        
    Returns:
        Placement data or None if no space available
    """
    # Sort usable spaces by quality and size
    sorted_spaces = sort_usable_spaces(usable_spaces)
    
    # Try to place in each usable space
    for space in sorted_spaces:
        space_x = space.get("x", 0)
        space_y = space.get("y", 0)
        space_width = space.get("width", 0)
        space_height = space.get("height", 0)
        
        # Skip if space is too small for the item
        if space_width < item["width"] or space_height < item["height"]:
            continue
        
        # Try different positions within the space
        positions = generate_positions_in_space(space, item)
        
        # Filter available positions
        available_positions = filter_available_positions(
            positions, item["width"], item["height"], layout, room_width, room_length,
            rotate_if_needed=True
        )
        
        if available_positions:
            # Choose best position
            best_position = available_positions[0]
            rotation = best_position.get("rotation", 0)
            
            # Determine actual width and height based on rotation
            actual_width = item["height"] if rotation == 90 else item["width"]
            actual_height = item["width"] if rotation == 90 else item["height"]
            
            # Create placement
            placement = {
                "item_id": item["id"],
                "base_id": item["base_id"],
                "name": item["name"],
                "x": best_position["x"],
                "y": best_position["y"],
                "width": actual_width,
                "height": actual_height,
                "rotation": rotation,
                "in_command_position": False,
                "against_wall": False,
                "feng_shui_quality": space.get("quality", "poor")  # General placement has lower feng shui quality
            }
            
            # Add a tradeoff note since this is not optimal placement
            tradeoff = {
                "item_id": item["id"],
                "issue": "suboptimal_placement",
                "description": f"{item['name']} couldn't be placed in an ideal feng shui position",
                "severity": "low",
                "mitigation": "Consider element balancing with nearby decor"
            }
            layout["tradeoffs"].append(tradeoff)
            
            # Check for any other bad placements
            tradeoffs = check_for_bad_placements(item, placement, elements)
            layout["tradeoffs"].extend(tradeoffs)
            
            return placement
    
    # If we get here, there's no space for this item
    unplaced_note = {
        "item_id": item["id"],
        "issue": "unable_to_place",
        "description": f"Not enough space to place {item['name']}",
        "severity": "high",
        "mitigation": "Consider removing some furniture or using smaller pieces"
    }
    layout["tradeoffs"].append(unplaced_note)
    
    return None


def sort_usable_spaces(usable_spaces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sort usable spaces by quality and size.
    
    Args:
        usable_spaces: List of usable spaces
        
    Returns:
        Sorted list of usable spaces
    """
    return sorted(
        usable_spaces,
        key=lambda s: (
            {"excellent": 4, "good": 3, "fair": 2, "poor": 1}.get(s.get("quality"), 0),
            s.get("area", 0)
        ),
        reverse=True
    )


def generate_positions_in_space(space: Dict[str, Any], item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate potential positions within a usable space.
    
    Args:
        space: Usable space
        item: Furniture item to place
        
    Returns:
        List of potential position dictionaries
    """
    positions = []
    
    space_x = space.get("x", 0)
    space_y = space.get("y", 0)
    space_width = space.get("width", 0)
    space_height = space.get("height", 0)
    
    # Try corners first
    positions.extend([
        {"x": space_x, "y": space_y, "rotation": 0},  # Top-left
        {"x": space_x + space_width - item["width"], "y": space_y, "rotation": 0},  # Top-right
        {"x": space_x, "y": space_y + space_height - item["height"], "rotation": 0},  # Bottom-left
        {"x": space_x + space_width - item["width"], "y": space_y + space_height - item["height"], "rotation": 0}  # Bottom-right
    ])
    
    # Then try center
    positions.append({
        "x": space_x + (space_width - item["width"]) / 2,
        "y": space_y + (space_height - item["height"]) / 2,
        "rotation": 0
    })
    
    # Now try with rotation if dimensions differ
    if item["width"] != item["height"]:
        if space_width >= item["height"] and space_height >= item["width"]:
            # Try rotated corners
            positions.extend([
                {"x": space_x, "y": space_y, "rotation": 90},  # Top-left rotated
                {"x": space_x + space_width - item["height"], "y": space_y, "rotation": 90},  # Top-right rotated
                {"x": space_x, "y": space_y + space_height - item["width"], "rotation": 90},  # Bottom-left rotated
                {"x": space_x + space_width - item["height"], "y": space_y + space_height - item["width"], "rotation": 90}  # Bottom-right rotated
            ])
            
            # Try rotated center
            positions.append({
                "x": space_x + (space_width - item["height"]) / 2,
                "y": space_y + (space_height - item["width"]) / 2,
                "rotation": 90
            })
    
    return positions


def try_alternative_placement(item: Dict[str, Any], layout: Dict[str, Any],
                            room_width: float, room_length: float) -> Optional[Dict[str, Any]]:
    """
    Try a last-resort placement when all other methods fail.
    Essentially tries to find any valid position in the room.
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        room_width: Width of the room
        room_length: Length of the room
        
    Returns:
        Placement data or None if no space available
    """
    # Create a more sparse grid of positions to try
    grid_step = min(1.0, min(room_width, room_length) / 5)  # Larger step size
    positions = []
    
    # Try with normal orientation
    for x in range(int(room_width / grid_step)):
        for y in range(int(room_length / grid_step)):
            pos_x = x * grid_step
            pos_y = y * grid_step
            
            # Skip positions that would place furniture outside the room
            if pos_x + item["width"] > room_width or pos_y + item["height"] > room_length:
                continue
            
            positions.append({
                "x": pos_x,
                "y": pos_y,
                "rotation": 0,
                "quality": "poor"
            })
    
    # Try with rotation
    if item["width"] != item["height"]:
        for x in range(int(room_width / grid_step)):
            for y in range(int(room_length / grid_step)):
                pos_x = x * grid_step
                pos_y = y * grid_step
                
                # Skip positions that would place furniture outside the room
                if pos_x + item["height"] > room_width or pos_y + item["width"] > room_length:
                    continue
                
                positions.append({
                    "x": pos_x,
                    "y": pos_y,
                    "rotation": 90,
                    "quality": "poor"
                })
    
    # Filter available positions
    available_positions = filter_available_positions(
        positions, item["width"], item["height"], layout, room_width, room_length,
        rotate_if_needed=True
    )
    
    if not available_positions:
        return None
    
    # Get first available position
    pos = available_positions[0]
    rotation = pos.get("rotation", 0)
    
    # Determine actual width and height based on rotation
    actual_width = item["height"] if rotation == 90 else item["width"]
    actual_height = item["width"] if rotation == 90 else item["height"]
    
    # Create placement
    placement = {
        "item_id": item["id"],
        "base_id": item["base_id"],
        "name": item["name"],
        "x": pos["x"],
        "y": pos["y"],
        "width": actual_width,
        "height": actual_height,
        "rotation": rotation,
        "in_command_position": False,
        "against_wall": False,
        "feng_shui_quality": "poor"
    }
    
    # Add a tradeoff note
    tradeoff = {
        "item_id": item["id"],
        "issue": "last_resort_placement",
        "description": f"{item['name']} is placed in a non-optimal location",
        "severity": "medium",
        "mitigation": "Consider a different furniture arrangement or smaller pieces"
    }
    layout["tradeoffs"].append(tradeoff)
    
    return placement