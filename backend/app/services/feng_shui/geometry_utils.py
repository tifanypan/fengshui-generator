"""
Geometry utility functions for feng shui calculations.
Provides common geometric operations used across the feng shui engine.
"""
import math
from typing import Dict, Any, Tuple, List


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


def rectangle_line_intersection(rect_x: float, rect_y: float, rect_w: float, rect_h: float,
                              line_x1: float, line_y1: float, line_x2: float, line_y2: float,
                              line_thickness: float = 0.3) -> bool:
    """
    Check if a rectangle intersects with a line segment.
    
    Args:
        rect_x, rect_y, rect_w, rect_h: Rectangle coordinates and dimensions
        line_x1, line_y1, line_x2, line_y2: Line segment endpoints
        line_thickness: Thickness of the line in meters (default 0.3m)
        
    Returns:
        True if rectangle and line intersect, False otherwise
    """
    # Calculate the bounding box of the line
    line_min_x = min(line_x1, line_x2)
    line_max_x = max(line_x1, line_x2)
    line_min_y = min(line_y1, line_y2)
    line_max_y = max(line_y1, line_y2)
    
    # Add thickness
    line_min_x -= line_thickness / 2
    line_min_y -= line_thickness / 2
    line_max_x += line_thickness / 2
    line_max_y += line_thickness / 2
    
    # Check for rectangle overlap
    return rectangles_overlap(
        rect_x, rect_y, rect_w, rect_h,
        line_min_x, line_min_y, line_max_x - line_min_x, line_max_y - line_min_y
    )


def position_overlaps(x: float, y: float, width: float, height: float, placed_item: Dict[str, Any]) -> bool:
    """
    Check if a position with specified dimensions overlaps with a placed item.
    
    Args:
        x, y: Position coordinates
        width, height: Dimensions
        placed_item: Item already placed in the layout
        
    Returns:
        True if position overlaps with placed item, False otherwise
    """
    return rectangles_overlap(
        x, y, width, height,
        placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
    )


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """
    Calculate the Euclidean distance between two points.
    
    Args:
        x1, y1: First point coordinates
        x2, y2: Second point coordinates
        
    Returns:
        Distance between the points
    """
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def get_direction_from_angle(angle_degrees: float) -> str:
    """
    Convert an angle to a compass direction.
    
    Args:
        angle_degrees: Angle in degrees (0-360)
        
    Returns:
        Compass direction as a string (N, NE, E, etc.)
    """
    # Normalize angle to 0-360 range
    angle_degrees = angle_degrees % 360
    
    # Define direction ranges
    directions = {
        "N": (337.5, 22.5),
        "NE": (22.5, 67.5),
        "E": (67.5, 112.5),
        "SE": (112.5, 157.5),
        "S": (157.5, 202.5),
        "SW": (202.5, 247.5),
        "W": (247.5, 292.5),
        "NW": (292.5, 337.5)
    }
    
    # Find the direction
    for direction, (start, end) in directions.items():
        if start < end:
            if start <= angle_degrees < end:
                return direction
        else:
            if angle_degrees >= start or angle_degrees < end:
                return direction
    
    return "N"  # Default