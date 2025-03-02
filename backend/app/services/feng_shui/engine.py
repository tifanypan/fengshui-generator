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
from typing import Dict, List, Any, Optional
import logging
from .enums import LayoutStrategy
from .layout_generator import LayoutGenerator
from .kua_calculator import calculate_kua_number, get_kua_group

logger = logging.getLogger(__name__)


class FengShuiEngine:
    """
    Main entry point for feng shui-based room layout generation.
    Coordinates room analysis and furniture placement.
    """
    
    def __init__(self, room_analysis: Dict[str, Any], furniture_selections: Dict[str, Any], 
                occupants: List[Dict[str, Any]] = None):
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
            self.kua_number = calculate_kua_number(
                self.primary_occupant.get('gender'),
                self.primary_occupant.get('birth_year'),
                self.primary_occupant.get('birth_month'),
                self.primary_occupant.get('birth_day')
            )
            self.kua_group = get_kua_group(self.kua_number)
        
        # Store layouts
        self.layouts = {}
        
        # Special considerations
        self.special_considerations = furniture_selections.get('specialConsiderations', {})
        
        # Create a layout generator
        self.layout_generator = LayoutGenerator(
            room_analysis, furniture_selections, occupants
        )
    
    def generate_layouts(self, primary_life_goal: str = None) -> Dict[str, Any]:
        """
        Generate multiple feng shui layouts based on different strategies.
        
        Args:
            primary_life_goal: Optional life goal to prioritize (premium feature)
            
        Returns:
            Dictionary containing multiple layout options
        """
        # Use the layout generator to create layouts
        layouts = self.layout_generator.generate_layouts(primary_life_goal)
        
        # Store layouts for future reference
        self.layouts = {
            layout["id"]: layout 
            for layout_key, layout in layouts.items() 
            if isinstance(layout, dict) and "id" in layout
        }
        
        return layouts
    
    def modify_layout(self, layout_id: str, modifications: Dict[str, Any]) -> Dict[str, Any]:
        """
        Modify an existing layout with user adjustments.
        
        Args:
            layout_id: ID of the layout to modify
            modifications: User-specified modifications to apply
            
        Returns:
            Updated layout
        """
        # Check if layout exists
        if layout_id not in self.layouts:
            logger.error(f"Layout with ID {layout_id} not found")
            return {"error": "Layout not found"}
        
        # Get the layout to modify
        layout = self.layouts[layout_id].copy()
        
        # Process furniture modifications
        if "furniture_placements" in modifications:
            for mod in modifications["furniture_placements"]:
                item_id = mod.get("item_id")
                
                # Find the item in the layout
                item_index = next(
                    (i for i, item in enumerate(layout["furniture_placements"]) 
                     if item["item_id"] == item_id),
                    None
                )
                
                if item_index is not None:
                    # Update placement
                    for key, value in mod.items():
                        if key != "item_id":
                            layout["furniture_placements"][item_index][key] = value
        
        # Re-validate modified layout (simplified)
        self._validate_modified_layout(layout)
        
        # Recalculate feng shui score
        layout["feng_shui_score"] = self._calculate_layout_score(layout)
        
        # Update stored layout
        self.layouts[layout_id] = layout
        
        return layout
    
    def _validate_modified_layout(self, layout: Dict[str, Any]) -> None:
        """
        Validate a user-modified layout and add warnings for feng shui issues.
        
        Args:
            layout: Modified layout to validate
        """
        # Clear existing tradeoffs
        layout["tradeoffs"] = []
        
        # Simplified validation - check for overlaps and bad placements
        furniture_placements = layout.get("furniture_placements", [])
        
        # Check for furniture overlaps
        from .furniture.utils import check_for_bad_placements
        for i, item1 in enumerate(furniture_placements):
            # Check for overlaps with other furniture
            for j, item2 in enumerate(furniture_placements):
                if i != j:
                    from .geometry_utils import rectangles_overlap
                    if rectangles_overlap(
                        item1["x"], item1["y"], item1["width"], item1["height"],
                        item2["x"], item2["y"], item2["width"], item2["height"]
                    ):
                        layout["tradeoffs"].append({
                            "item_id": item1["item_id"],
                            "issue": "furniture_overlap",
                            "description": f"{item1['name']} overlaps with {item2['name']}",
                            "severity": "high",
                            "mitigation": "Move furniture to avoid overlaps"
                        })
            
            # Check for bad feng shui placements
            bad_placements = check_for_bad_placements(
                {"id": item1["item_id"], "base_id": item1["base_id"], "name": item1["name"]},
                item1,
                self.room_analysis.get("elements", [])
            )
            layout["tradeoffs"].extend(bad_placements)
    
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
        total_items = len(layout.get("furniture_placements", []))
        if total_items == 0:
            return 0
        
        # Count key metrics with weighted importance
        command_items = sum(1 for item in layout.get("furniture_placements", []) 
                           if item.get("in_command_position", False))
        
        wall_items = sum(1 for item in layout.get("furniture_placements", []) 
                        if item.get("against_wall", False))
        
        good_quality_items = sum(1 for item in layout.get("furniture_placements", []) 
                               if item.get("feng_shui_quality") in ["excellent", "good"])
        
        # Count items with bad placements (based on tradeoffs)
        from .enums import severity_value
        
        bad_placements = {}
        for tradeoff in layout.get("tradeoffs", []):
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