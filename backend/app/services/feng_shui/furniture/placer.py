"""
Furniture Placer - Main module for coordinating furniture placement in feng shui layouts.
Orchestrates different placement strategies based on furniture types and feng shui rules.
"""
from typing import Dict, List, Any, Optional
import logging

from ..enums import LayoutStrategy, KuaGroup
from .command_position import place_in_command_position
from .wall_placement import place_against_wall
from .energy_flow_placement import place_with_energy_flow
from .small_item_placement import place_small_item
from .general_placement import place_furniture_general, try_alternative_placement
from .utils import get_furniture_type

logger = logging.getLogger(__name__)


class FurniturePlacer:
    """
    Coordinates placement of furniture in a room according to feng shui principles.
    Handles multiple placement strategies and prioritizes items based on their feng shui significance.
    """
    
    def __init__(self, room_analysis: Dict[str, Any], furniture_selections: Dict[str, Any], 
                kua_group: Optional[KuaGroup] = None, primary_life_goal: str = None):
        """
        Initialize the furniture placer with room data and furniture selections.
        
        Args:
            room_analysis: Complete room analysis data
            furniture_selections: Selected furniture items with quantities
            kua_group: Optional kua group for personalized direction preferences
            primary_life_goal: Optional life goal to prioritize 
        """
        self.room_analysis = room_analysis
        self.furniture_selections = furniture_selections
        self.kua_group = kua_group
        self.primary_life_goal = primary_life_goal
        
        # Extract key room data for quick access
        self.room_width = room_analysis.get("dimensions", {}).get("width", 0)
        self.room_length = room_analysis.get("dimensions", {}).get("length", 0)
        self.elements = room_analysis.get("elements", [])
        self.command_positions = room_analysis.get("command_positions", [])
        self.usable_spaces = room_analysis.get("usable_spaces", [])
        self.energy_flows = room_analysis.get("energy_flow", {})
        self.bagua_map = room_analysis.get("bagua_map", {})
    
    def place_all_furniture(self, strategy: LayoutStrategy) -> Dict[str, Any]:
        """
        Place all furniture items according to the specified strategy.
        
        Args:
            strategy: Layout strategy to use
            
        Returns:
            Dictionary containing complete layout data
        """
        # Initialize the layout
        layout = {
            "furniture_placements": [],
            "tradeoffs": [],
            "feng_shui_score": 0
        }
        
        # Extract furniture items from selections
        all_items = self._extract_furniture_items()
        
        # Categorize furniture items by type and priority
        command_items, wall_items, large_items, small_items = self._categorize_furniture(all_items)
        
        # Place command position items first (beds, desks, etc.)
        for item in command_items:
            placement = place_in_command_position(
                item, layout, 
                self.command_positions, 
                self.elements, 
                self.kua_group
            )
            
            # If command position placement failed, try general placement as fallback
            if not placement and strategy != LayoutStrategy.OPTIMAL:
                placement = place_furniture_general(
                    item, layout, strategy, 
                    self.usable_spaces, self.elements,
                    self.room_width, self.room_length
                )
            
            # Last resort placement
            if not placement and strategy == LayoutStrategy.SPACE_CONSCIOUS:
                placement = try_alternative_placement(
                    item, layout, 
                    self.room_width, self.room_length
                )
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place wall furniture next (bookcases, dressers, etc.)
        for item in wall_items:
            placement = place_against_wall(
                item, layout, strategy, 
                self.walls if hasattr(self, 'walls') else [], 
                self.elements,
                self.room_width, self.room_length,
                self.kua_group
            )
            
            # Fallback to general placement if needed
            if not placement:
                placement = place_furniture_general(
                    item, layout, strategy, 
                    self.usable_spaces, self.elements,
                    self.room_width, self.room_length
                )
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place large furniture considering energy flow
        for item in large_items:
            placement = place_with_energy_flow(
                item, layout, strategy, 
                self.energy_flows, self.elements,
                self.room_width, self.room_length,
                self.primary_life_goal
            )
            
            # Fallback to general placement if needed
            if not placement:
                placement = place_furniture_general(
                    item, layout, strategy, 
                    self.usable_spaces, self.elements,
                    self.room_width, self.room_length
                )
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Place small items last (plants, lamps, small tables, etc.)
        for item in small_items:
            placement = place_small_item(
                item, layout, strategy, 
                self.bagua_map, self.energy_flows, 
                self.elements, self.room_width, self.room_length,
                self.primary_life_goal
            )
            
            # Fallback to general placement if needed
            if not placement:
                placement = place_furniture_general(
                    item, layout, strategy, 
                    self.usable_spaces, self.elements,
                    self.room_width, self.room_length
                )
            
            if placement:
                layout["furniture_placements"].append(placement)
        
        # Calculate feng shui score for the layout
        layout["feng_shui_score"] = self._calculate_layout_score(layout)
        
        return layout
    
    def _extract_furniture_items(self) -> List[Dict[str, Any]]:
        """
        Extract furniture items from selections.
        
        Returns:
            List of furniture items with their properties
        """
        furniture_items = []
        
        # Iterate through selected furniture items
        for furniture_id, item_data in self.furniture_selections.get('items', {}).items():
            quantity = item_data.get('quantity', 0)
            
            if quantity > 0:
                # Extract dimensions
                dimensions = item_data.get('dimensions', {})
                width = dimensions.get('width', 0)
                height = dimensions.get('height', 0)
                
                # Create an item entry for each quantity
                for i in range(quantity):
                    furniture_items.append({
                        "id": f"{furniture_id}_{i}",
                        "base_id": furniture_id,
                        "name": item_data.get('customName') or furniture_id.replace('_', ' ').title(),
                        "width": width,
                        "height": height,
                        "feng_shui_role": item_data.get('fengShuiRole'),
                        "type": item_data.get('type', 'furniture')
                    })
        
        return furniture_items
    
    def _categorize_furniture(self, all_items: List[Dict[str, Any]]) -> tuple:
        """
        Categorize furniture items by type and priority.
        
        Args:
            all_items: List of all furniture items
            
        Returns:
            Tuple of categorized item lists: (command_items, wall_items, large_items, small_items)
        """
        command_items = []  # Beds, desks, sofas - need command position
        wall_items = []     # Bookcases, dressers - need wall support
        large_items = []    # Other large furniture
        small_items = []    # Small decorative items
        
        for item in all_items:
            # Determine furniture type using the utility function
            item_type = get_furniture_type(item["base_id"])
            
            # Categorize based on furniture type
            if item_type in ["bed", "desk"]:
                command_items.append(item)
            elif item_type in ["storage", "bookcase", "dresser", "wardrobe", "cabinet"]:
                wall_items.append(item)
            elif item["width"] * item["height"] < 2500:  # Small items (less than ~2.5 square feet)
                small_items.append(item)
            else:
                large_items.append(item)
        
        return command_items, wall_items, large_items, small_items
    
    def _calculate_layout_score(self, layout: Dict[str, Any]) -> int:
        """
        Calculate an overall feng shui score for the layout (0-100).
        
        Args:
            layout: Layout data
            
        Returns:
            Score from 0-100
        """
        # This is a simplified implementation - for a more comprehensive score,
        # refer to engine.py which has a more detailed implementation
        
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
        
        # Count issue severity
        from ..enums import severity_value
        
        high_severity_issues = 0
        medium_severity_issues = 0
        low_severity_issues = 0
        
        for tradeoff in layout["tradeoffs"]:
            severity = tradeoff.get("severity", "low")
            if severity == "high":
                high_severity_issues += 1
            elif severity == "medium":
                medium_severity_issues += 1
            else:
                low_severity_issues += 1
        
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