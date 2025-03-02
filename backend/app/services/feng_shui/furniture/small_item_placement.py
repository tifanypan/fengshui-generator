"""
Small item placement for feng shui.
Handles placement of small decorative items like plants, lamps, and small tables.
"""
from typing import Dict, List, Any, Optional
import logging
from ..enums import LayoutStrategy
from .utils import filter_available_positions, determine_target_bagua_areas, check_for_bad_placements

logger = logging.getLogger(__name__)


def place_small_item(item: Dict[str, Any], layout: Dict[str, Any],
                   strategy: LayoutStrategy, bagua_map: Dict[str, Dict[str, Any]],
                   energy_flows: Dict[str, Any], elements: List[Dict[str, Any]],
                   room_width: float, room_length: float,
                   life_goal: str = None) -> Optional[Dict[str, Any]]:
    """
    Place small decorative items like plants, lamps, and small tables.
    These can be used to enhance energy or balance elements.
    
    Args:
        item: Furniture item to place
        layout: Current layout data
        strategy: Layout strategy
        bagua_map: Bagua map for the room
        energy_flows: Energy flow analysis data
        elements: Room elements
        room_width: Width of the room
        room_length: Length of the room
        life_goal: Optional life goal to prioritize
        
    Returns:
        Placement data or None if no suitable position found
    """
    # Identify potential positions for small items
    potential_positions = []
    
    # Add positions near large furniture
    furniture_positions = generate_furniture_nearby_positions(layout, item)
    potential_positions.extend(furniture_positions)
    
    # Add positions to balance energy issues
    energy_balance_positions = generate_energy_balance_positions(energy_flows, item)
    potential_positions.extend(energy_balance_positions)
    
    # Add positions in target bagua areas
    target_areas = determine_target_bagua_areas(item, strategy, life_goal)
    bagua_positions = generate_bagua_area_positions(bagua_map, target_areas, item)
    potential_positions.extend(bagua_positions)
    
    # Filter available positions
    available_positions = filter_available_positions(
        potential_positions, item["width"], item["height"], layout, room_width, room_length
    )
    
    # If no available positions, return None
    if not available_positions:
        return None
    
    # Sort by quality and relationship type
    available_positions = sort_small_item_positions(available_positions, target_areas)
    
    # Choose best position
    best_position = available_positions[0]
    
    # Create placement
    placement = {
        "item_id": item["id"],
        "base_id": item["base_id"],
        "name": item["name"],
        "x": best_position["x"],
        "y": best_position["y"],
        "width": item["width"],
        "height": item["height"],
        "rotation": best_position.get("rotation", 0),
        "in_command_position": False,
        "against_wall": False,
        "feng_shui_quality": best_position.get("quality", "good"),
        "bagua_area": best_position.get("bagua_area"),
        "relationship": best_position.get("relationship")
    }
    
    # Check for any bad placements
    tradeoffs = check_for_bad_placements(item, placement, elements)
    layout["tradeoffs"].extend(tradeoffs)
    
    return placement


def generate_furniture_nearby_positions(layout: Dict[str, Any], item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate positions near existing furniture for complementary small items.
    
    Args:
        layout: Current layout data
        item: Small item to place
        
    Returns:
        List of potential positions near furniture
    """
    positions = []
    
    for placed_item in layout.get("furniture_placements", []):
        # For nightstands, place near beds
        if "nightstand" in item["base_id"].lower() and "bed" in placed_item["base_id"].lower():
            # Try both sides of the bed
            side1_x = placed_item["x"] - item["width"] - 0.1  # Left side of bed
            side2_x = placed_item["x"] + placed_item["width"] + 0.1  # Right side of bed
            side_y = placed_item["y"] + (placed_item["height"] - item["height"]) / 2  # Align with middle of bed
            
            positions.append({
                "x": side1_x,
                "y": side_y,
                "rotation": 0,
                "quality": "excellent",
                "relationship": "bedside"
            })
            
            positions.append({
                "x": side2_x,
                "y": side_y,
                "rotation": 0,
                "quality": "excellent",
                "relationship": "bedside"
            })
        
        # For side tables, place near sofas
        elif "side_table" in item["base_id"].lower() and "sofa" in placed_item["base_id"].lower():
            # Try both ends of the sofa
            end1_x = placed_item["x"] - item["width"] - 0.1
            end2_x = placed_item["x"] + placed_item["width"] + 0.1
            side_y = placed_item["y"] + (placed_item["height"] - item["height"]) / 2
            
            positions.append({
                "x": end1_x,
                "y": side_y,
                "rotation": 0,
                "quality": "excellent",
                "relationship": "sofaside"
            })
            
            positions.append({
                "x": end2_x,
                "y": side_y,
                "rotation": 0,
                "quality": "excellent",
                "relationship": "sofaside"
            })
        
        # For lamps, place near desks, sofas, or chairs
        elif "lamp" in item["base_id"].lower() and any(furniture in placed_item["base_id"].lower() for furniture in ["desk", "sofa", "chair"]):
            # Try near the furniture
            lamp_x = placed_item["x"] + placed_item["width"] + 0.1
            lamp_y = placed_item["y"]
            
            positions.append({
                "x": lamp_x,
                "y": lamp_y,
                "rotation": 0,
                "quality": "excellent",
                "relationship": "lighting"
            })
    
    return positions


def generate_energy_balance_positions(energy_flows: Dict[str, Any], item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate positions to balance energy issues.
    
    Args:
        energy_flows: Energy flow analysis data
        item: Small item to place
        
    Returns:
        List of potential positions for energy balance
    """
    positions = []
    
    # Plants can help balance energy issues
    energy_issues = energy_flows.get("energy_issues", [])
    if "plant" in item["base_id"].lower():
        for issue in energy_issues:
            if issue.get("type") == "sharp_corner":
                positions.append({
                    "x": issue.get("x", 0) - item["width"] / 2,
                    "y": issue.get("y", 0) - item["height"] / 2,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "balance_corner"
                })
            elif issue.get("type") == "stagnant_energy":
                positions.append({
                    "x": issue.get("x", 0) - item["width"] / 2,
                    "y": issue.get("y", 0) - item["height"] / 2,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "activate_energy"
                })
    
    # Water features can enhance energy in specific areas
    if "fountain" in item["base_id"].lower() or "water" in item["base_id"].lower():
        for entry_point in energy_flows.get("energy_entry_points", []):
            if entry_point.get("type") == "door" and entry_point.get("strength") == "strong":
                positions.append({
                    "x": entry_point.get("x", 0) + 1.0,  # Place slightly away from door
                    "y": entry_point.get("y", 0) + 1.0,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "enhance_entry"
                })
    
    return positions


def generate_bagua_area_positions(bagua_map: Dict[str, Dict[str, Any]], 
                                target_areas: List[str],
                                item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate positions in specific bagua areas.
    
    Args:
        bagua_map: Bagua map for the room
        target_areas: List of target bagua areas
        item: Small item to place
        
    Returns:
        List of potential positions in bagua areas
    """
    positions = []
    
    for area_name in target_areas:
        if area_name in bagua_map:
            area = bagua_map[area_name]
            area_x = area.get("x", 0)
            area_y = area.get("y", 0)
            area_width = area.get("width", 0)
            area_height = area.get("height", 0)
            
            # Create a grid of potential positions within this area
            grid_step = min(0.5, min(area_width, area_height) / 3)
            
            for x_step in range(int(area_width / grid_step)):
                for y_step in range(int(area_height / grid_step)):
                    pos_x = area_x + (x_step * grid_step)
                    pos_y = area_y + (y_step * grid_step)
                    
                    # Skip positions that would place item outside the area
                    if pos_x + item["width"] > area_x + area_width or pos_y + item["height"] > area_y + area_height:
                        continue
                    
                    positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 0,
                        "quality": "good",
                        "bagua_area": area_name
                    })
    
    return positions


def sort_small_item_positions(positions: List[Dict[str, Any]], target_areas: List[str]) -> List[Dict[str, Any]]:
    """
    Sort small item positions by quality and relationship.
    
    Args:
        positions: List of potential positions
        target_areas: List of target bagua areas
        
    Returns:
        Sorted list of positions
    """
    # Define priority for different relationships
    relation_priority = {
        "bedside": 5,
        "sofaside": 4,
        "balance_corner": 4,
        "activate_energy": 3,
        "enhance_entry": 3,
        "lighting": 2,
        None: 0
    }
    
    # Sort by quality, relationship type, and bagua area
    return sorted(
        positions,
        key=lambda p: (
            {"excellent": 4, "good": 3, "fair": 2, "poor": 1}.get(p.get("quality"), 0),
            relation_priority.get(p.get("relationship"), 0),
            1 if p.get("bagua_area") in target_areas else 0
        ),
        reverse=True
    )