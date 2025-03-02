"""
Command position identifier for feng shui room planning.
Identifies optimal positions for important furniture like beds and desks.
"""
from typing import Dict, List, Any
import math
import logging
from .enums import ElementType

logger = logging.getLogger(__name__)


def identify_command_positions(elements: List[Dict[str, Any]], 
                              room_width: float, room_length: float) -> List[Dict[str, Any]]:
    """
    Identify command positions for bed and desk placements.
    These are positions that face the door but are not in direct alignment,
    and ideally have a solid wall behind.
    
    Args:
        elements: List of room elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        
    Returns:
        List of dictionaries containing command position coordinates and attributes
    """
    command_positions = []
    
    # Find all doors in the room
    doors = [e for e in elements if e.get('element_type') == ElementType.DOOR.value]
    
    # Find all walls in the room
    walls = [e for e in elements if e.get('element_type') == ElementType.WALL.value]
    
    # No command positions if no doors
    if not doors:
        return command_positions
    
    # For each door, identify potential command positions
    for door in doors:
        door_x = door.get('x')
        door_y = door.get('y')
        door_width = door.get('width')
        door_height = door.get('height')
        
        # Calculate door center
        door_center_x = door_x + door_width / 2
        door_center_y = door_y + door_height / 2
        
        # Find positions that are diagonally across from the door
        # We'll check a few potential positions around the room
        
        # Calculate diagonal positions (roughly in 4 corners of the room)
        diagonal_positions = [
            {"x": door_center_x + room_width * 0.3, "y": door_center_y + room_length * 0.3},
            {"x": door_center_x + room_width * 0.3, "y": door_center_y - room_length * 0.3},
            {"x": door_center_x - room_width * 0.3, "y": door_center_y + room_length * 0.3},
            {"x": door_center_x - room_width * 0.3, "y": door_center_y - room_length * 0.3}
        ]
        
        # Filter positions to keep only those inside the room
        diagonal_positions = [
            pos for pos in diagonal_positions
            if 0 <= pos["x"] <= room_width and 0 <= pos["y"] <= room_length
        ]
        
        # Evaluate each potential position
        for pos in diagonal_positions:
            position_quality = "good"  # Default quality
            has_wall_behind = False
            
            # Check if position has a wall behind it
            has_wall_behind = check_wall_support(pos["x"], pos["y"], walls, room_width, room_length)
            
            if has_wall_behind:
                position_quality = "excellent"
            
            # Check if position is in direct alignment with the door
            # Calculate angle between door center and position
            angle = math.atan2(pos["y"] - door_center_y, pos["x"] - door_center_x)
            angle_degrees = math.degrees(angle) % 360
            
            # Check if angle is close to 0, 90, 180, or 270 degrees (direct alignment)
            is_aligned = any(abs(angle_degrees - a) < 10 for a in [0, 90, 180, 270])
            
            if is_aligned:
                position_quality = "poor"  # Direct alignment is bad feng shui
            
            # Add the position if it's not in direct alignment
            if position_quality != "poor":
                command_positions.append({
                    "x": pos["x"],
                    "y": pos["y"],
                    "quality": position_quality,
                    "has_wall_behind": has_wall_behind,
                    "door_id": id(door),  # Use door object ID as reference
                    "suitable_for": ["bed", "desk"]  # Both bed and desk can use command positions
                })
    
    return command_positions


def check_wall_support(x: float, y: float, walls: List[Dict[str, Any]],
                      room_width: float, room_length: float) -> bool:
    """
    Check if a position has solid wall support behind it.
    
    Args:
        x: X coordinate
        y: Y coordinate
        walls: List of wall elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        
    Returns:
        True if position has wall support, False otherwise
    """
    # Check if position is near room boundary (simplified approach)
    near_north = y < room_length * 0.1
    near_south = y > room_length * 0.9
    near_east = x > room_width * 0.9
    near_west = x < room_width * 0.1
    
    if near_north or near_south or near_east or near_west:
        return True
    
    # Check against defined walls
    for wall in walls:
        wall_x = wall.get("x", 0)
        wall_y = wall.get("y", 0)
        wall_width = wall.get("width", 0)
        wall_height = wall.get("height", 0)
        
        # Check if position is near this wall
        if (abs(x - wall_x) < 0.5 or abs(x - (wall_x + wall_width)) < 0.5 or
            abs(y - wall_y) < 0.5 or abs(y - (wall_y + wall_height)) < 0.5):
            return True
    
    return False


def find_optimal_command_positions(command_positions: List[Dict[str, Any]], 
                                  elements: List[Dict[str, Any]], 
                                  room_width: float, room_length: float) -> Dict[str, List[Dict[str, Any]]]:
    """
    Find the best command positions for different furniture types.
    
    Args:
        command_positions: List of command positions
        elements: List of room elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        
    Returns:
        Dictionary with best positions for different furniture types
    """
    if not command_positions:
        return {"bed": [], "desk": [], "sofa": []}
    
    # Sort by quality (excellent, good, fair)
    quality_values = {"excellent": 3, "good": 2, "fair": 1, "poor": 0}
    sorted_positions = sorted(
        command_positions,
        key=lambda p: (
            quality_values.get(p.get("quality", "fair"), 0),
            1 if p.get("has_wall_behind", False) else 0
        ),
        reverse=True
    )
    
    # Find ideal positions for different furniture types
    # For beds, prioritize positions away from windows
    windows = [e for e in elements if e.get('element_type') == ElementType.WINDOW.value]
    
    # Calculate window distance for each position
    for pos in sorted_positions:
        min_window_distance = float('inf')
        for window in windows:
            window_x = window.get('x', 0) + window.get('width', 0) / 2
            window_y = window.get('y', 0) + window.get('height', 0) / 2
            
            distance = math.sqrt((pos["x"] - window_x) ** 2 + (pos["y"] - window_y) ** 2)
            min_window_distance = min(min_window_distance, distance)
        
        pos["window_distance"] = min_window_distance if windows else float('inf')
    
    # Sort positions for beds - prioritize wall support and window distance
    bed_positions = sorted(
        sorted_positions,
        key=lambda p: (
            1 if p.get("has_wall_behind", False) else 0,
            p.get("window_distance", 0)
        ),
        reverse=True
    )
    
    # Sort positions for desks - similar criteria but window view might be desirable
    desk_positions = sorted(
        sorted_positions,
        key=lambda p: (
            1 if p.get("has_wall_behind", False) else 0,
            quality_values.get(p.get("quality", "fair"), 0)
        ),
        reverse=True
    )
    
    # For sofas, command position is less critical but still beneficial
    sofa_positions = sorted_positions.copy()
    
    return {
        "bed": bed_positions,
        "desk": desk_positions,
        "sofa": sofa_positions
    }