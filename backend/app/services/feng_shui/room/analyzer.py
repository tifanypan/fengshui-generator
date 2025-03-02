"""
Room Analyzer - Main module for feng shui room analysis.
Coordinates the analysis of room dimensions, elements, and feng shui principles.
"""
from typing import Dict, List, Tuple, Any
import logging

from .enums import Direction
from .constraints import identify_constraints, merge_overlapping_constraints
from .bagua_mapper import create_bagua_map
from .usable_spaces import identify_usable_spaces
from .command_positions import identify_command_positions
from .energy_analyzer import analyze_energy_flow

logger = logging.getLogger(__name__)


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
        constraints = identify_constraints(self.elements)
        constraints = merge_overlapping_constraints(constraints)
        
        bagua_map = create_bagua_map(
            self.room_width, 
            self.room_length, 
            self.compass_orientation
        )
        
        usable_spaces = identify_usable_spaces(
            self.room_width, 
            self.room_length, 
            constraints
        )
        
        command_positions = identify_command_positions(
            self.elements, 
            self.room_width, 
            self.room_length
        )
        
        energy_flows = analyze_energy_flow(
            self.elements, 
            self.room_width, 
            self.room_length
        )
        
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
            "constraints": constraints,
            "usable_spaces": usable_spaces,
            "command_positions": command_positions,
            "energy_flow": energy_flows,
            "room_type": self.room_type,
            "elements": self.elements
        }
    
    def get_optimal_furniture_placement_areas(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get optimal areas for different furniture types based on feng shui principles.
        
        Returns:
            Dictionary mapping furniture types to optimal placement areas
        """
        # First do full room analysis
        analysis = self.analyze_room()
        
        # Get areas based on furniture type
        optimal_areas = {
            "bed": [],
            "desk": [],
            "sofa": [],
            "storage": [],
            "dining": []
        }
        
        # Use command positions for bed, desk, sofa
        for pos in analysis.get("command_positions", []):
            if "bed" in pos.get("suitable_for", []):
                optimal_areas["bed"].append({
                    "x": pos["x"],
                    "y": pos["y"],
                    "quality": pos["quality"],
                    "has_wall_behind": pos.get("has_wall_behind", False)
                })
            
            if "desk" in pos.get("suitable_for", []):
                optimal_areas["desk"].append({
                    "x": pos["x"],
                    "y": pos["y"],
                    "quality": pos["quality"],
                    "has_wall_behind": pos.get("has_wall_behind", False)
                })
        
        # For storage, use areas near walls
        for space in analysis.get("usable_spaces", []):
            # Check if space is near a wall
            x = space["x"]
            y = space["y"]
            width = space["width"]
            height = space["height"]
            
            # Simplistic check - is any edge near room boundary?
            near_wall = (
                x < 0.5 or  # Near west wall
                y < 0.5 or  # Near north wall
                x + width > self.room_width - 0.5 or  # Near east wall
                y + height > self.room_length - 0.5  # Near south wall
            )
            
            if near_wall and space["area"] >= 1.0:
                optimal_areas["storage"].append({
                    "x": x + width / 2,  # Use center point
                    "y": y + height / 2,
                    "width": width,
                    "height": height,
                    "quality": space["quality"]
                })
        
        # Dining areas should be in prosperity/wealth or family sectors if possible
        bagua_map = analysis.get("bagua_map", {})
        wealth_area = bagua_map.get("wealth", {})
        family_area = bagua_map.get("family", {})
        
        for area_name, area in [("wealth", wealth_area), ("family", family_area)]:
            if area:
                # Check if this bagua area has usable space
                for space in analysis.get("usable_spaces", []):
                    # Simple check - is space center within this bagua area?
                    space_center_x = space["x"] + space["width"] / 2
                    space_center_y = space["y"] + space["height"] / 2
                    
                    in_bagua_area = (
                        area.get("x", 0) <= space_center_x < area.get("x", 0) + area.get("width", 0) and
                        area.get("y", 0) <= space_center_y < area.get("y", 0) + area.get("height", 0)
                    )
                    
                    if in_bagua_area and space["area"] >= 4.0:  # Need larger space for dining
                        optimal_areas["dining"].append({
                            "x": space_center_x,
                            "y": space_center_y,
                            "quality": space["quality"],
                            "bagua_area": area_name
                        })
        
        return optimal_areas
    
    def get_room_feng_shui_score(self) -> Dict[str, Any]:
        """
        Calculate overall feng shui score for the room.
        
        Returns:
            Dictionary with overall score and component scores
        """
        # Get room analysis
        analysis = self.analyze_room()
        
        # Initialize scores
        scores = {
            "overall": 0,
            "components": {
                "layout": 0,
                "energy_flow": 0,
                "command_positions": 0,
                "balance": 0
            },
            "issues": []
        }
        
        # Score layout (based on room shape and usable space)
        usable_area = sum(space.get("area", 0) for space in analysis.get("usable_spaces", []))
        room_area = analysis.get("dimensions", {}).get("area", 0)
        
        if room_area > 0:
            # Calculate percent of usable space
            usable_percent = (usable_area / room_area) * 100
            
            # Score based on usable percent
            if usable_percent >= 80:
                scores["components"]["layout"] = 90
            elif usable_percent >= 70:
                scores["components"]["layout"] = 80
            elif usable_percent >= 60:
                scores["components"]["layout"] = 70
            elif usable_percent >= 50:
                scores["components"]["layout"] = 60
            else:
                scores["components"]["layout"] = 50
        
        # Score energy flow (based on issues)
        energy_issues = analysis.get("energy_flow", {}).get("energy_issues", [])
        energy_issue_count = len(energy_issues)
        
        if energy_issue_count == 0:
            scores["components"]["energy_flow"] = 90
        elif energy_issue_count <= 2:
            scores["components"]["energy_flow"] = 75
        elif energy_issue_count <= 4:
            scores["components"]["energy_flow"] = 60
        else:
            scores["components"]["energy_flow"] = 45
        
        # Add issues to the list
        for issue in energy_issues:
            scores["issues"].append({
                "type": "energy_flow",
                "description": issue.get("description", "Energy flow issue"),
                "severity": issue.get("severity", "medium")
            })
        
        # Score command positions
        command_positions = analysis.get("command_positions", [])
        excellent_command = sum(1 for p in command_positions if p.get("quality") == "excellent")
        good_command = sum(1 for p in command_positions if p.get("quality") == "good")
        
        if excellent_command >= 2:
            scores["components"]["command_positions"] = 90
        elif excellent_command >= 1:
            scores["components"]["command_positions"] = 80
        elif good_command >= 2:
            scores["components"]["command_positions"] = 70
        elif good_command >= 1:
            scores["components"]["command_positions"] = 60
        elif command_positions:
            scores["components"]["command_positions"] = 50
        else:
            scores["components"]["command_positions"] = 30
            scores["issues"].append({
                "type": "command_position",
                "description": "No good command positions found",
                "severity": "high"
            })
        
        # Score balance (simplified - based on room proportions)
        room_width = analysis.get("dimensions", {}).get("width", 0)
        room_length = analysis.get("dimensions", {}).get("length", 0)
        
        if room_width > 0 and room_length > 0:
            # Calculate aspect ratio
            aspect_ratio = max(room_width, room_length) / min(room_width, room_length)
            
            if 1.0 <= aspect_ratio <= 1.5:
                scores["components"]["balance"] = 90  # Nearly square is good
            elif aspect_ratio <= 2.0:
                scores["components"]["balance"] = 70  # Moderately rectangular
            else:
                scores["components"]["balance"] = 50  # Too long and narrow
                scores["issues"].append({
                    "type": "balance",
                    "description": "Room is too long and narrow",
                    "severity": "medium"
                })
        
        # Calculate overall score (weighted average)
        weights = {
            "layout": 0.3,
            "energy_flow": 0.3,
            "command_positions": 0.25,
            "balance": 0.15
        }
        
        overall_score = sum(
            scores["components"][component] * weight
            for component, weight in weights.items()
        )
        
        scores["overall"] = round(overall_score)
        
        return scores