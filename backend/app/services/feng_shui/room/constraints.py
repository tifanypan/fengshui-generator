"""
Room constraints analysis for feng shui.
Identifies spatial constraints based on room elements.
"""
from typing import Dict, List, Any
import logging
from .enums import ElementType, ConstraintType

logger = logging.getLogger(__name__)


def identify_constraints(elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify spatial constraints based on highlighted elements.
    
    Args:
        elements: List of room elements with type, position, and dimensions
        
    Returns:
        List of constraint dictionaries
    """
    constraints = []
    
    for element in elements:
        element_type = element.get('element_type')
        x = element.get('x')
        y = element.get('y')
        width = element.get('width')
        height = element.get('height')
        
        # Skip if any required fields are missing
        if None in (element_type, x, y, width, height):
            continue
        
        # Process based on element type
        if element_type == ElementType.WALL.value:
            # Walls create unusable areas
            constraints.append(add_constraint(
                constraint_type=ConstraintType.UNUSABLE_AREA,
                x=x, y=y, width=width, height=height,
                description="Wall - cannot place furniture here"
            ))
        
        elif element_type == ElementType.DOOR.value:
            # Doors create traffic flow constraints and door swing areas
            constraints.append(add_constraint(
                constraint_type=ConstraintType.TRAFFIC_FLOW,
                x=x-50, y=y-50, width=width+100, height=height+100,  # Add buffer for traffic flow
                description="Door - keep area clear for traffic"
            ))
            
            # Add door swing constraint (approximation)
            door_swing_width = max(width, height)
            constraints.append(add_constraint(
                constraint_type=ConstraintType.DOOR_SWING,
                x=x, y=y, width=door_swing_width, height=door_swing_width,
                description="Door swing area"
            ))
        
        elif element_type == ElementType.WINDOW.value:
            # Windows need access and create energy points
            constraints.append(add_constraint(
                constraint_type=ConstraintType.TRAFFIC_FLOW,
                x=x, y=y, width=width, height=height,
                description="Window - keep area accessible"
            ))
        
        elif element_type == ElementType.FIREPLACE.value:
            # Fireplaces create unusable areas and feng shui considerations
            constraints.append(add_constraint(
                constraint_type=ConstraintType.UNUSABLE_AREA,
                x=x, y=y, width=width, height=height,
                description="Fireplace - cannot place furniture here"
            ))
            
            # Add feng shui constraint for area in front of fireplace
            constraints.append(add_constraint(
                constraint_type=ConstraintType.FENG_SHUI_ISSUE,
                x=x-width/2, y=y+height, width=width*2, height=height,
                description="Fireplace front - avoid placing bed/desk in this area"
            ))
        
        elif element_type == ElementType.NO_FURNITURE.value:
            # Explicitly marked no-furniture zones
            constraints.append(add_constraint(
                constraint_type=ConstraintType.UNUSABLE_AREA,
                x=x, y=y, width=width, height=height,
                description="No furniture zone"
            ))
        
        elif element_type in (ElementType.CLOSET.value, ElementType.COLUMN.value, ElementType.RADIATOR.value):
            # Other fixed elements create unusable areas
            constraints.append(add_constraint(
                constraint_type=ConstraintType.UNUSABLE_AREA,
                x=x, y=y, width=width, height=height,
                description=f"{element_type.capitalize()} - cannot place furniture here"
            ))
    
    return constraints


def add_constraint(constraint_type: ConstraintType, x: float, y: float, 
                  width: float, height: float, description: str) -> Dict[str, Any]:
    """
    Create a constraint dictionary.
    
    Args:
        constraint_type: Type of constraint (unusable area, traffic flow, etc.)
        x, y: Position of constraint
        width, height: Size of constraint
        description: Description of the constraint
        
    Returns:
        Dictionary representing the constraint
    """
    return {
        "type": constraint_type.value,
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "description": description
    }


def merge_overlapping_constraints(constraints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Merge overlapping constraints of the same type.
    
    Args:
        constraints: List of constraint dictionaries
        
    Returns:
        List of merged constraint dictionaries
    """
    # Group constraints by type
    constraint_groups = {}
    for constraint in constraints:
        constraint_type = constraint["type"]
        if constraint_type not in constraint_groups:
            constraint_groups[constraint_type] = []
        constraint_groups[constraint_type].append(constraint)
    
    # For each group, merge overlapping constraints
    merged_constraints = []
    for constraint_type, group in constraint_groups.items():
        # Sort by position to make adjacent constraints more likely to be processed together
        group.sort(key=lambda c: (c["x"], c["y"]))
        
        # Start with the first constraint
        if group:
            current = group[0].copy()
            
            for i in range(1, len(group)):
                # If constraints overlap, merge them
                if rectangles_overlap(
                    current["x"], current["y"], current["width"], current["height"],
                    group[i]["x"], group[i]["y"], group[i]["width"], group[i]["height"]
                ):
                    # Create a bounding box that contains both constraints
                    x1 = min(current["x"], group[i]["x"])
                    y1 = min(current["y"], group[i]["y"])
                    x2 = max(current["x"] + current["width"], group[i]["x"] + group[i]["width"])
                    y2 = max(current["y"] + current["height"], group[i]["y"] + group[i]["height"])
                    
                    # Update current constraint to this new bounding box
                    current["x"] = x1
                    current["y"] = y1
                    current["width"] = x2 - x1
                    current["height"] = y2 - y1
                else:
                    # No overlap, add current to merged list and start new current
                    merged_constraints.append(current)
                    current = group[i].copy()
            
            # Add the last current constraint
            merged_constraints.append(current)
    
    return merged_constraints


def rectangles_overlap(x1: float, y1: float, w1: float, h1: float,
                      x2: float, y2: float, w2: float, h2: float) -> bool:
    """
    Check if two rectangles overlap.
    
    Args:
        x1, y1, w1, h1: First rectangle (position and dimensions)
        x2, y2, w2, h2: Second rectangle (position and dimensions)
        
    Returns:
        True if rectangles overlap, False otherwise
    """
    return not (x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1)