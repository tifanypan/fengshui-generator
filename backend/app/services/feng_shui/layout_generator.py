"""
Layout generator for feng shui room planning.
Generates multiple layout options based on different strategies.
"""
from typing import Dict, List, Any, Optional
import logging
import random
from .enums import LayoutStrategy, KuaGroup
from .furniture.placer import FurniturePlacer
from .kua_calculator import calculate_kua_number, get_kua_group

logger = logging.getLogger(__name__)


class LayoutGenerator:
    """Generates different layout options based on room analysis and furniture selections."""
    
    def __init__(self, room_analysis: Dict[str, Any], furniture_selections: Dict[str, Any], 
                occupants: List[Dict[str, Any]] = None):
        """
        Initialize the layout generator.
        
        Args:
            room_analysis: Room analysis data
            furniture_selections: Selected furniture items
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
        
        # Special considerations (if any)
        self.special_considerations = furniture_selections.get('specialConsiderations', {})
    
    def generate_layouts(self, primary_life_goal: str = None) -> Dict[str, Any]:
        """
        Generate multiple feng shui layouts based on different strategies.
        
        Args:
            primary_life_goal: Optional life goal to prioritize
            
        Returns:
            Dictionary containing multiple layout options
        """
        # Create a furniture placer
        furniture_placer = FurniturePlacer(
            self.room_analysis,
            self.furniture_selections,
            self.kua_group,
            primary_life_goal
        )
        
        # Generate the primary optimal layout
        optimal_layout = furniture_placer.place_all_furniture(LayoutStrategy.OPTIMAL)
        optimal_layout["id"] = f"optimal_{random.randint(1000, 9999)}"
        optimal_layout["strategy"] = LayoutStrategy.OPTIMAL.value
        
        # Create a new furniture placer for each layout to avoid interference
        fp_space = FurniturePlacer(
            self.room_analysis,
            self.furniture_selections,
            self.kua_group,
            primary_life_goal
        )
        
        # Generate a space-conscious layout (with some feng shui tradeoffs)
        space_layout = fp_space.place_all_furniture(LayoutStrategy.SPACE_CONSCIOUS)
        space_layout["id"] = f"space_{random.randint(1000, 9999)}"
        space_layout["strategy"] = LayoutStrategy.SPACE_CONSCIOUS.value
        
        # Create a new furniture placer for life goal layout
        fp_life_goal = FurniturePlacer(
            self.room_analysis,
            self.furniture_selections,
            self.kua_group,
            primary_life_goal
        )
        
        # Generate a life goal layout if requested
        life_goal_layout = None
        if primary_life_goal:
            life_goal_layout = fp_life_goal.place_all_furniture(LayoutStrategy.LIFE_GOAL)
            life_goal_layout["id"] = f"life_goal_{random.randint(1000, 9999)}"
            life_goal_layout["strategy"] = LayoutStrategy.LIFE_GOAL.value
            life_goal_layout["life_goal"] = primary_life_goal
        
        # If no life goal layout, generate another layout variant
        if not life_goal_layout:
            # Create a new furniture placer for variant layout
            fp_variant = FurniturePlacer(
                self.room_analysis,
                self.furniture_selections,
                self.kua_group
            )
            
            # Add some randomization for variety
            life_goal_layout = fp_variant.place_all_furniture(LayoutStrategy.OPTIMAL)
            life_goal_layout["id"] = f"variant_{random.randint(1000, 9999)}"
            life_goal_layout["strategy"] = "variant"
        
        return {
            "optimal_layout": optimal_layout,
            "space_conscious_layout": space_layout,
            "life_goal_layout": life_goal_layout,
            "kua_number": self.kua_number,
            "kua_group": self.kua_group.value if self.kua_group else None,
            "room_analysis": self.room_analysis
        }