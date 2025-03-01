"""
Room Analysis Service - Processes room dimensions, highlighted elements, and directional data.
Maps room to feng shui bagua areas and analyzes spatial constraints.

This service contains core feng shui spatial analysis, identifying command positions,
energy flow paths, and bagua area mapping based on compass orientation.
"""
from typing import Dict, List, Tuple, Any, Optional
import math
import logging
from enum import Enum

# Import furniture mapping to integrate with room analysis
from app.services.furniture_mapping import BaguaArea

logger = logging.getLogger(__name__)

# Direction enumeration
class Direction(Enum):
    NORTH = "N"
    EAST = "E"
    SOUTH = "S"
    WEST = "W"
    NORTHEAST = "NE"
    SOUTHEAST = "SE"
    SOUTHWEST = "SW"
    NORTHWEST = "NW"
    CENTER = "C"

# Element type enumeration
class ElementType(Enum):
    WALL = "wall"
    DOOR = "door"
    WINDOW = "window"
    CLOSET = "closet"
    COLUMN = "column"
    FIREPLACE = "fireplace"
    RADIATOR = "radiator"
    NO_FURNITURE = "nofurniture"

# Room constraint types
class ConstraintType(Enum):
    UNUSABLE_AREA = "unusable_area"  # Area that cannot be used for furniture
    TRAFFIC_FLOW = "traffic_flow"    # Area that should be kept clear for movement
    DOOR_SWING = "door_swing"        # Area needed for door to open/close
    FENG_SHUI_ISSUE = "feng_shui_issue"  # Area with negative feng shui energy

class RoomAnalyzer:
    def __init__(self, room_data: Dict[str, Any]):
        """
        Initialize the room analyzer with room data from the frontend.
        
        Args:
            room_data: Dictionary containing room dimensions, compass orientation, and elements
        """
        self.room_width = room_data.get('dimensions', {}).get('width', 0)  # meters
        self.room_length = room_data.get('dimensions', {}).get('length', 0)  # meters
        self.compass_orientation = room_data.get('compass', {}).get('orientation')
        self.elements = room_data.get('elements', [])
        self.room_type = room_data.get('roomType')
        
        # Calculate room area
        self.room_area = self.room_width * self.room_length  # square meters
        
        # Initialize empty constraints list
        self.constraints = []
        
        # Validate data
        if self.room_width <= 0 or self.room_length <= 0:
            raise ValueError("Invalid room dimensions: width and length must be positive")
        
        if not self.compass_orientation:
            logger.warning("No compass orientation provided, defaulting to North")
            self.compass_orientation = "N"
    
    def analyze_room(self) -> Dict[str, Any]:
        """
        Analyze the room and return a comprehensive analysis.
        
        Returns:
            Dictionary containing room analysis results
        """
        # Process each step of analysis
        self._identify_constraints()
        bagua_map = self._create_bagua_map()
        usable_spaces = self._identify_usable_spaces()
        command_positions = self._identify_command_positions()
        energy_flows = self._analyze_energy_flow()
        
        # Return the complete analysis
        return {
            "dimensions": {
                "width": self.room_width,
                "length": self.room_length,
                "area": self.room_area,
                "units": "meters"
            },
            "orientation": self.compass_orientation,
            "bagua_map": bagua_map,
            "constraints": self.constraints,
            "usable_spaces": usable_spaces,
            "command_positions": command_positions,
            "energy_flow": energy_flows,
            "room_type": self.room_type
        }
    
    def _identify_constraints(self) -> None:
        """
        Identify spatial constraints based on highlighted elements.
        Updates self.constraints list.
        """
        for element in self.elements:
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
                self._add_constraint(
                    constraint_type=ConstraintType.UNUSABLE_AREA,
                    x=x, y=y, width=width, height=height,
                    description="Wall - cannot place furniture here"
                )
            
            elif element_type == ElementType.DOOR.value:
                # Doors create traffic flow constraints and door swing areas
                self._add_constraint(
                    constraint_type=ConstraintType.TRAFFIC_FLOW,
                    x=x-50, y=y-50, width=width+100, height=height+100,  # Add buffer for traffic flow
                    description="Door - keep area clear for traffic"
                )
                
                # Add door swing constraint (approximation)
                door_swing_width = max(width, height)
                self._add_constraint(
                    constraint_type=ConstraintType.DOOR_SWING,
                    x=x, y=y, width=door_swing_width, height=door_swing_width,
                    description="Door swing area"
                )
            
            elif element_type == ElementType.WINDOW.value:
                # Windows need access and create energy points
                self._add_constraint(
                    constraint_type=ConstraintType.TRAFFIC_FLOW,
                    x=x, y=y, width=width, height=height,
                    description="Window - keep area accessible"
                )
            
            elif element_type == ElementType.FIREPLACE.value:
                # Fireplaces create unusable areas and feng shui considerations
                self._add_constraint(
                    constraint_type=ConstraintType.UNUSABLE_AREA,
                    x=x, y=y, width=width, height=height,
                    description="Fireplace - cannot place furniture here"
                )
                
                # Add feng shui constraint for area in front of fireplace
                self._add_constraint(
                    constraint_type=ConstraintType.FENG_SHUI_ISSUE,
                    x=x-width/2, y=y+height, width=width*2, height=height,
                    description="Fireplace front - avoid placing bed/desk in this area"
                )
            
            elif element_type == ElementType.NO_FURNITURE.value:
                # Explicitly marked no-furniture zones
                self._add_constraint(
                    constraint_type=ConstraintType.UNUSABLE_AREA,
                    x=x, y=y, width=width, height=height,
                    description="No furniture zone"
                )
            
            elif element_type in (ElementType.CLOSET.value, ElementType.COLUMN.value, ElementType.RADIATOR.value):
                # Other fixed elements create unusable areas
                self._add_constraint(
                    constraint_type=ConstraintType.UNUSABLE_AREA,
                    x=x, y=y, width=width, height=height,
                    description=f"{element_type.capitalize()} - cannot place furniture here"
                )
    
    def _add_constraint(self, constraint_type: ConstraintType, x: float, y: float, 
                       width: float, height: float, description: str) -> None:
        """
        Add a constraint to the constraints list.
        
        Args:
            constraint_type: Type of constraint (unusable area, traffic flow, etc.)
            x, y: Position of constraint
            width, height: Size of constraint
            description: Description of the constraint
        """
        self.constraints.append({
            "type": constraint_type.value,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "description": description
        })
    
    def _create_bagua_map(self) -> Dict[str, Dict[str, Any]]:
        """
        Create a bagua map for the room based on compass orientation.
        
        Returns:
            Dictionary mapping bagua areas to their coordinates and attributes
        """
        # Divide room into a 3x3 grid for bagua mapping
        third_width = self.room_width / 3
        third_length = self.room_length / 3
        
        # Create bagua sectors based on compass orientation
        # The mapping depends on which direction is at the top of the floor plan
        bagua_sectors = {}
        
        # Default mapping (North orientation - North is at the top of the plan)
        if self.compass_orientation == Direction.NORTH.value:
            # Row 1 (top)
            bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
            
            # Row 2 (middle)
            bagua_sectors[BaguaArea.FAMILY.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CHILDREN.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
            
            # Row 3 (bottom)
            bagua_sectors[BaguaArea.WEALTH.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.FAME.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.RELATIONSHIPS.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
        
        # East orientation - East is at the top of the plan
        elif self.compass_orientation == Direction.EAST.value:
            # Rotate the bagua map 90 degrees counterclockwise
            # Row 1 (top)
            bagua_sectors[BaguaArea.FAMILY.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.HEALTH.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.WEALTH.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
            
            # Row 2 (middle)
            bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.FAME.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
            
            # Row 3 (bottom)
            bagua_sectors[BaguaArea.CAREER.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CHILDREN.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
        
        # South orientation - South is at the top of the plan
        elif self.compass_orientation == Direction.SOUTH.value:
            # Rotate the bagua map 180 degrees
            # Row 1 (top)
            bagua_sectors[BaguaArea.RELATIONSHIPS.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.FAME.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.WEALTH.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
            
            # Row 2 (middle)
            bagua_sectors[BaguaArea.CHILDREN.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.FAMILY.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
            
            # Row 3 (bottom)
            bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
        
        # West orientation - West is at the top of the plan
        elif self.compass_orientation == Direction.WEST.value:
            # Rotate the bagua map 90 degrees clockwise
            # Row 1 (top)
            bagua_sectors[BaguaArea.CHILDREN.value] = {"x": 0, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.HELPFUL_PEOPLE.value] = {"x": third_width, "y": 0, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CAREER.value] = {"x": third_width*2, "y": 0, "width": third_width, "height": third_length}
            
            # Row 2 (middle)
            bagua_sectors[BaguaArea.FAME.value] = {"x": 0, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.CENTER.value] = {"x": third_width, "y": third_length, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.KNOWLEDGE.value] = {"x": third_width*2, "y": third_length, "width": third_width, "height": third_length}
            
            # Row 3 (bottom)
            bagua_sectors[BaguaArea.WEALTH.value] = {"x": 0, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.HEALTH.value] = {"x": third_width, "y": third_length*2, "width": third_width, "height": third_length}
            bagua_sectors[BaguaArea.FAMILY.value] = {"x": third_width*2, "y": third_length*2, "width": third_width, "height": third_length}
        
        # Add feng shui element associations to each bagua area
        bagua_elements = {
            BaguaArea.CAREER.value: {"element": "water", "life_area": "career", "colors": ["black", "blue"]},
            BaguaArea.KNOWLEDGE.value: {"element": "earth", "life_area": "wisdom", "colors": ["blue", "green"]},
            BaguaArea.FAMILY.value: {"element": "wood", "life_area": "family", "colors": ["green"]},
            BaguaArea.WEALTH.value: {"element": "wood", "life_area": "prosperity", "colors": ["purple", "green"]},
            BaguaArea.FAME.value: {"element": "fire", "life_area": "reputation", "colors": ["red"]},
            BaguaArea.RELATIONSHIPS.value: {"element": "earth", "life_area": "love", "colors": ["pink", "red", "white"]},
            BaguaArea.CHILDREN.value: {"element": "metal", "life_area": "creativity", "colors": ["white", "grey"]},
            BaguaArea.HELPFUL_PEOPLE.value: {"element": "metal", "life_area": "travel", "colors": ["grey", "white"]},
            BaguaArea.CENTER.value: {"element": "earth", "life_area": "health", "colors": ["yellow", "brown"]}
        }
        
        # Merge coordinates with element information
        for area, coords in bagua_sectors.items():
            if area in bagua_elements:
                bagua_sectors[area].update(bagua_elements[area])
        
        return bagua_sectors
    
    def _identify_usable_spaces(self) -> List[Dict[str, Any]]:
        """
        Identify usable spaces for furniture placement based on constraints.
        
        Returns:
            List of dictionaries containing usable space coordinates and attributes
        """
        # Start with the entire room as usable
        usable_spaces = [{
            "x": 0,
            "y": 0,
            "width": self.room_width,
            "height": self.room_length,
            "area": self.room_area,
            "quality": "excellent"  # Default quality
        }]
        
        # Remove unusable areas by splitting spaces
        for constraint in self.constraints:
            if constraint["type"] == ConstraintType.UNUSABLE_AREA.value:
                # For each unusable area, split existing usable spaces if they overlap
                new_usable_spaces = []
                for space in usable_spaces:
                    # Check if constraint overlaps with this space
                    if self._rectangles_overlap(
                        space["x"], space["y"], space["width"], space["height"],
                        constraint["x"], constraint["y"], constraint["width"], constraint["height"]
                    ):
                        # Split this space and add the resulting spaces
                        split_spaces = self._split_space_around_constraint(space, constraint)
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
            for constraint in self.constraints:
                if constraint["type"] == ConstraintType.TRAFFIC_FLOW.value:
                    if self._rectangles_overlap(
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
    
    def _identify_command_positions(self) -> List[Dict[str, Any]]:
        """
        Identify command positions for bed and desk placements.
        These are positions that face the door but are not in direct alignment,
        and ideally have a solid wall behind.
        
        Returns:
            List of dictionaries containing command position coordinates and attributes
        """
        command_positions = []
        
        # Find all doors in the room
        doors = [e for e in self.elements if e.get('element_type') == ElementType.DOOR.value]
        
        # Find all walls in the room
        walls = [e for e in self.elements if e.get('element_type') == ElementType.WALL.value]
        
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
                {"x": door_center_x + self.room_width * 0.3, "y": door_center_y + self.room_length * 0.3},
                {"x": door_center_x + self.room_width * 0.3, "y": door_center_y - self.room_length * 0.3},
                {"x": door_center_x - self.room_width * 0.3, "y": door_center_y + self.room_length * 0.3},
                {"x": door_center_x - self.room_width * 0.3, "y": door_center_y - self.room_length * 0.3}
            ]
            
            # Filter positions to keep only those inside the room
            diagonal_positions = [
                pos for pos in diagonal_positions
                if 0 <= pos["x"] <= self.room_width and 0 <= pos["y"] <= self.room_length
            ]
            
            # Evaluate each potential position
            for pos in diagonal_positions:
                position_quality = "good"  # Default quality
                has_wall_behind = False
                
                # Check if position has a wall behind it
                for wall in walls:
                    wall_x = wall.get('x')
                    wall_y = wall.get('y')
                    wall_width = wall.get('width')
                    wall_height = wall.get('height')
                    
                    # Simple check - is the position near a wall?
                    # This is a simplification - in a real system, you'd need more sophisticated checks
                    wall_distance = min(
                        abs(pos["x"] - wall_x), abs(pos["x"] - (wall_x + wall_width)),
                        abs(pos["y"] - wall_y), abs(pos["y"] - (wall_y + wall_height))
                    )
                    
                    if wall_distance < 0.5:  # Within 0.5 meters of a wall
                        has_wall_behind = True
                        position_quality = "excellent"
                        break
                
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
    
    def _analyze_energy_flow(self) -> Dict[str, Any]:
        """
        Analyze energy flow in the room, identifying paths and potential issues.
        
        Returns:
            Dictionary containing energy flow analysis
        """
        # Find all doors in the room
        doors = [e for e in self.elements if e.get('element_type') == ElementType.DOOR.value]
        
        # Find all windows in the room
        windows = [e for e in self.elements if e.get('element_type') == ElementType.WINDOW.value]
        
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
        
        # Calculate potential energy flow paths (simplified)
        flow_paths = []
        energy_issues = []
        
        # For simplicity, we'll create flow paths from each entry point to the center of the room
        room_center_x = self.room_width / 2
        room_center_y = self.room_length / 2
        
        for entry_point in energy_entry_points:
            # Create a path from entry point to room center
            flow_paths.append({
                "start_x": entry_point["x"],
                "start_y": entry_point["y"],
                "end_x": room_center_x,
                "end_y": room_center_y,
                "strength": entry_point["strength"]
            })
            
            # Check for direct alignment issues (doors directly facing each other)
            if entry_point["type"] == "door":
                for other_entry in energy_entry_points:
                    if other_entry["type"] == "door" and other_entry != entry_point:
                        # Calculate if doors are aligned
                        is_x_aligned = abs(entry_point["x"] - other_entry["x"]) < 0.5
                        is_y_aligned = abs(entry_point["y"] - other_entry["y"]) < 0.5
                        
                        if is_x_aligned or is_y_aligned:
                            energy_issues.append({
                                "type": "door_alignment",
                                "description": "Doors are directly aligned, creating too rapid energy flow",
                                "severity": "high",
                                "x1": entry_point["x"],
                                "y1": entry_point["y"],
                                "x2": other_entry["x"],
                                "y2": other_entry["y"]
                            })
        
        return {
            "flow_paths": flow_paths,
            "energy_entry_points": energy_entry_points,
            "energy_issues": energy_issues
        }
    
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
    
    def _split_space_around_constraint(self, space: Dict[str, Any], constraint: Dict[str, Any]) -> List[Dict[str, Any]]:
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