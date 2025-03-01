"""
Feng Shui Engine - Core system for applying feng shui principles to room layouts.

This engine takes room analysis data and furniture selections and generates optimized
furniture arrangements based on feng shui principles, prioritizing:
1. Command position - the most important principle
2. Avoiding bad placements - critical for good feng shui
3. Energy flow - ensuring smooth circulation
4. Kua number - personalized direction preferences
5. Five element balance - as a secondary consideration
6. Bagua areas - only for premium life goal optimization
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
            room_analysis: Room analysis data including dimensions, energy flow, and constraints
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
        
        # Extract doors, windows, and walls from room elements for quick access
        self.doors = [e for e in self.room_analysis.get('elements', []) if e.get('element_type') == 'door']
        self.windows = [e for e in self.room_analysis.get('elements', []) if e.get('element_type') == 'window']
        self.walls = [e for e in self.room_analysis.get('elements', []) if e.get('element_type') == 'wall']
        
        # Extract energy flow data
        self.energy_flows = self.room_analysis.get('energy_flow', {})
        
        # Precompute command positions for quick access
        self.command_positions = self.room_analysis.get('command_positions', [])
    
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
        
        # Categorize furniture by importance
        command_furniture = [] # Beds, desks, sofas - need command position
        wall_furniture = []    # Bookcases, dressers - need wall support
        large_furniture = []   # Other large items that aren't in the above categories
        small_furniture = []   # Small items like nightstands, side tables, plants
        
        for item in furniture_items:
            properties = item.get('feng_shui_properties')
            if not properties:
                # If no properties, categorize by size
                area = item.get('width', 0) * item.get('height', 0)
                small_furniture.append(item) if area < 1000 else large_furniture.append(item)
                continue
                
            # Categorize based on feng shui requirements
            if properties.command_position_required:
                command_furniture.append(item)
            elif properties.solid_wall_required:
                wall_furniture.append(item)
            elif item.get('width', 0) * item.get('height', 0) < 1000:
                small_furniture.append(item)
            else:
                large_furniture.append(item)
        
        # Sort each category by priority
        command_furniture.sort(key=lambda i: i.get('feng_shui_properties').priority if i.get('feng_shui_properties') else 3)
        wall_furniture.sort(key=lambda i: i.get('feng_shui_properties').priority if i.get('feng_shui_properties') else 3)
        large_furniture.sort(key=lambda i: i.get('feng_shui_properties').priority if i.get('feng_shui_properties') else 3)
        small_furniture.sort(key=lambda i: i.get('feng_shui_properties').priority if i.get('feng_shui_properties') else 3)
        
        # If life goal strategy, adjust priorities based on life goal
        if strategy == LayoutStrategy.LIFE_GOAL and life_goal:
            life_goal_enum = next((lg for lg in LifeGoal if lg.value == life_goal), None)
            if life_goal_enum:
                self._adjust_for_life_goal(command_furniture, life_goal_enum)
                self._adjust_for_life_goal(wall_furniture, life_goal_enum)
                self._adjust_for_life_goal(large_furniture, life_goal_enum)
                self._adjust_for_life_goal(small_furniture, life_goal_enum)
        
        # Place command position furniture first
        for item in command_furniture:
            placement = self._place_in_command_position(item, layout, strategy)
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place wall furniture next
        for item in wall_furniture:
            placement = self._place_against_wall(item, layout, strategy)
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place large furniture
        for item in large_furniture:
            # Try to place based on energy flow
            placement = self._place_with_energy_flow(item, layout, strategy, life_goal)
            
            # If that fails, try general placement
            if not placement:
                placement = self._place_furniture_general(item, layout, strategy, life_goal)
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place small furniture last
        for item in small_furniture:
            # Small items can go almost anywhere
            placement = self._place_small_item(item, layout, strategy, life_goal)
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Check for and add bad placement warnings
        self._check_for_bad_placements(layout)
        
        # Calculate overall feng shui score (0-100)
        layout["feng_shui_score"] = self._calculate_layout_score(layout)
        
        # Store the layout
        self.layouts[layout_id] = layout
        
        return layout
    
    def _adjust_for_life_goal(self, furniture_items: List[Dict[str, Any]], life_goal: LifeGoal) -> None:
        """
        Adjust furniture priority based on life goal.
        
        Args:
            furniture_items: List of furniture items to adjust
            life_goal: The life goal to prioritize
        """
        for item in furniture_items:
            props = item.get('feng_shui_properties')
            if not props:
                continue
                
            # Create a priority boost value (0-5)
            boost = 0
            
            # Check if item directly supports the life goal
            if life_goal == LifeGoal.CAREER and props.affects_career:
                boost = 5
            elif life_goal == LifeGoal.RELATIONSHIPS and props.affects_relationships:
                boost = 5
            elif life_goal == LifeGoal.HEALTH and props.affects_health:
                boost = 5
            elif life_goal == LifeGoal.WEALTH:
                # Wealth is often associated with specific elements
                if props.element == Element.WOOD or props.element == Element.WATER:
                    boost = 4
                    
            # Add a temporary priority boost attribute
            item['priority_boost'] = boost
            
        # Sort the list based on original priority plus boost
        furniture_items.sort(key=lambda i: (
            (i.get('feng_shui_properties').priority if i.get('feng_shui_properties') else 3) - 
            (i.get('priority_boost', 0) * 0.1)  # Scale boost to be significant but not override core priority
        ))
    
    def _place_in_command_position(self, item: Dict[str, Any], layout: Dict[str, Any], 
                                 strategy: LayoutStrategy) -> Optional[Dict[str, Any]]:
        """
        Place furniture that requires a command position (bed, desk).
        Command position: can see the door but not directly in line with it,
        with solid wall support behind.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Check if we have any predefined command positions from room analysis
        command_positions = self.command_positions.copy()
        
        # If no command positions, calculate them dynamically
        if not command_positions:
            command_positions = self._calculate_command_positions()
        
        # Filter by furniture type if needed (beds vs. desks)
        suitable_positions = []
        for pos in command_positions:
            suitable_for = pos.get("suitable_for", ["bed", "desk"])
            
            # Determine if this item is suitable for this position
            item_type = self._get_furniture_type(item["base_id"])
            
            if item_type in suitable_for or "any" in suitable_for:
                suitable_positions.append(pos)
        
        # If no suitable positions, use any command position
        if not suitable_positions and command_positions:
            suitable_positions = command_positions
        
        # If still no positions, try to create a basic one
        if not suitable_positions:
            room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
            room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
            
            # Create a default position in a good location
            suitable_positions = [{
                "x": room_width * 0.65,
                "y": room_length * 0.65,
                "quality": "fair",
                "has_wall_behind": False
            }]
        
        # Sort by quality (excellent, good, fair, poor)
        quality_values = {"excellent": 4, "good": 3, "fair": 2, "poor": 1}
        suitable_positions.sort(
            key=lambda p: (
                quality_values.get(p.get("quality"), 0),
                1 if p.get("has_wall_behind", False) else 0
            ),
            reverse=True
        )
        
        # Try each position until we find one that works
        for position in suitable_positions:
            # Check if position is already taken
            is_position_taken = False
            for placed_item in layout["furniture_placements"]:
                if self._position_overlaps(
                    position["x"], position["y"], 
                    item["width"], item["height"],
                    placed_item
                ):
                    is_position_taken = True
                    break
            
            if is_position_taken:
                continue
                
            # Check for bad feng shui placements
            has_bad_placement = False
            
            # Check if bed is under window (bad feng shui for beds)
            if "bed" in item["base_id"].lower():
                for window in self.windows:
                    if self._rectangles_overlap(
                        position["x"] - item["width"]/2, position["y"] - item["height"]/2,
                        item["width"], item["height"],
                        window.get("x", 0), window.get("y", 0),
                        window.get("width", 0), window.get("height", 0)
                    ):
                        has_bad_placement = True
                        break
            
            # If it's a bad placement, skip this position
            if has_bad_placement:
                continue
                
            # Position fits! Create placement data
            x_position = position["x"] - item["width"] / 2  # Center item at position
            y_position = position["y"] - item["height"] / 2  # Center item at position
            
            # Determine optimal rotation based on kua number if available
            rotation = 0
            if self.kua_group and "bed" in item["base_id"].lower():
                # Apply kua number direction preference for beds
                rotation = self._get_kua_direction_rotation(position)
            
            # Create placement
            placement = {
                "item_id": item["id"],
                "base_id": item["base_id"],
                "name": item["name"],
                "x": x_position,
                "y": y_position,
                "width": item["width"],
                "height": item["height"],
                "rotation": rotation,
                "in_command_position": True,
                "against_wall": position.get("has_wall_behind", False),
                "feng_shui_quality": position.get("quality", "fair")
            }
            
            # Add notes about missing wall support
            if not position.get("has_wall_behind", False):
                tradeoff = {
                    "item_id": item["id"],
                    "issue": "no_wall_behind",
                    "description": f"{item['name']} is not against a solid wall",
                    "severity": "medium",
                    "mitigation": "Add a solid headboard or tall furniture behind it"
                }
                layout["tradeoffs"].append(tradeoff)
            
            return placement
        
        # If we get here, no suitable position was found
        # Try a more general placement as fallback
        return self._place_furniture_general(item, layout, strategy)
    
    def _place_against_wall(self, item: Dict[str, Any], layout: Dict[str, Any], 
                          strategy: LayoutStrategy) -> Optional[Dict[str, Any]]:
        """
        Place furniture that should be against a wall (bookcases, dressers, etc.).
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Extract walls and room boundaries
        if not self.walls:
            # If no walls defined, use room boundaries as walls
            room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
            room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
            wall_thickness = 0.2  # 20cm wall thickness
            
            virtual_walls = [
                # North wall
                {"x": 0, "y": 0, "width": room_width, "height": wall_thickness, "orientation": "horizontal"},
                # East wall
                {"x": room_width - wall_thickness, "y": 0, "width": wall_thickness, "height": room_length, "orientation": "vertical"},
                # South wall
                {"x": 0, "y": room_length - wall_thickness, "width": room_width, "height": wall_thickness, "orientation": "horizontal"},
                # West wall
                {"x": 0, "y": 0, "width": wall_thickness, "height": room_length, "orientation": "vertical"}
            ]
            walls = virtual_walls
        else:
            # Use defined walls and calculate their orientation
            walls = []
            for wall in self.walls:
                # Determine if wall is horizontal or vertical
                orientation = "horizontal" if wall.get("width", 0) > wall.get("height", 0) else "vertical"
                walls.append({
                    "x": wall.get("x", 0),
                    "y": wall.get("y", 0),
                    "width": wall.get("width", 0),
                    "height": wall.get("height", 0),
                    "orientation": orientation
                })
        
        # Get potential positions along walls
        wall_positions = []
        
        for wall in walls:
            wall_x = wall.get("x", 0)
            wall_y = wall.get("y", 0)
            wall_width = wall.get("width", 0)
            wall_height = wall.get("height", 0)
            is_horizontal = wall.get("orientation") == "horizontal"
            
            # Different logic for horizontal vs vertical walls
            if is_horizontal:
                # For horizontal walls (north/south walls)
                # Try several positions along the wall
                step_size = 0.5  # Try positions every 0.5 meter
                max_steps = max(3, int(wall_width / step_size))  # At least 3 positions to try
                
                for step in range(max_steps):
                    pos_x = wall_x + (step * wall_width / max_steps)
                    
                    # Adjust for wall thickness
                    if wall_y < 1:  # North wall
                        pos_y = wall_y + wall_height
                    else:  # South wall
                        pos_y = wall_y - item["height"]
                    
                    wall_positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 0,
                        "quality": "good",
                        "wall_side": "north" if wall_y < 1 else "south"
                    })
            else:
                # For vertical walls (east/west walls)
                step_size = 0.5  # Try positions every 0.5 meter
                max_steps = max(3, int(wall_height / step_size))  # At least 3 positions to try
                
                for step in range(max_steps):
                    pos_y = wall_y + (step * wall_height / max_steps)
                    
                    # Adjust for wall thickness
                    if wall_x < 1:  # West wall
                        pos_x = wall_x + wall_width
                    else:  # East wall
                        pos_x = wall_x - item["width"]
                    
                    wall_positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 0,
                        "quality": "good",
                        "wall_side": "west" if wall_x < 1 else "east"
                    })
        
        # Filter out positions that would overlap with existing furniture or room constraints
        available_positions = self._filter_available_positions(
            wall_positions, item["width"], item["height"], layout
        )
        
        # If no available positions, try rotating the furniture
        if not available_positions:
            rotated_wall_positions = []
            
            for wall in walls:
                wall_x = wall.get("x", 0)
                wall_y = wall.get("y", 0)
                wall_width = wall.get("width", 0)
                wall_height = wall.get("height", 0)
                is_horizontal = wall.get("orientation") == "horizontal"
                
                # Swap width and height for the item when rotated
                rotated_width = item["height"]
                rotated_height = item["width"]
                
                # Different logic for horizontal vs vertical walls
                if is_horizontal:
                    # Try positions along the horizontal wall
                    step_size = 0.5
                    max_steps = max(3, int(wall_width / step_size))
                    
                    for step in range(max_steps):
                        pos_x = wall_x + (step * wall_width / max_steps)
                        
                        # Adjust for wall thickness
                        if wall_y < 1:  # North wall
                            pos_y = wall_y + wall_height
                        else:  # South wall
                            pos_y = wall_y - rotated_height
                        
                        rotated_wall_positions.append({
                            "x": pos_x,
                            "y": pos_y,
                            "rotation": 90,  # 90 degree rotation
                            "quality": "good",
                            "wall_side": "north" if wall_y < 1 else "south"
                        })
                else:
                    # Try positions along the vertical wall
                    step_size = 0.5
                    max_steps = max(3, int(wall_height / step_size))
                    
                    for step in range(max_steps):
                        pos_y = wall_y + (step * wall_height / max_steps)
                        
                        # Adjust for wall thickness
                        if wall_x < 1:  # West wall
                            pos_x = wall_x + wall_width
                        else:  # East wall
                            pos_x = wall_x - rotated_width
                        
                        rotated_wall_positions.append({
                            "x": pos_x,
                            "y": pos_y,
                            "rotation": 90,  # 90 degree rotation
                            "quality": "good",
                            "wall_side": "west" if wall_x < 1 else "east"
                        })
            
            # Filter rotated positions
            available_positions = self._filter_available_positions(
                rotated_wall_positions, 
                rotated_width if rotated_wall_positions else item["width"],
                rotated_height if rotated_wall_positions else item["height"],
                layout
            )
        
        # If still no positions, try general placement
        if not available_positions:
            return self._place_furniture_general(item, layout, strategy)
        
        # Choose best position - prefer positions that align with kua direction
        best_position = self._choose_best_position(available_positions, item)
        
        # Get actual width and height based on rotation
        actual_width = item["height"] if best_position["rotation"] == 90 else item["width"]
        actual_height = item["width"] if best_position["rotation"] == 90 else item["height"]
        
        # Create placement data
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
            "against_wall": True,
            "feng_shui_quality": best_position.get("quality", "good"),
            "wall_side": best_position.get("wall_side")
        }
        
        return placement
    
    def _place_with_energy_flow(self, item: Dict[str, Any], layout: Dict[str, Any],
                             strategy: LayoutStrategy, life_goal: str = None) -> Optional[Dict[str, Any]]:
        """
        Place furniture considering energy flow and avoiding blocking pathways.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Get energy flow paths and avoid placing in high traffic areas
        flow_paths = self.energy_flows.get("flow_paths", [])
        entry_points = self.energy_flows.get("energy_entry_points", [])
        
        # Create a grid of potential positions
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
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
                overlaps_flow = False
                for path in flow_paths:
                    # Represent flow path as a line with some width
                    path_x1 = path.get("start_x", 0)
                    path_y1 = path.get("start_y", 0)
                    path_x2 = path.get("end_x", 0)
                    path_y2 = path.get("end_y", 0)
                    
                    # Check for rectangle-line intersection
                    if self._rectangle_line_intersection(
                        pos_x, pos_y, item["width"], item["height"],
                        path_x1, path_y1, path_x2, path_y2
                    ):
                        overlaps_flow = True
                        break
                
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
        
        # Filter out positions that would overlap with existing furniture or room constraints
        available_positions = self._filter_available_positions(
            potential_positions, item["width"], item["height"], layout
        )
        
        # Try with rotated furniture if no positions found
        if not available_positions:
            rotated_positions = []
            for x in range(int(room_width / grid_step)):
                for y in range(int(room_length / grid_step)):
                    pos_x = x * grid_step
                    pos_y = y * grid_step
                    
                    # Skip positions that would place furniture outside the room
                    if pos_x + item["height"] > room_width or pos_y + item["width"] > room_length:
                        continue
                    
                    # Check if position overlaps with energy flow paths with rotated furniture
                    overlaps_flow = False
                    for path in flow_paths:
                        path_x1 = path.get("start_x", 0)
                        path_y1 = path.get("start_y", 0)
                        path_x2 = path.get("end_x", 0)
                        path_y2 = path.get("end_y", 0)
                        
                        if self._rectangle_line_intersection(
                            pos_x, pos_y, item["height"], item["width"],
                            path_x1, path_y1, path_x2, path_y2
                        ):
                            overlaps_flow = True
                            break
                    
                    quality = "good" if not overlaps_flow else "fair"
                    
                    rotated_positions.append({
                        "x": pos_x,
                        "y": pos_y,
                        "rotation": 90,
                        "quality": quality,
                        "overlaps_flow": overlaps_flow
                    })
            
            # Filter rotated positions
            rotated_available = self._filter_available_positions(
                rotated_positions, item["height"], item["width"], layout
            )
            
            # Add rotated positions to available positions
            available_positions.extend(rotated_available)
        
        # If still no positions, return None to try general placement
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
        
        return placement
    
    def _place_small_item(self, item: Dict[str, Any], layout: Dict[str, Any],
                      strategy: LayoutStrategy, life_goal: str = None) -> Optional[Dict[str, Any]]:
        """
        Place small decorative items like plants, lamps, and small tables.
        These can be used to enhance energy or balance elements.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Placement data or None if no suitable position found
        """
        # Small items can help balance elements in different bagua areas
        bagua_map = self.room_analysis.get("bagua_map", {})
        
        # Determine target bagua areas based on item properties
        properties = item.get("feng_shui_properties")
        target_areas = []
        
        if properties:
            # Use item's preferred bagua areas if defined
            if hasattr(properties, 'ideal_bagua_areas') and properties.ideal_bagua_areas:
                target_areas = [area.value for area in properties.ideal_bagua_areas]
            
            # For plants (wood element), prefer wealth, family, health areas
            if properties.element == Element.WOOD and "plant" in item["base_id"].lower():
                target_areas = ["wealth", "family", "health"]
            
            # For lamps (fire element), prefer fame, wisdom areas
            if "lamp" in item["base_id"].lower():
                target_areas = ["fame", "knowledge"]
        
        # If using life goal strategy, prioritize relevant bagua areas
        if strategy == LayoutStrategy.LIFE_GOAL and life_goal:
            if life_goal == LifeGoal.WEALTH.value:
                target_areas = ["wealth", "fame", "helpful_people"] + target_areas
            elif life_goal == LifeGoal.CAREER.value:
                target_areas = ["career", "knowledge", "helpful_people"] + target_areas
            elif life_goal == LifeGoal.HEALTH.value:
                target_areas = ["center", "family", "health"] + target_areas
            elif life_goal == LifeGoal.RELATIONSHIPS.value:
                target_areas = ["relationships", "family", "center"] + target_areas
        
        # Look for sharp corners or problematic areas that need balancing
        energy_issues = self.energy_flows.get("energy_issues", [])
        problem_spots = []
        
        for issue in energy_issues:
            if issue.get("type") == "sharp_corner":
                problem_spots.append({
                    "x": issue.get("x", 0),
                    "y": issue.get("y", 0),
                    "priority": "high" if "plant" in item["base_id"].lower() else "medium"
                })
        
        # Create potential positions list
        potential_positions = []
        
        # Add positions near large furniture for balance
        for placed_item in layout["furniture_placements"]:
            # For nightstands, place near beds
            if "nightstand" in item["base_id"].lower() and "bed" in placed_item["base_id"].lower():
                # Try both sides of the bed
                side1_x = placed_item["x"] - item["width"] - 0.1  # Left side of bed
                side2_x = placed_item["x"] + placed_item["width"] + 0.1  # Right side of bed
                side_y = placed_item["y"] + (placed_item["height"] - item["height"]) / 2  # Align with middle of bed
                
                potential_positions.append({
                    "x": side1_x,
                    "y": side_y,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "bedside"
                })
                
                potential_positions.append({
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
                
                potential_positions.append({
                    "x": end1_x,
                    "y": side_y,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "sofaside"
                })
                
                potential_positions.append({
                    "x": end2_x,
                    "y": side_y,
                    "rotation": 0,
                    "quality": "excellent",
                    "relationship": "sofaside"
                })
            
            # For plants, place in corners or near sharp edges
            elif "plant" in item["base_id"].lower():
                for spot in problem_spots:
                    potential_positions.append({
                        "x": spot["x"] - item["width"] / 2,
                        "y": spot["y"] - item["height"] / 2,
                        "rotation": 0,
                        "quality": "excellent",
                        "relationship": "balance_corner"
                    })
        
        # Add positions in target bagua areas
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
                        
                        potential_positions.append({
                            "x": pos_x,
                            "y": pos_y,
                            "rotation": 0,
                            "quality": "good",
                            "bagua_area": area_name
                        })
        
        # Filter available positions
        available_positions = self._filter_available_positions(
            potential_positions, item["width"], item["height"], layout
        )
        
        # If no available positions, try general placement
        if not available_positions:
            return self._place_furniture_general(item, layout, strategy)
        
        # Sort by quality and relationship type
        relation_priority = {
            "bedside": 5,
            "sofaside": 4,
            "balance_corner": 4,
            None: 0
        }
        
        available_positions.sort(
            key=lambda p: (
                {"excellent": 4, "good": 3, "fair": 2, "poor": 1}.get(p.get("quality"), 0),
                relation_priority.get(p.get("relationship"), 0),
                1 if p.get("bagua_area") in target_areas else 0
            ),
            reverse=True
        )
        
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
        
        return placement
    
    def _place_furniture_general(self, item: Dict[str, Any], layout: Dict[str, Any],
                                strategy: LayoutStrategy, life_goal: str = None) -> Optional[Dict[str, Any]]:
        """
        General furniture placement method as a fallback.
        Tries to find any suitable location based on room constraints.
        
        Args:
            item: Furniture item to place
            layout: Current layout data
            strategy: Layout strategy
            life_goal: Optional life goal to prioritize
            
        Returns:
            Placement data or None if no space available
        """
        # Get room dimensions
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        # Get usable spaces from room analysis
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
                {"excellent": 4, "good": 3, "fair": 2, "poor": 1}.get(s.get("quality"), 0),
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
            
            # Now try with rotation
            if item["width"] != item["height"]:  # Only rotate if dimensions differ
                if space_width < item["height"] or space_height < item["width"]:
                    continue  # Skip if rotated item won't fit
                
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
            
            # Check each position
            for pos in positions:
                pos_x = pos["x"]
                pos_y = pos["y"]
                rotation = pos["rotation"]
                actual_width = item["height"] if rotation == 90 else item["width"]
                actual_height = item["width"] if rotation == 90 else item["height"]
                
                # Check overlap with existing furniture
                overlaps = False
                for placed_item in layout["furniture_placements"]:
                    if self._rectangles_overlap(
                        pos_x, pos_y, actual_width, actual_height,
                        placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                    ):
                        overlaps = True
                        break
                
                # Check overlap with constraints
                for constraint in self.room_analysis.get("constraints", []):
                    if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                        if self._rectangles_overlap(
                            pos_x, pos_y, actual_width, actual_height,
                            constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                        ):
                            overlaps = True
                            break
                
                if not overlaps:
                    # Create placement
                    placement = {
                        "item_id": item["id"],
                        "base_id": item["base_id"],
                        "name": item["name"],
                        "x": pos_x,
                        "y": pos_y,
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
    
    def _filter_available_positions(self, positions: List[Dict[str, Any]], 
                                  width: float, height: float, 
                                  layout: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Filter out positions that would cause overlap or violate constraints.
        
        Args:
            positions: List of potential positions
            width: Width of the item to place
            height: Height of the item to place
            layout: Current layout data
            
        Returns:
            List of valid positions
        """
        available_positions = []
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        for pos in positions:
            pos_x = pos["x"]
            pos_y = pos["y"]
            rotation = pos.get("rotation", 0)
            
            # Adjust dimensions if rotated
            actual_width = height if rotation == 90 else width
            actual_height = width if rotation == 90 else height
            
            # Check if position is inside room boundaries
            if pos_x < 0 or pos_y < 0 or pos_x + actual_width > room_width or pos_y + actual_height > room_length:
                continue
            
            # Check if position overlaps with existing furniture
            overlaps_furniture = False
            for placed_item in layout["furniture_placements"]:
                if self._rectangles_overlap(
                    pos_x, pos_y, actual_width, actual_height,
                    placed_item["x"], placed_item["y"], placed_item["width"], placed_item["height"]
                ):
                    overlaps_furniture = True
                    break
            
            if overlaps_furniture:
                continue
            
            # Check if position overlaps with unusable areas
            overlaps_constraint = False
            for constraint in self.room_analysis.get("constraints", []):
                if constraint.get("type") == ConstraintType.UNUSABLE_AREA.value:
                    if self._rectangles_overlap(
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
    
    def _choose_best_position(self, positions: List[Dict[str, Any]], item: Dict[str, Any]) -> Dict[str, Any]:
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
            
            # Bonus for alignment with kua direction if applicable
            if self.kua_group and "wall_side" in pos:
                wall_side = pos["wall_side"]
                
                # East group prefers E, SE, N, S walls
                if self.kua_group == KuaGroup.EAST:
                    if wall_side in ["east", "south"]:
                        score += 3
                    elif wall_side in ["north"]:
                        score += 2
                # West group prefers W, SW, NW, NE walls
                elif self.kua_group == KuaGroup.WEST:
                    if wall_side in ["west", "north"]:
                        score += 3
                    elif wall_side in ["south"]:
                        score += 1
            
            # Bonus for bagua alignment with item properties
            properties = item.get("feng_shui_properties")
            if properties and "bagua_area" in pos and hasattr(properties, 'ideal_bagua_areas'):
                if pos["bagua_area"] in [area.value for area in properties.ideal_bagua_areas]:
                    score += 2
            
            scored_positions.append((pos, score))
        
        # Sort by score and return the best
        scored_positions.sort(key=lambda x: x[1], reverse=True)
        return scored_positions[0][0]
    
    def _check_for_bad_placements(self, layout: Dict[str, Any]) -> None:
        """
        Check for and add warnings about bad feng shui placements.
        
        Args:
            layout: Layout data to check
        """
        tradeoffs = layout["tradeoffs"]
        placements = layout["furniture_placements"]
        
        # Check for beds under windows
        for placement in placements:
            if "bed" in placement["base_id"].lower():
                for window in self.windows:
                    if self._rectangles_overlap(
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
        
        # Check for mirrors facing beds (bad feng shui)
        for i, item1 in enumerate(placements):
            if "mirror" in item1["base_id"].lower():
                for item2 in placements:
                    if "bed" in item2["base_id"].lower():
                        # Check if mirror is facing the bed
                        # This is simplified - in real life would need to check the actual facing direction
                        if (abs(item1["x"] - item2["x"]) < (item1["width"] + item2["width"]) and
                            abs(item1["y"] - item2["y"]) < (item1["height"] + item2["height"])):
                            tradeoffs.append({
                                "item_id": item1["item_id"],
                                "issue": "mirror_facing_bed",
                                "description": "Mirror is positioned facing the bed, which can disturb sleep",
                                "severity": "high",
                                "mitigation": "Move mirror to a position where it doesn't reflect the bed"
                            })
                            break
        
        # Check for furniture blocking doors
        for item in placements:
            for door in self.doors:
                # Check if furniture is in front of or blocking a door
                door_front_area = {
                    "x": door.get("x", 0) - 1.0,  # 1m clearance in front of door
                    "y": door.get("y", 0) - 1.0,
                    "width": door.get("width", 0) + 2.0,
                    "height": door.get("height", 0) + 2.0
                }
                
                if self._rectangles_overlap(
                    item["x"], item["y"], item["width"], item["height"],
                    door_front_area["x"], door_front_area["y"], door_front_area["width"], door_front_area["height"]
                ):
                    tradeoffs.append({
                        "item_id": item["item_id"],
                        "issue": "blocks_door",
                        "description": f"{item['name']} may block proper door function or energy flow",
                        "severity": "medium",
                        "mitigation": "Ensure at least 1m clearance in front of doors"
                    })
                    break
        
        # Check for desks not in command position
        for item in placements:
            if "desk" in item["base_id"].lower() and not item.get("in_command_position", False):
                tradeoffs.append({
                    "item_id": item["item_id"],
                    "issue": "desk_not_command",
                    "description": "Desk is not in command position, which may reduce productivity",
                    "severity": "medium",
                    "mitigation": "Try to position desk diagonally across from door with solid wall behind"
                })
    
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
        
        # Count key metrics with weighted importance
        command_items = sum(1 for item in layout["furniture_placements"] 
                           if item.get("in_command_position", False))
        
        wall_items = sum(1 for item in layout["furniture_placements"] 
                        if item.get("against_wall", False))
        
        good_quality_items = sum(1 for item in layout["furniture_placements"] 
                               if item.get("feng_shui_quality") in ["excellent", "good"])
        
        # Count items with bad placements (based on tradeoffs)
        bad_placements = {}
        for tradeoff in layout["tradeoffs"]:
            item_id = tradeoff.get("item_id")
            severity = tradeoff.get("severity", "low")
            
            # Only count the worst issue for each item
            if item_id not in bad_placements or severity_value(bad_placements[item_id]) < severity_value(severity):
                bad_placements[item_id] = severity
        
        high_severity_issues = sum(1 for severity in bad_placements.values() if severity == "high")
        medium_severity_issues = sum(1 for severity in bad_placements.values() if severity == "medium")
        low_severity_issues = sum(1 for severity in bad_placements.values() if severity == "low")
        
        # Calculate percentages for positive factors
        command_percent = command_items / total_items * 100 if total_items > 0 else 0
        wall_percent = wall_items / total_items * 100 if total_items > 0 else 0
        quality_percent = good_quality_items / total_items * 100 if total_items > 0 else 0
        
        # Adjust score based on positive factors
        score += command_percent * 0.15  # Up to 15 points for command positions
        score += wall_percent * 0.1      # Up to 10 points for wall placements
        score += quality_percent * 0.1   # Up to 10 points for good quality placements
        
        # Deduct points for bad placements
        score -= high_severity_issues * 8    # -8 points per high severity issue
        score -= medium_severity_issues * 4  # -4 points per medium severity issue
        score -= low_severity_issues * 1     # -1 point per low severity issue
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        return int(score)
    
    def _calculate_kua_number(self, gender: str, birth_year: int, birth_month: int, birth_day: int) -> Optional[int]:
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
            # For males: 10 - (sum of year digits) % 9
            year_sum = sum(int(digit) for digit in str(lunar_year))
            while year_sum > 9:
                year_sum = sum(int(digit) for digit in str(year_sum))
            kua = 10 - year_sum
            if kua == 10:  # Special case
                kua = 1
            elif kua == 5:  # Special case
                kua = 2
        else:  # female
            # For females: (sum of year digits) + 5
            year_sum = sum(int(digit) for digit in str(lunar_year))
            while year_sum > 9:
                year_sum = sum(int(digit) for digit in str(year_sum))
            kua = year_sum + 5
            if kua > 9:  # If over 9, subtract 9
                kua = kua - 9
            elif kua == 5:  # Special case
                kua = 8
        
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
    
    def _get_kua_direction_rotation(self, position: Dict[str, Any]) -> int:
        """
        Determine optimal rotation based on kua number and position.
        
        Args:
            position: Position data with x, y coordinates
            
        Returns:
            Optimal rotation in degrees (0, 90, 180, or 270)
        """
        if not self.kua_group:
            return 0  # Default no rotation
        
        # Get room center
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        room_center_x = room_width / 2
        room_center_y = room_length / 2
        
        # Calculate direction from center
        dx = position["x"] - room_center_x
        dy = position["y"] - room_center_y
        
        # Determine compass direction
        angle = math.degrees(math.atan2(dy, dx)) % 360
        
        # Convert angle to 8 directions
        directions = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"]
        direction_index = round(angle / 45) % 8
        direction = directions[direction_index]
        
        # East group lucky directions: E, SE, S, N
        # West group lucky directions: W, SW, NW, NE
        lucky_directions = {
            KuaGroup.EAST: ["E", "SE", "S", "N"],
            KuaGroup.WEST: ["W", "SW", "NW", "NE"]
        }
        
        # Determine the best rotation to face a lucky direction
        if self.kua_group in lucky_directions:
            current_lucky = direction in lucky_directions[self.kua_group]
            
            if current_lucky:
                return 0  # Already facing a lucky direction
            
            # Try rotations to find a lucky direction
            for rotation in [90, 180, 270]:
                rotated_index = (direction_index + (rotation // 45)) % 8
                rotated_direction = directions[rotated_index]
                
                if rotated_direction in lucky_directions[self.kua_group]:
                    return rotation
        
        return 0  # Default no rotation
    
    def _calculate_command_positions(self) -> List[Dict[str, Any]]:
        """
        Calculate potential command positions in the room.
        Command position: can see the door but not in line with it, solid wall behind.
        
        Returns:
            List of possible command positions
        """
        command_positions = []
        
        # Get room dimensions
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        # Find all doors
        for door in self.doors:
            door_x = door.get("x", 0)
            door_y = door.get("y", 0)
            door_width = door.get("width", 0)
            door_height = door.get("height", 0)
            
            # Calculate door center
            door_center_x = door_x + door_width / 2
            door_center_y = door_y + door_height / 2
            
            # Determine which wall the door is on
            is_north_wall = door_y < room_length * 0.25
            is_south_wall = door_y > room_length * 0.75
            is_east_wall = door_x > room_width * 0.75
            is_west_wall = door_x < room_width * 0.25
            
            # Generate potential command positions based on door location
            if is_north_wall:
                # Door on north wall - try south and diagonal positions
                positions = [
                    {
                        "x": door_center_x + room_width * 0.25,
                        "y": room_length * 0.75,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    },
                    {
                        "x": door_center_x - room_width * 0.25,
                        "y": room_length * 0.75,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    }
                ]
                command_positions.extend(positions)
            
            if is_south_wall:
                # Door on south wall - try north and diagonal positions
                positions = [
                    {
                        "x": door_center_x + room_width * 0.25,
                        "y": room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    },
                    {
                        "x": door_center_x - room_width * 0.25,
                        "y": room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    }
                ]
                command_positions.extend(positions)
            
            if is_east_wall:
                # Door on east wall - try west and diagonal positions
                positions = [
                    {
                        "x": room_width * 0.25,
                        "y": door_center_y + room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    },
                    {
                        "x": room_width * 0.25,
                        "y": door_center_y - room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    }
                ]
                command_positions.extend(positions)
            
            if is_west_wall:
                # Door on west wall - try east and diagonal positions
                positions = [
                    {
                        "x": room_width * 0.75,
                        "y": door_center_y + room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    },
                    {
                        "x": room_width * 0.75,
                        "y": door_center_y - room_length * 0.25,
                        "quality": "good",
                        "has_wall_behind": True,
                        "suitable_for": ["bed", "desk"]
                    }
                ]
                command_positions.extend(positions)
        
        # Check wall support for each position
        for position in command_positions:
            # The position might already have wall_behind info from above
            if "has_wall_behind" not in position:
                position["has_wall_behind"] = self._check_wall_support(position["x"], position["y"])
            
            # Quality boost if position has wall support
            if position["has_wall_behind"]:
                position["quality"] = "excellent" if position["quality"] == "good" else position["quality"]
        
        return command_positions
    
    def _check_wall_support(self, x: float, y: float) -> bool:
        """
        Check if a position has solid wall support behind it.
        
        Args:
            x: X coordinate
            y: Y coordinate
            
        Returns:
            True if position has wall support, False otherwise
        """
        # Get room dimensions
        room_width = self.room_analysis.get("dimensions", {}).get("width", 0)
        room_length = self.room_analysis.get("dimensions", {}).get("length", 0)
        
        # Check if position is near room boundary (simplified approach)
        near_north = y < room_length * 0.1
        near_south = y > room_length * 0.9
        near_east = x > room_width * 0.9
        near_west = x < room_width * 0.1
        
        if near_north or near_south or near_east or near_west:
            return True
        
        # Check against defined walls
        for wall in self.walls:
            wall_x = wall.get("x", 0)
            wall_y = wall.get("y", 0)
            wall_width = wall.get("width", 0)
            wall_height = wall.get("height", 0)
            
            # Check if position is near this wall
            if (abs(x - wall_x) < 0.5 or abs(x - (wall_x + wall_width)) < 0.5 or
                abs(y - wall_y) < 0.5 or abs(y - (wall_y + wall_height)) < 0.5):
                return True
        
        return False
    
    def _get_furniture_type(self, furniture_id: str) -> str:
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
        else:
            return "other"
    
    def _rectangles_overlap(self, x1: float, y1: float, w1: float, h1: float, 
                          x2: float, y2: float, w2: float, h2: float) -> bool:
        """
        Check if two rectangles overlap.
        
        Args:
            x1, y1, w1, h1: First rectangle coordinates and dimensions
            x2, y2, w2, h2: Second rectangle coordinates and dimensions
            
        Returns:
            True if rectangles overlap, False otherwise
        """
        return not (x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1)
    
    def _rectangle_line_intersection(self, rect_x: float, rect_y: float, rect_w: float, rect_h: float,
                                   line_x1: float, line_y1: float, line_x2: float, line_y2: float) -> bool:
        """
        Check if a rectangle intersects with a line segment.
        
        Args:
            rect_x, rect_y, rect_w, rect_h: Rectangle coordinates and dimensions
            line_x1, line_y1, line_x2, line_y2: Line segment endpoints
            
        Returns:
            True if rectangle and line intersect, False otherwise
        """
        # Convert line to a rectangle with some thickness
        line_thickness = 0.3  # 30cm
        
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
        return self._rectangles_overlap(
            rect_x, rect_y, rect_w, rect_h,
            line_min_x, line_min_y, line_max_x - line_min_x, line_max_y - line_min_y
        )


# Helper function for tradeoff severity comparison
def severity_value(severity: str) -> int:
    """Convert severity string to numerical value for comparison."""
    values = {"high": 3, "medium": 2, "low": 1}
    return values.get(severity, 0)