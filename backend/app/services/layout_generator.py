"""
Layout Generator Service - Generates feng shui-optimized layouts for room floor plans.

This service coordinates the room analysis and feng shui engine to produce
complete layouts with furniture placement and feng shui recommendations.
"""
import logging
from typing import Dict, List, Any, Optional
import json

from app.services.room_analysis import RoomAnalyzer
from app.services.feng_shui_engine import FengShuiEngine

logger = logging.getLogger(__name__)

class LayoutGenerator:
    def __init__(self):
        """Initialize the layout generator."""
        pass

    def generate_layouts(self, room_data: Dict[str, Any], furniture_selections: Dict[str, Any], 
                        primary_life_goal: str = None) -> Dict[str, Any]:
        """
        Generate feng shui-optimized layouts based on room data and furniture selections.
        
        Args:
            room_data: Room dimensions, elements, and compass orientation
            furniture_selections: Selected furniture items with quantities
            primary_life_goal: Optional life goal to prioritize (premium feature)
            
        Returns:
            Dictionary containing multiple layout options and feng shui recommendations
        """
        try:
            # Analyze the room
            room_analyzer = RoomAnalyzer(room_data)
            room_analysis = room_analyzer.analyze_room()
            
            # Generate feng shui layouts
            feng_shui_engine = FengShuiEngine(
                room_analysis=room_analysis,
                furniture_selections=furniture_selections,
                occupants=room_data.get("occupants", [])
            )
            
            # Generate all layouts
            layouts = feng_shui_engine.generate_layouts(primary_life_goal)
            
            # Add feng shui recommendations
            recommendations = self._generate_recommendations(layouts, room_data)
            layouts["recommendations"] = recommendations
            
            return layouts
            
        except Exception as e:
            logger.error(f"Error generating layouts: {str(e)}")
            # Return a minimal response with error info
            return {
                "error": str(e),
                "room_data": room_data,
                "optimal_layout": None,
                "space_conscious_layout": None,
                "life_goal_layout": None,
                "recommendations": []
            }
    
    def _generate_recommendations(self, layouts: Dict[str, Any], room_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate feng shui recommendations based on the generated layouts.
        
        Args:
            layouts: Generated layouts data
            room_data: Original room data
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Get tradeoffs from all layouts
        all_tradeoffs = []
        if "optimal_layout" in layouts and layouts["optimal_layout"]:
            all_tradeoffs.extend(layouts["optimal_layout"].get("tradeoffs", []))
        if "space_conscious_layout" in layouts and layouts["space_conscious_layout"]:
            all_tradeoffs.extend(layouts["space_conscious_layout"].get("tradeoffs", []))
        if "life_goal_layout" in layouts and layouts["life_goal_layout"]:
            all_tradeoffs.extend(layouts["life_goal_layout"].get("tradeoffs", []))
        
        # Generate recommendations for each type of tradeoff
        tradeoff_types = set(t.get("issue") for t in all_tradeoffs)
        
        # Generate specific recommendations
        room_type = room_data.get("roomType")
        
        # Add general recommendations based on room type
        if room_type == "bedroom":
            recommendations.append({
                "type": "general",
                "category": "sleep",
                "title": "Optimal sleep environment",
                "description": "For better sleep quality, consider using soft, calming colors like blue, green, or lavender. Avoid electronics near the bed and use blackout curtains.",
                "importance": "high"
            })
        elif room_type == "office":
            recommendations.append({
                "type": "general",
                "category": "productivity",
                "title": "Enhance productivity",
                "description": "Place inspiring artwork at eye level and use task lighting to improve focus. Keep the desk clear of clutter for better energy flow.",
                "importance": "high"
            })
        elif room_type == "living_room":
            recommendations.append({
                "type": "general",
                "category": "energy_flow",
                "title": "Improve energy flow",
                "description": "Arrange seating to encourage conversation. Use rounded corners on furniture when possible to create better energy flow.",
                "importance": "medium"
            })
        
        # Add recommendations based on tradeoffs
        if "no_wall_behind" in tradeoff_types:
            recommendations.append({
                "type": "mitigation",
                "category": "stability",
                "title": "Create stability for floating furniture",
                "description": "For furniture without wall support, add a solid headboard or console table behind it. You can also use tall plants or a screen to create a sense of protection.",
                "importance": "high"
            })
        
        if "non_ideal_bagua_area" in tradeoff_types:
            recommendations.append({
                "type": "mitigation",
                "category": "energy_balance",
                "title": "Balance energy in non-ideal placements",
                "description": "Use the five elements to balance areas where furniture isn't in its ideal position. Add metal accents in creativity areas, wood elements in wealth areas, and water features in career zones.",
                "importance": "medium"
            })
        
        if "optimal_placement_not_found" in tradeoff_types:
            recommendations.append({
                "type": "mitigation",
                "category": "space_optimization",
                "title": "Optimize tight spaces",
                "description": "In limited space, use multi-functional furniture and vertical storage. Create visual harmony by using a consistent color palette and keeping pathways clear.",
                "importance": "medium"
            })

        # Add specific recommendations for special considerations
        special_considerations = room_data.get("furniture", {}).get("specialConsiderations", {})
        
        if special_considerations.get("wheelchair", False):
            recommendations.append({
                "type": "special_need",
                "category": "accessibility",
                "title": "Wheelchair-friendly adjustments",
                "description": "Maintain 36-inch wide pathways throughout the space. Keep furniture at accessible heights and arrange in a way that allows for easy turning radius.",
                "importance": "high"
            })
        
        if special_considerations.get("pets", False):
            recommendations.append({
                "type": "special_need",
                "category": "pet_friendly",
                "title": "Pet-friendly feng shui",
                "description": "Place pet beds in quiet, stable areas away from high traffic. Consider scratch-resistant and washable fabrics, and create designated zones for pet activities.",
                "importance": "medium"
            })
        
        if special_considerations.get("smallSpace", False):
            recommendations.append({
                "type": "special_need",
                "category": "small_space",
                "title": "Small space optimization",
                "description": "Use mirrors to visually expand the space. Choose lighter colors and multi-function furniture to maximize limited square footage.",
                "importance": "high"
            })
            
        # Add general feng shui enhancement recommendations
        recommendations.append({
            "type": "enhancement",
            "category": "decluttering",
            "title": "Maintain clear energy with decluttering",
            "description": "Regularly clear clutter to maintain positive energy flow. Keep pathways open and organize storage to prevent energy stagnation.",
            "importance": "high"
        })
        
        recommendations.append({
            "type": "enhancement",
            "category": "lighting",
            "title": "Optimize lighting for energy balance",
            "description": "Use layered lighting with a mix of overhead, task, and accent lights. Natural light is best during the day, with warm lighting in the evening for better rest.",
            "importance": "medium"
        })
        
        return recommendations