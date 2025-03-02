"""
Usable spaces analysis for feng shui room planning.
Identifies areas suitable for furniture placement.
"""
from typing import Dict, List, Any
import logging
from .enums import ConstraintType
from app.services.feng_shui.geometry_utils import rectangles_overlap

logger = logging.getLogger(__name__)


def identify_usable_spaces(room_width: float, room_length: float, 
                           constraints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify usable spaces for furniture placement based on constraints.
    
    Args:
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        constraints: List of constraint dictionaries
        
    Returns:
        List of dictionaries containing usable space coordinates and attributes
    """
    # Start with the entire room as usable
    usable_spaces = [{
        "x": 0,
        "y": 0,
        "width": room_width,
        "height": room_length,
        "area": room_width * room_length,
        "quality": "excellent"  # Default quality
    }]
    
    # Remove unusable areas by splitting spaces
    for constraint in constraints:
        if constraint["type"] == ConstraintType.UNUSABLE_AREA.value:
            # For each unusable area, split existing usable spaces if they overlap
            new_usable_spaces = []
            for space in usable_spaces:
                # Check if constraint overlaps with this space
                if rectangles_overlap(
                    space["x"], space["y"], space["width"], space["height"],
                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                ):
                    # Split this space and add the resulting spaces
                    split_spaces = split_space_around_constraint(space, constraint)
                    new_usable_spaces.extend(split_spaces)
                else:
                    # No overlap, keep this space as is
                    new_usable_spaces.append(space)
            
            usable_spaces = new_usable_spaces
    
    # Evaluate quality of each space based on size and traffic flow
    for space in usable_spaces:
        # Calculate area
        space["area"] = space["width"] * space["height"]
        
        # Evaluate quality based on size - these thresholds could be adjusted
        if space["area"] < 1.0:  # Less than 1 square meter
            space["quality"] = "poor"
        elif space["area"] < 2.0:  # 1-2 square meters
            space["quality"] = "fair"
        elif space["area"] < 4.0:  # 2-4 square meters
            space["quality"] = "good"
        else:  # 4+ square meters
            space["quality"] = "excellent"
        
        # Check if space is affected by traffic flow constraints
        for constraint in constraints:
            if constraint["type"] == ConstraintType.TRAFFIC_FLOW.value:
                if rectangles_overlap(
                    space["x"], space["y"], space["width"], space["height"],
                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                ):
                    # Downgrade quality if in traffic flow
                    if space["quality"] == "excellent":
                        space["quality"] = "good"
                    elif space["quality"] == "good":
                        space["quality"] = "fair"
                    elif space["quality"] == "fair":
                        space["quality"] = "poor"
    
    # Remove spaces that are too small to be useful
    usable_spaces = [space for space in usable_spaces if space["area"] >= 0.5]  # At least 0.5 square meters
    
    return usable_spaces


def split_space_around_constraint(space: Dict[str, Any], constraint: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Split a usable space around a constraint (unusable area).
    
    Args:
        space: Dictionary containing space coordinates
        constraint: Dictionary containing constraint coordinates
        
    Returns:
        List of dictionaries containing resulting spaces after splitting
    """
    result_spaces = []
    
    # Space coordinates
    space_x = space["x"]
    space_y = space["y"]
    space_width = space["width"]
    space_height = space["height"]
    
    # Constraint coordinates
    constraint_x = constraint["x"]
    constraint_y = constraint["y"]
    constraint_width = constraint["width"]
    constraint_height = constraint["height"]
    
    # Check if spaces can be created on each side of the constraint
    
    # Space to the left of the constraint
    if constraint_x > space_x:
        left_width = constraint_x - space_x
        result_spaces.append({
            "x": space_x,
            "y": space_y,
            "width": left_width,
            "height": space_height
        })
    
    # Space to the right of the constraint
    if constraint_x + constraint_width < space_x + space_width:
        right_x = constraint_x + constraint_width
        right_width = (space_x + space_width) - right_x
        result_spaces.append({
            "x": right_x,
            "y": space_y,
            "width": right_width,
            "height": space_height
        })
    
    # Space above the constraint
    if constraint_y > space_y:
        top_height = constraint_y - space_y
        result_spaces.append({
            "x": space_x,
            "y": space_y,
            "width": space_width,
            "height": top_height
        })
    
    # Space below the constraint
    if constraint_y + constraint_height < space_y + space_height:
        bottom_y = constraint_y + constraint_height
        bottom_height = (space_y + space_height) - bottom_y
        result_spaces.append({
            "x": space_x,
            "y": bottom_y,
            "width": space_width,
            "height": bottom_height
        })
    
    return result_spaces


def find_largest_usable_space(usable_spaces: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Find the largest usable space by area.
    
    Args:
        usable_spaces: List of usable space dictionaries
        
    Returns:
        The largest usable space or an empty dict if no spaces
    """
    if not usable_spaces:
        return {}
    
    return max(usable_spaces, key=lambda space: space.get("area", 0))


def find_best_quality_space(usable_spaces: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Find the highest quality usable space.
    
    Args:
        usable_spaces: List of usable space dictionaries
        
    Returns:
        The highest quality space or an empty dict if no spaces
    """
    if not usable_spaces:
        return {}
    
    # Convert quality to numerical value for comparison
    quality_values = {"excellent": 4, "good": 3, "fair": 2, "poor": 1}
    
    # Sort by quality first, then by area
    sorted_spaces = sorted(
        usable_spaces,
        key=lambda space: (
            quality_values.get(space.get("quality", "poor"), 0),
            space.get("area", 0)
        ),
        reverse=True
    )
    
    return sorted_spaces[0]