"""
Utility functions for furniture placement.
"""
from typing import Dict, List, Any, Optional, Tuple


def get_furniture_type(furniture_id: str) -> str:
    """
    Determine the general type of furniture from its ID.
    
    Args:
        furniture_id: Furniture ID string
        
    Returns:
        Furniture type string (bed, desk, etc.)
    """
    if "bed" in furniture_id.lower():
        return "bed"
    elif "desk" in furniture_id.lower():
        return "desk"
    elif "table" in furniture_id.lower():
        return "table"
    elif "sofa" in furniture_id.lower() or "chair" in furniture_id.lower():
        return "seating"
    elif "shelf" in furniture_id.lower() or "bookcase" in furniture_id.lower():
        return "storage"
    elif "dresser" in furniture_id.lower() or "chest" in furniture_id.lower():
        return "storage"
    elif "wardrobe" in furniture_id.lower() or "closet" in furniture_id.lower():
        return "storage"
    elif "plant" in furniture_id.lower():
        return "decor"
    elif "lamp" in furniture_id.lower() or "light" in furniture_id.lower():
        return "lighting"
    else:
        return "other"


def filter_available_positions(positions: List[Dict[str, Any]], 
                             width: float, height: float, 
                             layout: Dict[str, Any],
                             room_width: float, room_length: float,
                             rotate_if_needed: bool = False) -> List[Dict[str, Any]]:
    """
    Filter out positions that would cause overlap or violate constraints.
    
    Args:
        positions: List of potential positions
        width: Width of the item to place
        height: Height of the item to place
        layout: Current layout data
        room_width: Width of the room
        room_length: Length of the room
        rotate_if_needed: Whether to try rotation if normal orientation doesn't fit
        
    Returns:
        List of valid positions
    """
    from app.services.feng_shui.geometry_utils import rectangles_overlap
    
    available_positions = []
    
    for pos in positions:
        pos_x = pos["x"]
        pos_y = pos["y"]
        rotation = pos.get("rotation", 0)
        
        # Adjust dimensions if rotated
        actual_width = height if rotation == 90 else width
        actual_height = width if rotation == 90 else height
        
        # Check if position is inside room boundaries
        if pos_x < 0 or pos_y < 0 or pos_x + actual_width > room_width or pos_y + actual_height > room_length:
            # If rotation is allowed, try the other orientation
            if rotate_if_needed and rotation == 0 and width != height:
                # Check if rotated item fits in room
                if not (pos_x < 0 or pos_y < 0 or pos_x + height > room_width or pos_y + width > room_length):
                    # Create a new position with rotation
                    rotated_pos = pos.copy()
                    rotated_pos["rotation"] = 90
                    positions.append(rotated_pos)
            continue
        
        # Check if position overlaps with existing furniture
        overlaps_furniture = False
        for placed_item in layout.get("furniture_placements", []):
            if rectangles_overlap(
                pos_x, pos_y, actual_width, actual_height,
                placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
            ):
                overlaps_furniture = True
                break
        
        if overlaps_furniture:
            continue
        
        # Check if position overlaps with unusable areas
        overlaps_constraint = False
        for constraint in layout.get("constraints", []):
            # Only check unusable area constraints
            if constraint.get("type") == "unusable_area":
                if rectangles_overlap(
                    pos_x, pos_y, actual_width, actual_height,
                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                ):
                    overlaps_constraint = True
                    break
        
        if overlaps_constraint:
            continue
        
        # Position is valid
        available_positions.append(pos)
    
    return available_positions


def choose_best_position(positions: List[Dict[str, Any]], item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Choose the best position from available options, considering feng shui principles.
    
    Args:
        positions: List of available positions
        item: Furniture item to place
        
    Returns:
        Best position data
    """
    # If only one position, return it
    if len(positions) == 1:
        return positions[0]
    
    # Score each position
    scored_positions = []
    
    for pos in positions:
        score = 0
        
        # Base score from position quality
        quality_scores = {"excellent": 10, "good": 8, "fair": 5, "poor": 2}
        score += quality_scores.get(pos.get("quality", "fair"), 5)
        
        # Bonus for positions that have wall support
        if pos.get("wall_side"):
            score += 3
        
        # Bonus for positions in command position
        if pos.get("in_command_position"):
            score += 5
        
        # Penalty for positions that block energy flow
        if pos.get("overlaps_flow"):
            score -= 3
            
        # Bonus for positions with good relationships
        relation_bonus = {
            "bedside": 4, 
            "sofaside": 3, 
            "balance_corner": 3
        }
        score += relation_bonus.get(pos.get("relationship", ""), 0)
            
        # Add randomization for variety
        import random
        score += random.uniform(0, 0.5)
        
        scored_positions.append((pos, score))
    
    # Sort by score and return the best
    scored_positions.sort(key=lambda x: x[1], reverse=True)
    return scored_positions[0][0]


def determine_target_bagua_areas(item: Dict[str, Any], strategy, life_goal: str = None) -> List[str]:
    """
    Determine target bagua areas for an item based on its properties and strategy.
    
    Args:
        item: Furniture item
        strategy: Layout strategy
        life_goal: Optional life goal to prioritize
        
    Returns:
        List of bagua area names to target
    """
    from app.services.feng_shui.enums import LifeGoal
    
    # Default target areas
    target_areas = []
    
    # Get item type
    item_type = get_furniture_type(item["base_id"])
    
    # Assign areas based on item type
    if item_type == "bed":
        target_areas = ["relationships", "health"]
    elif item_type == "desk":
        target_areas = ["knowledge", "career"]
    elif item_type == "lighting":
        target_areas = ["fame", "knowledge"]
    elif item_type == "decor" and "plant" in item["base_id"].lower():
        target_areas = ["wealth", "family", "health"]
    else:
        # General assignment for other types
        target_areas = ["center", "health"]
    
    # If using life goal strategy, prioritize relevant bagua areas
    if life_goal:
        if life_goal == LifeGoal.WEALTH.value:
            target_areas = ["wealth", "fame", "helpful_people"] + target_areas
        elif life_goal == LifeGoal.CAREER.value:
            target_areas = ["career", "knowledge", "helpful_people"] + target_areas
        elif life_goal == LifeGoal.HEALTH.value:
            target_areas = ["center", "family", "health"] + target_areas
        elif life_goal == LifeGoal.RELATIONSHIPS.value:
            target_areas = ["relationships", "family", "center"] + target_areas
    
    return target_areas


def check_for_bad_placements(item: Dict[str, Any], placement: Dict[str, Any], 
                           elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Check for bad feng shui placements and return warnings.
    
    Args:
        item: Furniture item
        placement: Placement data
        elements: Room elements (doors, windows, etc.)
        
    Returns:
        List of tradeoff dictionaries
    """
    from app.services.feng_shui.geometry_utils import rectangles_overlap
    
    tradeoffs = []
    
    # Find all windows
    windows = [e for e in elements if e.get('element_type') == "window"]
    
    # Find all doors
    doors = [e for e in elements if e.get('element_type') == "door"]
    
    # Check if bed is under window (bad feng shui)
    if "bed" in item["base_id"].lower():
        for window in windows:
            if rectangles_overlap(
                placement["x"], placement["y"], placement["width"], placement["height"],
                window.get("x", 0), window.get("y", 0), window.get("width", 0), window.get("height", 0)
            ):
                tradeoffs.append({
                    "item_id": placement["item_id"],
                    "issue": "bed_under_window",
                    "description": "Bed is positioned under a window, which can cause unstable energy",
                    "severity": "high",
                    "mitigation": "If possible, move bed to a position with a solid wall behind it"
                })
                break
    
    # Check for furniture blocking doors
    for door in doors:
        # Check if furniture is in front of or blocking a door
        door_front_area = {
            "x": door.get("x", 0) - 1.0,  # 1m clearance in front of door
            "y": door.get("y", 0) - 1.0,
            "width": door.get("width", 0) + 2.0,
            "height": door.get("height", 0) + 2.0
        }
        
        if rectangles_overlap(
            placement["x"], placement["y"], placement["width"], placement["height"],
            door_front_area["x"], door_front_area["y"], door_front_area["width"], door_front_area["height"]
        ):
            tradeoffs.append({
                "item_id": placement["item_id"],
                "issue": "blocks_door",
                "description": f"{item['name']} may block proper door function or energy flow",
                "severity": "medium",
                "mitigation": "Ensure at least 1m clearance in front of doors"
            })
            break
    
    # Check for desk not in command position
    if "desk" in item["base_id"].lower() and not placement.get("in_command_position", False):
        tradeoffs.append({
            "item_id": placement["item_id"],
            "issue": "desk_not_command",
            "description": "Desk is not in command position, which may reduce productivity",
            "severity": "medium",
            "mitigation": "Try to position desk diagonally across from door with solid wall behind"
        })
    
    return tradeoffs