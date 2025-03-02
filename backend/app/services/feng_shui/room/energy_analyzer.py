"""
Energy flow analyzer for feng shui room planning.
Analyzes energy flow paths and potential issues.
"""
from typing import Dict, List, Any
import math
import logging
from .enums import ElementType

logger = logging.getLogger(__name__)


def analyze_energy_flow(elements: List[Dict[str, Any]], room_width: float, room_length: float) -> Dict[str, Any]:
    """
    Analyze energy flow in the room, identifying paths and potential issues.
    
    Args:
        elements: List of room elements
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        
    Returns:
        Dictionary containing energy flow analysis
    """
    # Find all doors in the room
    doors = [e for e in elements if e.get('element_type') == ElementType.DOOR.value]
    
    # Find all windows in the room
    windows = [e for e in elements if e.get('element_type') == ElementType.WINDOW.value]
    
    # No energy flow if no doors or windows
    if not doors and not windows:
        return {
            "flow_paths": [],
            "energy_entry_points": [],
            "energy_issues": []
        }
    
    # Identify energy entry points (doors and windows)
    energy_entry_points = []
    
    for door in doors:
        door_x = door.get('x')
        door_y = door.get('y')
        door_width = door.get('width')
        door_height = door.get('height')
        
        energy_entry_points.append({
            "type": "door",
            "x": door_x + door_width / 2,
            "y": door_y + door_height / 2,
            "strength": "strong"  # Doors have strong energy flow
        })
    
    for window in windows:
        window_x = window.get('x')
        window_y = window.get('y')
        window_width = window.get('width')
        window_height = window.get('height')
        
        energy_entry_points.append({
            "type": "window",
            "x": window_x + window_width / 2,
            "y": window_y + window_height / 2,
            "strength": "moderate"  # Windows have moderate energy flow
        })
    
    # Calculate potential energy flow paths
    flow_paths = []
    energy_issues = []
    
    # Room center is the primary energy concentration point
    room_center_x = room_width / 2
    room_center_y = room_length / 2
    
    # Create primary flow paths from entry points to center
    for entry_point in energy_entry_points:
        # Create a path from entry point to room center
        flow_paths.append({
            "start_x": entry_point["x"],
            "start_y": entry_point["y"],
            "end_x": room_center_x,
            "end_y": room_center_y,
            "strength": entry_point["strength"]
        })
    
    # Check for energy flow issues
    identify_energy_issues(energy_entry_points, flow_paths, energy_issues, room_width, room_length)
    
    return {
        "flow_paths": flow_paths,
        "energy_entry_points": energy_entry_points,
        "energy_issues": energy_issues
    }


def identify_energy_issues(entry_points: List[Dict[str, Any]], 
                          flow_paths: List[Dict[str, Any]],
                          energy_issues: List[Dict[str, Any]],
                          room_width: float, room_length: float) -> None:
    """
    Identify energy flow issues in the room and add them to the energy_issues list.
    
    Args:
        entry_points: List of energy entry points
        flow_paths: List of energy flow paths
        energy_issues: List to add identified issues to
        room_width: Width of the room in meters
        room_length: Length of the room in meters
    """
    # Check for direct door alignment issues (doors directly facing each other)
    door_entry_points = [ep for ep in entry_points if ep["type"] == "door"]
    
    for i, entry1 in enumerate(door_entry_points):
        for j, entry2 in enumerate(door_entry_points):
            if i >= j:  # Skip self-comparison and duplicates
                continue
                
            # Calculate if doors are aligned
            is_x_aligned = abs(entry1["x"] - entry2["x"]) < 0.5
            is_y_aligned = abs(entry1["y"] - entry2["y"]) < 0.5
            
            if is_x_aligned or is_y_aligned:
                energy_issues.append({
                    "type": "door_alignment",
                    "description": "Doors are directly aligned, creating too rapid energy flow",
                    "severity": "high",
                    "x1": entry1["x"],
                    "y1": entry1["y"],
                    "x2": entry2["x"],
                    "y2": entry2["y"]
                })
    
    # Check for sharp corners that create sha chi (cutting energy)
    # We'll identify potential corners in the room
    corners = [
        {"x": 0, "y": 0},  # Top-left
        {"x": room_width, "y": 0},  # Top-right
        {"x": 0, "y": room_length},  # Bottom-left
        {"x": room_width, "y": room_length}  # Bottom-right
    ]
    
    # Check if any flow paths pass close to corners
    for path in flow_paths:
        for corner in corners:
            # Calculate distance from corner to path
            corner_to_path_distance = point_to_line_distance(
                corner["x"], corner["y"],
                path["start_x"], path["start_y"],
                path["end_x"], path["end_y"]
            )
            
            # If path passes close to corner, it's a sharp energy issue
            if corner_to_path_distance < 0.5:  # Within 0.5m
                energy_issues.append({
                    "type": "sharp_corner",
                    "description": "Energy flow passes near a sharp corner",
                    "severity": "medium",
                    "x": corner["x"],
                    "y": corner["y"]
                })
    
    # Check for stagnant areas (far from any energy flow)
    # For simplicity, we'll check a grid of points
    grid_step = min(room_width, room_length) / 10
    
    for x in range(int(room_width / grid_step) + 1):
        for y in range(int(room_length / grid_step) + 1):
            point_x = x * grid_step
            point_y = y * grid_step
            
            # Skip points outside room bounds
            if point_x > room_width or point_y > room_length:
                continue
            
            # Calculate minimum distance to any flow path
            min_distance = float('inf')
            for path in flow_paths:
                distance = point_to_line_distance(
                    point_x, point_y,
                    path["start_x"], path["start_y"],
                    path["end_x"], path["end_y"]
                )
                min_distance = min(min_distance, distance)
            
            # If point is far from any flow path, it might be stagnant
            if min_distance > 2.0:  # More than 2m from any flow
                energy_issues.append({
                    "type": "stagnant_energy",
                    "description": "Area may have stagnant energy (far from flow paths)",
                    "severity": "low",
                    "x": point_x,
                    "y": point_y
                })


def point_to_line_distance(px: float, py: float, 
                          x1: float, y1: float, 
                          x2: float, y2: float) -> float:
    """
    Calculate the shortest distance from a point to a line segment.
    
    Args:
        px, py: Point coordinates
        x1, y1: Line segment start point
        x2, y2: Line segment end point
        
    Returns:
        Shortest distance from point to line segment
    """
    # Calculate line length squared
    line_length_sq = (x2 - x1) ** 2 + (y2 - y1) ** 2
    
    # If line is a point, return distance to the point
    if line_length_sq == 0:
        return math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
    
    # Calculate projection of point onto line
    t = max(0, min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / line_length_sq))
    
    # Calculate closest point on line
    closest_x = x1 + t * (x2 - x1)
    closest_y = y1 + t * (y2 - y1)
    
    # Return distance to closest point
    return math.sqrt((px - closest_x) ** 2 + (py - closest_y) ** 2)


def generate_flow_grid(room_width: float, room_length: float, 
                      flow_paths: List[Dict[str, Any]]) -> List[List[float]]:
    """
    Generate a grid representing energy flow intensity across the room.
    
    Args:
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        flow_paths: List of energy flow paths
        
    Returns:
        2D grid of energy flow intensity values
    """
    # Create grid with resolution of 0.5m
    grid_step = 0.5
    grid_width = int(room_width / grid_step) + 1
    grid_height = int(room_length / grid_step) + 1
    
    # Initialize grid with zeros
    flow_grid = [[0.0 for _ in range(grid_height)] for _ in range(grid_width)]
    
    # Fill grid based on distance to flow paths
    for x in range(grid_width):
        for y in range(grid_height):
            point_x = x * grid_step
            point_y = y * grid_step
            
            # Sum influence of all flow paths
            total_influence = 0.0
            for path in flow_paths:
                # Calculate distance to path
                distance = point_to_line_distance(
                    point_x, point_y,
                    path["start_x"], path["start_y"],
                    path["end_x"], path["end_y"]
                )
                
                # Convert strength to numeric value
                strength_value = 1.0
                if path.get("strength") == "strong":
                    strength_value = 2.0
                elif path.get("strength") == "moderate":
                    strength_value = 1.0
                elif path.get("strength") == "weak":
                    strength_value = 0.5
                
                # Add influence (decreases with distance)
                influence = strength_value / (1 + distance)
                total_influence += influence
            
            flow_grid[x][y] = total_influence
    
    return flow_grid