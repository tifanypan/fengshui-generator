"""
Feng Shui Rules Engine - Core system for applying feng shui principles to room layouts.

This engine takes room analysis data and furniture selections and generates optimized
furniture arrangements based on feng shui principles. It includes handling for special
considerations, kua number calculations, and multiple layout generation strategies.
"""
from typing import Dict, List, Tuple, Any, Optional
import logging
import math
import random
from enum import Enum
from datetime import datetime

# Import related services
from app.services.furniture_mapping import (
    FurnitureProperties, Element, Energy, BaguaArea, 
    get_furniture_properties, get_multiple_furniture_properties
)
from app.services.room_analysis import ConstraintType, Direction

logger = logging.getLogger(__name__)

# Feng Shui life goals (for premium optimization)
class LifeGoal(Enum):
    CAREER = "career"
    WEALTH = "wealth"
    HEALTH = "health"
    RELATIONSHIPS = "relationships"

# Kua number groups
class KuaGroup(Enum):
    EAST = "east"  # Kua numbers 1, 3, 4, 9
    WEST = "west"  # Kua numbers 2, 5, 6, 7, 8

# Layout generation strategies
class LayoutStrategy(Enum):
    OPTIMAL = "optimal"  # Best feng shui with no compromises
    SPACE_CONSCIOUS = "space_conscious"  # Prioritizes efficient use of space
    LIFE_GOAL = "life_goal"  # Prioritizes a specific life goal

class FengShuiEngine:
    def __init__(self, room_analysis: Dict[str, Any], furniture_selections: Dict[str, Any], occupants: List[Dict[str, Any]] = None):
        """
        Initialize the feng shui engine with room and furniture data.
        
        Args:
            room_analysis: Room analysis data including dimensions, bagua map, etc.
            furniture_selections: Selected furniture items with quantities and dimensions
            occupants: Optional list of occupant data for kua number calculation
        """
        self.room_analysis = room_analysis
        self.furniture_selections = furniture_selections
        self.occupants = occupants or []
        
        # Get the primary occupant (if any)
        self.primary_occupant = next((o for o in self.occupants if o.get('is_primary')), None)
        
        # Calculate kua number if primary occupant data is available
        self.kua_number = None
        self.kua_group = None
        if self.primary_occupant:
            self.kua_number = self._calculate_kua_number(
                self.primary_occupant.get('gender'),
                self.primary_occupant.get('birth_year'),
                self.primary_occupant.get('birth_month'),
                self.primary_occupant.get('birth_day')
            )
            self.kua_group = self._get_kua_group(self.kua_number)
        
        # Track furniture placement for each generated layout
        self.layouts = {}
        
        # Special considerations (if any)
        self.special_considerations = furniture_selections.get('specialConsiderations', {})
    
    def generate_layouts(self, primary_life_goal: str = None) -> Dict[str, Any]:
        """
        Generate multiple feng shui layouts based on different strategies.
        
        Args:
            primary_life_goal: Optional life goal to prioritize (premium feature)
            
        Returns:
            Dictionary containing multiple layout options
        """
        # Generate the primary optimal layout
        optimal_layout = self._generate_layout(LayoutStrategy.OPTIMAL)
        
        # Generate a space-conscious layout (with some feng shui tradeoffs)
        space_layout = self._generate_layout(LayoutStrategy.SPACE_CONSCIOUS)
        
        # Generate a life goal layout if requested
        life_goal_layout = None
        if primary_life_goal:
            life_goal_layout = self._generate_layout(
                LayoutStrategy.LIFE_GOAL, 
                life_goal=primary_life_goal
            )
        
        # If no life goal layout, generate another tradeoff layout
        if not life_goal_layout:
            # Alternative layout with different tradeoffs
            life_goal_layout = self._generate_layout(
                LayoutStrategy.OPTIMAL,
                randomize_factor=0.3  # Add some randomization for variety
            )
        
        return {
            "optimal_layout": optimal_layout,
            "space_conscious_layout": space_layout,
            "life_goal_layout": life_goal_layout,
            "kua_number": self.kua_number,
            "kua_group": self.kua_group.value if self.kua_group else None,
            "room_analysis": self.room_analysis
        }
    
    def _generate_layout(self, strategy: LayoutStrategy, life_goal: str = None, randomize_factor: float = 0.0) -> Dict[str, Any]:
        """
        Generate a single layout based on a specific strategy.
        
        Args:
            strategy: Layout generation strategy to use
            life_goal: Optional life goal to prioritize
            randomize_factor: Factor for adding randomization (0.0 to 1.0)
            
        Returns:
            Dictionary containing layout data
        """
        # Create a new layout object
        layout_id = f"{strategy.value}_{random.randint(1000, 9999)}"
        layout = {
            "id": layout_id,
            "strategy": strategy.value,
            "furniture_placements": [],
            "tradeoffs": [],
            "feng_shui_score": 0,
            "life_goal": life_goal
        }
        
        # Get all furniture items with their quantities
        furniture_items = []
        for furniture_id, furniture_data in self.furniture_selections.get('items', {}).items():
            if furniture_data.get('quantity', 0) > 0:
                # Get feng shui properties
                feng_shui_props = get_furniture_properties(furniture_id)
                
                # For custom furniture, generate properties based on type and purpose
                if not feng_shui_props and furniture_data.get('type') == 'custom':
                    from app.services.furniture_mapping import get_custom_furniture_properties
                    feng_shui_props = get_custom_furniture_properties(
                        furniture_data.get('type', 'furniture'),
                        furniture_data.get('fengShuiRole', 'balance')
                    )
                
                # Add to items list
                for i in range(furniture_data.get('quantity', 0)):
                    furniture_items.append({
                        "id": f"{furniture_id}_{i}",
                        "base_id": furniture_id,
                        "name": furniture_data.get('customName') or furniture_id,
                        "width": furniture_data.get('dimensions', {}).get('width', 0),
                        "height": furniture_data.get('dimensions', {}).get('height', 0),
                        "feng_shui_properties": feng_shui_props
                    })
        
        # Sort furniture by priority
        furniture_items.sort(
            key=lambda item: item.get('feng_shui_properties').priority 
            if item.get('feng_shui_properties') else 3
        )
        
        # Prioritize high-priority furniture first
        high_priority_items = [item for item in furniture_items 
                              if item.get('feng_shui_properties') and 
                              item.get('feng_shui_properties').priority == 1]
        
        medium_priority_items = [item for item in furniture_items 
                               if item.get('feng_shui_properties') and 
                               item.get('feng_shui_properties').priority == 2]
        
        low_priority_items = [item for item in furniture_items 
                             if item.get('feng_shui_properties') and 
                             item.get('feng_shui_properties').priority == 3]
        
        # If life goal strategy, prioritize items that affect that area
        if strategy == LayoutStrategy.LIFE_GOAL and life_goal:
            # Reorder items based on life goal
            self._reorder_by_life_goal(high_priority_items, life_goal)
            self._reorder_by_life_goal(medium_priority_items, life_goal)
        
        # If space conscious strategy, prioritize smaller items
        if strategy == LayoutStrategy.SPACE_CONSCIOUS:
            high_priority_items.sort(key=lambda item: item.get('width') * item.get('height'))
            medium_priority_items.sort(key=lambda item: item.get('width') * item.get('height'))
        
        # Place high priority items first (beds, desks, sofas)
        for item in high_priority_items:
            placement = self._place_furniture_item(item, layout, strategy, life_goal)
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place medium priority items next
        for item in medium_priority_items:
            placement = self._place_furniture_item(item, layout, strategy, life_goal)
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place low priority items last
        for item in low_priority_items:
            placement = self._place_furniture_item(item, layout, strategy, life_goal)
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Calculate overall feng shui score (0-100)
        layout["feng_shui_score"] = self._calculate_layout_score(layout)
        
        # Store the layout
        self.layouts[layout_id] = layout
        
        return layout
    
    def _place_furniture_item(self, item: Dict[str, Any], layout: Dict[str, Any], 
                             strategy: LayoutStrategy, life_goal: str = None) -> Dict[str, Any]:
        """
        Place a single furniture item optimally based on feng shui rules.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout generation strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Dictionary containing placement data, or None if placement not possible
        """
        # Extract feng shui properties for this item
        properties = item.get('feng_shui_properties')
        if not properties:
            # If no feng shui properties, place it randomly in an available space
            return self._place_furniture_randomly(item, layout)
        
        placement = None
        
        # Different placement strategies based on furniture type
        if properties.command_position_required:
            # For beds and desks - find command position
            placement = self._place_in_command_position(item, layout, strategy)
        elif properties.solid_wall_required:
            # For furniture needing wall support
            placement = self._place_against_wall(item, layout, strategy)
        elif properties.element == Element.WOOD and properties.energy == Energy.EXPANSIVE:
            # For plants and growth-oriented items
            placement = self._place_in_growth_area(item, layout, strategy, life_goal)
        else:
            # For other furniture items
            placement = self._place_by_element_energy(item, layout, strategy, life_goal)
        
        # If no placement found, try to place randomly as fallback
        if not placement:
            placement = self._place_furniture_randomly(item, layout)
            
            # If placed randomly, add a tradeoff note
            if placement:
                tradeoff = {
                    "item_id": item["id"],
                    "issue": "optimal_placement_not_found",
                    "description": f"Couldn't find optimal feng shui placement for {item['name']}",
                    "severity": "medium",
                    "mitigation": "Consider adding stabilizing elements nearby"
                }
                layout["tradeoffs"].append(tradeoff)
        
        return placement
    
    def _place_in_command_position(self, item: Dict[str, Any], layout: Dict[str, Any], 
                                 strategy: LayoutStrategy) -> Optional[Dict[str, Any]]:
        """
        Place furniture that requires a command position (bed, desk).
        The command position faces the door but isn't directly aligned with it.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Get command positions from room analysis
        command_positions = self.room_analysis.get("command_positions", [])
        
        # If no command positions, try to create a virtual one
        if not command_positions:
            # Find a position diagonal to any door
            doors = [e for e in self.room_analysis.get("elements", []) 
                    if e.get("element_type") == "door"]
            
            if doors:
                door = doors[0]  # Use the first door
                door_x = door.get("x", 0) + door.get("width", 0) / 2
                door_y = door.get("y", 0) + door.get("height", 0) / 2
                
                # Create a virtual command position diagonal to the door
                room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
                room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
                
                command_positions = [{
                    "x": room_width * 0.7 if door_x < room_width / 2 else room_width * 0.3,
                    "y": room_length * 0.7 if door_y < room_length / 2 else room_length * 0.3,
                    "quality": "fair",
                    "has_wall_behind": False
                }]
        
        # Sort command positions by quality
        command_positions.sort(key=lambda p: {"excellent": 3, "good": 2, "fair": 1, "poor": 0}.get(p.get("quality"), 0), reverse=True)
        
        # Filter out positions that already have furniture placed
        available_positions = []
        for pos in command_positions:
            is_available = True
            for placed_item in layout["furniture_placements"]:
                # Check if position overlaps with already placed furniture
                if self._position_overlaps_placement(pos["x"], pos["y"], item["width"], item["height"], placed_item):
                    is_available = False
                    break
            
            if is_available:
                available_positions.append(pos)
        
        # If no available positions, return None
        if not available_positions:
            return None
        
        # Choose the best available position
        best_position = available_positions[0]
        
        # Create placement data
        placement = {
            "item_id": item["id"],
            "base_id": item["base_id"],
            "name": item["name"],
            "x": best_position["x"] - item["width"] / 2,  # Center item at position
            "y": best_position["y"] - item["height"] / 2,  # Center item at position
            "width": item["width"],
            "height": item["height"],
            "rotation": 0,  # Default no rotation
            "in_command_position": True,
            "against_wall": best_position.get("has_wall_behind", False),
            "feng_shui_quality": best_position.get("quality", "fair")
        }
        
        # If not against a wall, add a tradeoff note
        if not best_position.get("has_wall_behind", False):
            tradeoff = {
                "item_id": item["id"],
                "issue": "no_wall_behind",
                "description": f"{item['name']} is not against a solid wall",
                "severity": "medium",
                "mitigation": "Add a solid headboard or tall furniture behind it"
            }
            layout["tradeoffs"].append(tradeoff)
        
        return placement
    
    def _place_against_wall(self, item: Dict[str, Any], layout: Dict[str, Any], 
                          strategy: LayoutStrategy) -> Optional[Dict[str, Any]]:
        """
        Place furniture that should be against a wall (bookcases, sofas, etc.).
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Get walls from the room elements
        walls = [e for e in self.room_analysis.get("elements", []) 
                if e.get("element_type") == "wall"]
        
        # If no walls defined, try using room boundaries
        if not walls:
            room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
            room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
            
            # Create virtual walls at room boundaries
            virtual_wall_thickness = 0.2  # 20cm wall thickness
            walls = [
                # North wall
                {"x": 0, "y": 0, "width": room_width, "height": virtual_wall_thickness},
                # East wall
                {"x": room_width - virtual_wall_thickness, "y": 0, "width": virtual_wall_thickness, "height": room_length},
                # South wall
                {"x": 0, "y": room_length - virtual_wall_thickness, "width": room_width, "height": virtual_wall_thickness},
                # West wall
                {"x": 0, "y": 0, "width": virtual_wall_thickness, "height": room_length}
            ]
        
        # Get potential positions along walls
        wall_positions = []
        
        for wall in walls:
            wall_x = wall.get("x", 0)
            wall_y = wall.get("y", 0)
            wall_width = wall.get("width", 0)
            wall_height = wall.get("height", 0)
            
            # Determine wall orientation
            is_horizontal = wall_width > wall_height
            
            if is_horizontal:
                # Place furniture along horizontal wall
                # Try several positions along the wall
                step_size = max(wall_width / 4, item["width"])
                for x in range(int(wall_x), int(wall_x + wall_width - item["width"]), int(step_size)):
                    pos_x = x
                    # Place against north wall
                    if wall_y < self.room_analysis.get("dimensions", {}).get("length", 0) / 2:
                        pos_y = wall_y + wall_height
                    # Place against south wall
                    else:
                        pos_y = wall_y - item["height"]
                    
                    wall_positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 0,
                        "quality": "good"
                    })
            else:
                # Place furniture along vertical wall
                step_size = max(wall_height / 4, item["height"])
                for y in range(int(wall_y), int(wall_y + wall_height - item["height"]), int(step_size)):
                    pos_y = y
                    # Place against west wall
                    if wall_x < self.room_analysis.get("dimensions", {}).get("width", 0) / 2:
                        pos_x = wall_x + wall_width
                    # Place against east wall
                    else:
                        pos_x = wall_x - item["width"]
                    
                    wall_positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 0,
                        "quality": "good"
                    })
        
        # Filter out positions that overlap with existing furniture or constraints
        available_positions = []
        for pos in wall_positions:
            # Check if position is inside room boundaries
            if not self._is_position_in_room(pos["x"], pos["y"], item["width"], item["height"]):
                continue
                
            is_available = True
            
            # Check overlap with existing furniture
            for placed_item in layout["furniture_placements"]:
                if self._rectangles_overlap(
                    pos["x"], pos["y"], item["width"], item["height"],
                    placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                ):
                    is_available = False
                    break
            
            # Check overlap with constraints (unusable areas)
            for constraint in self.room_analysis.get("constraints", []):
                if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                    if self._rectangles_overlap(
                        pos["x"], pos["y"], item["width"], item["height"],
                        constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                    ):
                        is_available = False
                        break
            
            if is_available:
                available_positions.append(pos)
        
        # If no available positions, try rotating the furniture
        if not available_positions:
            # Swap width and height and try again
            rotated_width = item["height"]
            rotated_height = item["width"]
            
            for wall in walls:
                wall_x = wall.get("x", 0)
                wall_y = wall.get("y", 0)
                wall_width = wall.get("width", 0)
                wall_height = wall.get("height", 0)
                
                # Determine wall orientation
                is_horizontal = wall_width > wall_height
                
                if is_horizontal:
                    # Try several positions along the wall
                    step_size = max(wall_width / 4, rotated_width)
                    for x in range(int(wall_x), int(wall_x + wall_width - rotated_width), int(step_size)):
                        pos_x = x
                        # Place against north wall
                        if wall_y < self.room_analysis.get("dimensions", {}).get("length", 0) / 2:
                            pos_y = wall_y + wall_height
                        # Place against south wall
                        else:
                            pos_y = wall_y - rotated_height
                        
                        # Check if position is available
                        is_available = True
                        
                        # Check if position is inside room boundaries
                        if not self._is_position_in_room(pos_x, pos_y, rotated_width, rotated_height):
                            continue
                            
                        # Check overlap with existing furniture
                        for placed_item in layout["furniture_placements"]:
                            if self._rectangles_overlap(
                                pos_x, pos_y, rotated_width, rotated_height,
                                placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                            ):
                                is_available = False
                                break
                        
                        # Check overlap with constraints
                        for constraint in self.room_analysis.get("constraints", []):
                            if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                                if self._rectangles_overlap(
                                    pos_x, pos_y, rotated_width, rotated_height,
                                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                                ):
                                    is_available = False
                                    break
                        
                        if is_available:
                            available_positions.append({
                                "x": pos_x,
                                "y": pos_y,
                                "rotation": 90,  # 90 degree rotation
                                "quality": "good"
                            })
            
        # If still no available positions, return None
        if not available_positions:
            return None
        
        # Choose the best available position
        # For now, just take the first one
        best_position = available_positions[0]
        
        # Create placement data
        placement = {
            "item_id": item["id"],
            "base_id": item["base_id"],
            "name": item["name"],
            "x": best_position["x"],
            "y": best_position["y"],
            "width": item["width"] if best_position["rotation"] == 0 else item["height"],
            "height": item["height"] if best_position["rotation"] == 0 else item["width"],
            "rotation": best_position["rotation"],
            "in_command_position": False,
            "against_wall": True,
            "feng_shui_quality": best_position.get("quality", "fair")
        }
        
        return placement
    
    def _place_in_growth_area(self, item: Dict[str, Any], layout: Dict[str, Any], 
                            strategy: LayoutStrategy, life_goal: str = None) -> Optional[Dict[str, Any]]:
        """
        Place growth-oriented items like plants in appropriate areas.
        Plants are often used to soften corners or energize specific bagua areas.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Get bagua map
        bagua_map = self.room_analysis.get("bagua_map", {})
        
        # Define target areas based on strategy and life goal
        target_areas = []
        
        if strategy == LayoutStrategy.LIFE_GOAL and life_goal:
            # Prioritize the life goal area
            if life_goal == LifeGoal.WEALTH.value:
                target_areas = [BaguaArea.WEALTH.value, BaguaArea.FAME.value]
            elif life_goal == LifeGoal.CAREER.value:
                target_areas = [BaguaArea.CAREER.value, BaguaArea.KNOWLEDGE.value]
            elif life_goal == LifeGoal.HEALTH.value:
                target_areas = [BaguaArea.CENTER.value, BaguaArea.FAMILY.value]
            elif life_goal == LifeGoal.RELATIONSHIPS.value:
                target_areas = [BaguaArea.RELATIONSHIPS.value, BaguaArea.FAMILY.value]
        else:
            # Default priority for plants
            target_areas = [BaguaArea.WEALTH.value, BaguaArea.FAMILY.value, BaguaArea.HEALTH.value]
        
        # Add sharp corners - plants are good for softening corners
        # This would require detecting room corners, which we don't have yet
        # For now, we'll just use the bagua areas
        
        # Find available positions in target areas
        available_positions = []
        
        for area_name in target_areas:
            if area_name in bagua_map:
                area = bagua_map[area_name]
                area_x = area.get("x", 0)
                area_y = area.get("y", 0)
                area_width = area.get("width", 0)
                area_height = area.get("height", 0)
                
                # Try several positions within the area
                step_size = max(area_width / 3, area_height / 3)
                for x in range(int(area_x), int(area_x + area_width - item["width"]), int(max(step_size, 1))):
                    for y in range(int(area_y), int(area_y + area_height - item["height"]), int(max(step_size, 1))):
                        pos_x = x
                        pos_y = y
                        
                        # Check if position is available
                        is_available = True
                        
                        # Check if position is inside room boundaries
                        if not self._is_position_in_room(pos_x, pos_y, item["width"], item["height"]):
                            continue
                            
                        # Check overlap with existing furniture
                        for placed_item in layout["furniture_placements"]:
                            if self._rectangles_overlap(
                                pos_x, pos_y, item["width"], item["height"],
                                placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                            ):
                                is_available = False
                                break
                        
                        # Check overlap with constraints
                        for constraint in self.room_analysis.get("constraints", []):
                            if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                                if self._rectangles_overlap(
                                    pos_x, pos_y, item["width"], item["height"],
                                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                                ):
                                    is_available = False
                                    break
                        
                        if is_available:
                            available_positions.append({
                                "x": pos_x,
                                "y": pos_y,
                                "rotation": 0,
                                "quality": "good",
                                "bagua_area": area_name
                            })
        
        # If no available positions, return None
        if not available_positions:
            return None
        
        # Choose the best available position
        # Prioritize by the order of target areas
        best_position = None
        for area_name in target_areas:
            area_positions = [p for p in available_positions if p.get("bagua_area") == area_name]
            if area_positions:
                best_position = area_positions[0]
                break
        
        # If still no best position, take the first available one
        if not best_position and available_positions:
            best_position = available_positions[0]
        
        # If still no best position, return None
        if not best_position:
            return None
        
        # Create placement data
        placement = {
            "item_id": item["id"],
            "base_id": item["base_id"],
            "name": item["name"],
            "x": best_position["x"],
            "y": best_position["y"],
            "width": item["width"],
            "height": item["height"],
            "rotation": best_position["rotation"],
            "in_command_position": False,
            "against_wall": False,
            "feng_shui_quality": best_position.get("quality", "fair"),
            "bagua_area": best_position.get("bagua_area")
        }
        
        return placement
    
    def _place_by_element_energy(self, item: Dict[str, Any], layout: Dict[str, Any], 
                               strategy: LayoutStrategy, life_goal: str = None) -> Optional[Dict[str, Any]]:
        """
        Place furniture based on its element and energy type.
        Different elements work well in different bagua areas.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Get feng shui properties
        properties = item.get("feng_shui_properties")
        if not properties:
            return None
        
        # Get bagua map
        bagua_map = self.room_analysis.get("bagua_map", {})
        
        # Determine target bagua areas based on element type
        target_areas = properties.ideal_bagua_areas
        
        # If life goal strategy, prioritize areas related to that goal
        if strategy == LayoutStrategy.LIFE_GOAL and life_goal:
            life_goal_areas = []
            if life_goal == LifeGoal.WEALTH.value:
                life_goal_areas = [BaguaArea.WEALTH, BaguaArea.FAME]
            elif life_goal == LifeGoal.CAREER.value:
                life_goal_areas = [BaguaArea.CAREER, BaguaArea.KNOWLEDGE]
            elif life_goal == LifeGoal.HEALTH.value:
                life_goal_areas = [BaguaArea.CENTER, BaguaArea.HEALTH]
            elif life_goal == LifeGoal.RELATIONSHIPS.value:
                life_goal_areas = [BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY]
            
            # Reorder target areas to prioritize life goal areas
            reordered_areas = []
            for area in life_goal_areas:
                if area in target_areas:
                    reordered_areas.append(area)
            
            # Add remaining target areas
            for area in target_areas:
                if area not in reordered_areas:
                    reordered_areas.append(area)
            
            target_areas = reordered_areas
        
        # Convert bagua area enums to strings
        target_area_names = [area.value for area in target_areas]
        
        # Find available positions in target areas
        available_positions = []
        
        for area_name in target_area_names:
            if area_name in bagua_map:
                area = bagua_map[area_name]
                area_x = area.get("x", 0)
                area_y = area.get("y", 0)
                area_width = area.get("width", 0)
                area_height = area.get("height", 0)
                
                # Try several positions within the area
                step_size = max(area_width / 3, area_height / 3)
                for x in range(int(area_x), int(area_x + area_width - item["width"]), int(max(step_size, 1))):
                    for y in range(int(area_y), int(area_y + area_height - item["height"]), int(max(step_size, 1))):
                        pos_x = x
                        pos_y = y
                        
                        # Check if position is available
                        is_available = True
                        
                        # Check if position is inside room boundaries
                        if not self._is_position_in_room(pos_x, pos_y, item["width"], item["height"]):
                            continue
                            
                        # Check overlap with existing furniture
                        for placed_item in layout["furniture_placements"]:
                            if self._rectangles_overlap(
                                pos_x, pos_y, item["width"], item["height"],
                                placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                            ):
                                is_available = False
                                break
                        
                        # Check overlap with constraints
                        for constraint in self.room_analysis.get("constraints", []):
                            if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                                if self._rectangles_overlap(
                                    pos_x, pos_y, item["width"], item["height"],
                                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                                ):
                                    is_available = False
                                    break
                        
                        if is_available:
                            available_positions.append({
                                "x": pos_x,
                                "y": pos_y,
                                "rotation": 0,
                                "quality": "good",
                                "bagua_area": area_name
                            })
        
        # If no available positions in target areas, try any available area
        if not available_positions:
            for area_name, area in bagua_map.items():
                area_x = area.get("x", 0)
                area_y = area.get("y", 0)
                area_width = area.get("width", 0)
                area_height = area.get("height", 0)
                
                # Try several positions within the area
                step_size = max(area_width / 3, area_height / 3)
                for x in range(int(area_x), int(area_x + area_width - item["width"]), int(max(step_size, 1))):
                    for y in range(int(area_y), int(area_y + area_height - item["height"]), int(max(step_size, 1))):
                        pos_x = x
                        pos_y = y
                        
                        # Check if position is available
                        is_available = True
                        
                        # Check if position is inside room boundaries
                        if not self._is_position_in_room(pos_x, pos_y, item["width"], item["height"]):
                            continue
                            
                        # Check overlap with existing furniture
                        for placed_item in layout["furniture_placements"]:
                            if self._rectangles_overlap(
                                pos_x, pos_y, item["width"], item["height"],
                                placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                            ):
                                is_available = False
                                break
                        
                        # Check overlap with constraints
                        for constraint in self.room_analysis.get("constraints", []):
                            if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                                if self._rectangles_overlap(
                                    pos_x, pos_y, item["width"], item["height"],
                                    constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                                ):
                                    is_available = False
                                    break
                        
                        if is_available:
                            available_positions.append({
                                "x": pos_x,
                                "y": pos_y,
                                "rotation": 0,
                                "quality": "fair",  # Lower quality since not in ideal area
                                "bagua_area": area_name
                            })
        
        # If still no available positions, return None
        if not available_positions:
            return None
        
        # Choose the best available position
        # Prioritize by the order of target areas
        best_position = None
        for area_name in target_area_names:
            area_positions = [p for p in available_positions if p.get("bagua_area") == area_name]
            if area_positions:
                best_position = area_positions[0]
                break
        
        # If still no best position, take the first available one
        if not best_position and available_positions:
            best_position = available_positions[0]
        
        # Create placement data
        placement = {
            "item_id": item["id"],
            "base_id": item["base_id"],
            "name": item["name"],
            "x": best_position["x"],
            "y": best_position["y"],
            "width": item["width"],
            "height": item["height"],
            "rotation": best_position["rotation"],
            "in_command_position": False,
            "against_wall": False,
            "feng_shui_quality": best_position.get("quality", "fair"),
            "bagua_area": best_position.get("bagua_area")
        }
        
        # If not in an ideal bagua area, add a tradeoff note
        if best_position.get("bagua_area") not in target_area_names:
            tradeoff = {
                "item_id": item["id"],
                "issue": "non_ideal_bagua_area",
                "description": f"{item['name']} is not in its ideal bagua area",
                "severity": "low",
                "mitigation": f"Consider adding {properties.element.value} elements nearby to enhance energy"
            }
            layout["tradeoffs"].append(tradeoff)
        
        return placement
    
    def _place_furniture_randomly(self, item: Dict[str, Any], layout: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Place furniture randomly in any available space.
        This is a fallback method when optimal placement isn't possible.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            
        Returns:
            Placement data or None if no space available
        """
        # Get room dimensions
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        # Get usable spaces
        usable_spaces = self.room_analysis.get("usable_spaces", [])
        
        # If no usable spaces defined, use the whole room
        if not usable_spaces:
            usable_spaces = [{
                "x": 0,
                "y": 0,
                "width": room_width,
                "height": room_length,
                "quality": "fair"
            }]
        
        # Sort usable spaces by quality and size
        usable_spaces.sort(
            key=lambda s: (
                {"excellent": 3, "good": 2, "fair": 1, "poor": 0}.get(s.get("quality"), 0),
                s.get("width", 0) * s.get("height", 0)
            ),
            reverse=True
        )
        
        # Try to place in each usable space
        for space in usable_spaces:
            space_x = space.get("x", 0)
            space_y = space.get("y", 0)
            space_width = space.get("width", 0)
            space_height = space.get("height", 0)
            
            # Skip if space is too small for the item
            if space_width < item["width"] or space_height < item["height"]:
                continue
            
            # Try different positions within the space
            positions = []
            
            # Try corners first
            positions.extend([
                {"x": space_x, "y": space_y},  # Top-left
                {"x": space_x + space_width - item["width"], "y": space_y},  # Top-right
                {"x": space_x, "y": space_y + space_height - item["height"]},  # Bottom-left
                {"x": space_x + space_width - item["width"], "y": space_y + space_height - item["height"]}  # Bottom-right
            ])
            
            # Then try center
            positions.append({
                "x": space_x + (space_width - item["width"]) / 2,
                "y": space_y + (space_height - item["height"]) / 2
            })
            
            # Try each position
            for pos in positions:
                pos_x = pos["x"]
                pos_y = pos["y"]
                
                # Check if position is available
                is_available = True
                
                # Check overlap with existing furniture
                for placed_item in layout["furniture_placements"]:
                    if self._rectangles_overlap(
                        pos_x, pos_y, item["width"], item["height"],
                        placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                    ):
                        is_available = False
                        break
                
                # Check overlap with constraints
                for constraint in self.room_analysis.get("constraints", []):
                    if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                        if self._rectangles_overlap(
                            pos_x, pos_y, item["width"], item["height"],
                            constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                        ):
                            is_available = False
                            break
                
                if is_available:
                    # Create placement data
                    placement = {
                        "item_id": item["id"],
                        "base_id": item["base_id"],
                        "name": item["name"],
                        "x": pos_x,
                        "y": pos_y,
                        "width": item["width"],
                        "height": item["height"],
                        "rotation": 0,
                        "in_command_position": False,
                        "against_wall": False,
                        "feng_shui_quality": "poor",  # Random placement has poor feng shui quality
                    }
                    
                    return placement
        
        # If we get here, we couldn't place the item
        return None
    
    def _calculate_layout_score(self, layout: Dict[str, Any]) -> int:
        """
        Calculate an overall feng shui score for the layout (0-100).
        
        Args:
            layout: Layout data
            
        Returns:
            Score from 0-100
        """
        # Start with a base score
        score = 70  # Default is "pretty good"
        
        # Count items with good placement
        total_items = len(layout["furniture_placements"])
        if total_items == 0:
            return 0
        
        # Count items in command position
        command_items = sum(1 for item in layout["furniture_placements"] if item.get("in_command_position", False))
        
        # Count items against wall
        wall_items = sum(1 for item in layout["furniture_placements"] if item.get("against_wall", False))
        
        # Count items in good bagua areas
        good_bagua_items = sum(1 for item in layout["furniture_placements"] 
                             if item.get("feng_shui_quality") in ["excellent", "good"])
        
        # Calculate percentages
        command_percent = command_items / total_items * 100 if total_items > 0 else 0
        wall_percent = wall_items / total_items * 100 if total_items > 0 else 0
        good_bagua_percent = good_bagua_items / total_items * 100 if total_items > 0 else 0
        
        # Adjust score based on percentages
        score += command_percent * 0.1  # Up to 10 points for command positions
        score += wall_percent * 0.1  # Up to 10 points for wall placements
        score += good_bagua_percent * 0.1  # Up to 10 points for good bagua placements
        
        # Deduct points for tradeoffs
        score -= len(layout["tradeoffs"]) * 2  # Deduct 2 points per tradeoff
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        return int(score)
    
    def _calculate_kua_number(self, gender: str, birth_year: int, birth_month: int, birth_day: int) -> int:
        """
        Calculate the kua number based on gender and birth date.
        
        Args:
            gender: 'male' or 'female'
            birth_year: Year of birth
            birth_month: Month of birth
            birth_day: Day of birth
            
        Returns:
            Kua number (1-9)
        """
        # Handle missing data
        if not all([gender, birth_year, birth_month, birth_day]):
            return None
        
        # Use lunar year if date is before February 4
        if birth_month == 1 or (birth_month == 2 and birth_day < 4):
            lunar_year = birth_year - 1
        else:
            lunar_year = birth_year
        
        # Calculate kua number based on gender
        if gender.lower() == 'male':
            # For males: 10 - (year's last digit + year's tens digit) % 9
            year_sum = sum(int(digit) for digit in str(lunar_year))
            while year_sum > 9:
                year_sum = sum(int(digit) for digit in str(year_sum))
            kua = 10 - year_sum
            if kua == 10:
                kua = 1
        else:  # female
            # For females: (year's last digit + year's tens digit) % 9 + 5
            year_sum = sum(int(digit) for digit in str(lunar_year))
            while year_sum > 9:
                year_sum = sum(int(digit) for digit in str(year_sum))
            kua = year_sum + 5
            if kua > 9:
                kua = kua - 9
        
        return kua
    
    def _get_kua_group(self, kua_number: int) -> Optional[KuaGroup]:
        """
        Determine the kua group (East or West) based on kua number.
        
        Args:
            kua_number: Kua number (1-9)
            
        Returns:
            KuaGroup enum value
        """
        if not kua_number:
            return None
            
        east_group = [1, 3, 4, 9]
        west_group = [2, 5, 6, 7, 8]
        
        if kua_number in east_group:
            return KuaGroup.EAST
        elif kua_number in west_group:
            return KuaGroup.WEST
        else:
            return None
    
    def _reorder_by_life_goal(self, items: List[Dict[str, Any]], life_goal: str) -> None:
        """
        Reorder items to prioritize those that affect the specified life goal.
        This modifies the list in-place.
        
        Args:
            items: List of furniture items
            life_goal: Life goal to prioritize
        """
        def get_life_goal_relevance(item: Dict[str, Any]) -> int:
            props = item.get('feng_shui_properties')
            if not props:
                return 0
                
            # Check if the item affects the specific life goal
            if life_goal == LifeGoal.CAREER.value and props.affects_career:
                return 3
            elif life_goal == LifeGoal.RELATIONSHIPS.value and props.affects_relationships:
                return 3
            elif life_goal == LifeGoal.HEALTH.value and props.affects_health:
                return 3
            
            # Check element compatibility with life goal
            if life_goal == LifeGoal.WEALTH.value:
                if props.element in [Element.WOOD, Element.WATER]:
                    return 2
            elif life_goal == LifeGoal.CAREER.value:
                if props.element in [Element.WATER, Element.METAL]:
                    return 2
            elif life_goal == LifeGoal.HEALTH.value:
                if props.element in [Element.EARTH, Element.WOOD]:
                    return 2
            elif life_goal == LifeGoal.RELATIONSHIPS.value:
                if props.element in [Element.EARTH, Element.FIRE]:
                    return 2
            
            return 1
        
        # Sort items by life goal relevance (higher first)
        items.sort(key=get_life_goal_relevance, reverse=True)
    
    def _rectangles_overlap(self, x1, y1, w1, h1, x2, y2, w2, h2) -> bool:
        """
        Check if two rectangles overlap.
        
        Args:
            x1, y1, w1, h1: First rectangle (position and dimensions)
            x2, y2, w2, h2: Second rectangle (position and dimensions)
            
        Returns:
            True if rectangles overlap, False otherwise
        """
        return not (x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1)
    
    def _position_overlaps_placement(self, x, y, width, height, placement) -> bool:
        """
        Check if a potential position overlaps with an existing furniture placement.
        
        Args:
            x, y: Position to check
            width, height: Dimensions of the item to place
            placement: Existing furniture placement
            
        Returns:
            True if position overlaps, False otherwise
        """
        return self._rectangles_overlap(
            x, y, width, height,
            placement["x"], placement["y"], placement["width"], placement["height"]
        )
    
    def _is_position_in_room(self, x, y, width, height) -> bool:
        """
        Check if a position is entirely within room boundaries.
        
        Args:
            x, y: Position to check
            width, height: Dimensions of the item
            
        Returns:
            True if position is in room, False otherwise
        """
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        return (
            x >= 0 and y >= 0 and
            x + width <= room_width and
            y + height <= room_length
        )