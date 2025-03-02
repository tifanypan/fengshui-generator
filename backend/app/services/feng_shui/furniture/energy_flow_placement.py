"""
Energy flow-based furniture placement.
Places furniture considering energy flow and avoiding blocking pathways.
"""
from typing import Dict, List, Any, Optional
import logging
from ..enums import LayoutStrategy
from .utils import filter_available_positions, check_for_bad_placements

logger = logging.getLogger(__name__)


def place_with_energy_flow(item: Dict[str, Any], layout: Dict[str, Any],
                         strategy: LayoutStrategy, energy_flows: Dict[str, Any],
                         elements: List[Dict[str, Any]],
                         room_width: float, room_length: float,
                         life_goal: str = None) -> Optional[Dict[str, Any]]:
    """
    Place furniture considering energy flow and avoiding blocking pathways.
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        strategy: Layout strategy
        energy_flows: Energy flow analysis data
        elements: Room elements (doors, windows, etc.)
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        life_goal: Optional life goal to prioritize
        
    Returns:
        Placement data or None if no suitable position found
    """
    # Get energy flow paths
    flow_paths = energy_flows.get("flow_paths", [])
    entry_points = energy_flows.get("energy_entry_points", [])
    
    # Generate potential positions
    potential_positions = generate_grid_positions(
        room_width, room_length, item, flow_paths, strategy
    )
    
    # Filter out positions that would overlap with existing furniture or room constraints
    available_positions = filter_available_positions(
        potential_positions, item["width"], item["height"], layout, room_width, room_length
    )
    
    # Try with rotated furniture if no positions found
    if not available_positions:
        rotated_positions = generate_rotated_grid_positions(
            room_width, room_length, item, flow_paths, strategy
        )
        
        # Filter rotated positions
        rotated_available = filter_available_positions(
            rotated_positions, item["height"], item["width"], layout, room_width, room_length
        )
        
        # Add rotated positions to available positions
        available_positions.extend(rotated_available)
    
    # If still no positions, return None
    if not available_positions:
        return None
    
    # Sort positions by quality and energy flow impact
    available_positions.sort(
        key=lambda p: (
            {"excellent": 4, "good": 3, "fair": 2, "poor": 1}.get(p.get("quality"), 0),
            0 if p.get("overlaps_flow", False) else 1
        ),
        reverse=True
    )
    
    # Choose best position
    best_position = available_positions[0]
    
    # Determine actual dimensions based on rotation
    actual_width = item["height"] if best_position["rotation"] == 90 else item["width"]
    actual_height = item["width"] if best_position["rotation"] == 90 else item["height"]
    
    # Create placement
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
        "against_wall": False,
        "feng_shui_quality": best_position.get("quality")
    }
    
    # Add tradeoff if placement blocks energy flow
    if best_position.get("overlaps_flow", False):
        tradeoff = {
            "item_id": item["id"],
            "issue": "blocks_energy_flow",
            "description": f"{item['name']} may block natural movement through the space",
            "severity": "low",
            "mitigation": "Consider repositioning for better energy flow or adding a plant nearby"
        }
        layout["tradeoffs"].append(tradeoff)
    
    # Check for any other bad placements
    tradeoffs = check_for_bad_placements(item, placement, elements)
    layout["tradeoffs"].extend(tradeoffs)
    
    return placement


def generate_grid_positions(room_width: float, room_length: float, 
                           item: Dict[str, Any], flow_paths: List[Dict[str, Any]],
                           strategy: LayoutStrategy) -> List[Dict[str, Any]]:
    """
    Generate a grid of potential positions considering energy flow.
    
    Args:
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        item: Furniture item to place
        flow_paths: List of energy flow paths
        strategy: Layout strategy
        
    Returns:
        List of potential position dictionaries
    """
    from ..geometry_utils import rectangle_line_intersection
    
    # Create a grid with larger steps for efficiency
    grid_step = min(0.5, min(room_width, room_length) / 10)  # No smaller than 0.5m steps
    potential_positions = []
    
    for x in range(int(room_width / grid_step)):
        for y in range(int(room_length / grid_step)):
            pos_x = x * grid_step
            pos_y = y * grid_step
            
            # Skip positions that would place furniture outside the room
            if pos_x + item["width"] > room_width or pos_y + item["height"] > room_length:
                continue
            
            # Check if position overlaps with energy flow paths
            overlaps_flow = check_flow_overlap(
                pos_x, pos_y, item["width"], item["height"], flow_paths
            )
            
            # Skip positions that block energy flow if it's the optimal strategy
            if strategy == LayoutStrategy.OPTIMAL and overlaps_flow:
                continue
            
            # Reduce quality for positions that block energy flow in other strategies
            quality = "good" if not overlaps_flow else "fair"
            
            # Add position
            potential_positions.append({
                "x": pos_x,
                "y": pos_y,
                "rotation": 0,
                "quality": quality,
                "overlaps_flow": overlaps_flow
            })
    
    return potential_positions


def generate_rotated_grid_positions(room_width: float, room_length: float, 
                                  item: Dict[str, Any], flow_paths: List[Dict[str, Any]],
                                  strategy: LayoutStrategy) -> List[Dict[str, Any]]:
    """
    Generate a grid of potential positions with rotated furniture.
    
    Args:
        room_width: Width of the room in meters
        room_length: Length of the room in meters
        item: Furniture item to place
        flow_paths: List of energy flow paths
        strategy: Layout strategy
        
    Returns:
        List of potential position dictionaries with rotation
    """
    from ..geometry_utils import rectangle_line_intersection
    
    # Create a grid with larger steps for efficiency
    grid_step = min(0.5, min(room_width, room_length) / 10)  # No smaller than 0.5m steps
    rotated_positions = []
    
    for x in range(int(room_width / grid_step)):
        for y in range(int(room_length / grid_step)):
            pos_x = x * grid_step
            pos_y = y * grid_step
            
            # Skip positions that would place furniture outside the room
            if pos_x + item["height"] > room_width or pos_y + item["width"] > room_length:
                continue
            
            # Check if position overlaps with energy flow paths with rotated furniture
            overlaps_flow = check_flow_overlap(
                pos_x, pos_y, item["height"], item["width"], flow_paths
            )
            
            # Skip positions that block energy flow if it's the optimal strategy
            if strategy == LayoutStrategy.OPTIMAL and overlaps_flow:
                continue
            
            # Reduce quality for positions that block energy flow in other strategies
            quality = "good" if not overlaps_flow else "fair"
            
            # Add position
            rotated_positions.append({
                "x": pos_x,
                "y": pos_y,
                "rotation": 90,
                "quality": quality,
                "overlaps_flow": overlaps_flow
            })
    
    return rotated_positions


def check_flow_overlap(x: float, y: float, width: float, height: float,
                      flow_paths: List[Dict[str, Any]]) -> bool:
    """
    Check if a rectangle overlaps with any energy flow paths.
    
    Args:
        x: X coordinate of rectangle
        y: Y coordinate of rectangle
        width: Width of rectangle
        height: Height of rectangle
        flow_paths: List of energy flow paths
        
    Returns:
        True if rectangle overlaps with any flow path, False otherwise
    """
    from ..geometry_utils import rectangle_line_intersection
    
    for path in flow_paths:
        # Represent flow path as a line
        path_x1 = path.get("start_x", 0)
        path_y1 = path.get("start_y", 0)
        path_x2 = path.get("end_x", 0)
        path_y2 = path.get("end_y", 0)
        
        # Check for rectangle-line intersection
        if rectangle_line_intersection(
            x, y, width, height,
            path_x1, path_y1, path_x2, path_y2
        ):
            return True
    
    return False