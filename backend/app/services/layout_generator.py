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
            # Log the process for debugging
            logger.info(f"Generating layouts for room type: {room_data.get('roomType')}")
            logger.info(f"Room dimensions: {room_data.get('dimensions')}")
            logger.info(f"Furniture items count: {len(furniture_selections.get('items', {}))}")
            
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
            recommendations = self._generate_recommendations(
                layouts, 
                room_data,
                primary_life_goal
            )
            layouts["recommendations"] = recommendations
            
            # Log success
            logger.info(f"Successfully generated layouts with scores: " +
                       f"Optimal={layouts.get('optimal_layout', {}).get('feng_shui_score', 0)}, " +
                       f"Space={layouts.get('space_conscious_layout', {}).get('feng_shui_score', 0)}")
            
            return layouts
            
        except Exception as e:
            logger.error(f"Error generating layouts: {str(e)}", exc_info=True)
            # Return a minimal response with error info
            return {
                "error": str(e),
                "room_data": room_data,
                "optimal_layout": None,
                "space_conscious_layout": None,
                "life_goal_layout": None,
                "recommendations": self._get_fallback_recommendations(room_data.get("roomType"))
            }
    
    def _generate_recommendations(self, layouts: Dict[str, Any], room_data: Dict[str, Any], 
                                 primary_life_goal: str = None) -> List[Dict[str, Any]]:
        """
        Generate feng shui recommendations based on the generated layouts.
        
        Args:
            layouts: Generated layouts data
            room_data: Original room data
            primary_life_goal: Optional life goal to prioritize
            
        Returns:
            List of recommendations
        """
        recommendations = []
        room_type = room_data.get("roomType")
        
        # Get tradeoffs from all layouts
        all_tradeoffs = []
        if "optimal_layout" in layouts and layouts["optimal_layout"]:
            all_tradeoffs.extend(layouts["optimal_layout"].get("tradeoffs", []))
        if "space_conscious_layout" in layouts and layouts["space_conscious_layout"]:
            all_tradeoffs.extend(layouts["space_conscious_layout"].get("tradeoffs", []))
        if "life_goal_layout" in layouts and layouts["life_goal_layout"]:
            all_tradeoffs.extend(layouts["life_goal_layout"].get("tradeoffs", []))
        
        # Add general feng shui principles recommendations first
        recommendations.extend(self._get_general_recommendations())
        
        # Add room-specific recommendations
        if room_type:
            recommendations.extend(self._get_room_type_recommendations(room_type))
        
        # Add recommendations based on tradeoffs
        issue_types = set(t.get("issue") for t in all_tradeoffs)
        
        for issue in issue_types:
            mitigation_recs = self._get_mitigation_recommendations(issue)
            if mitigation_recs:
                recommendations.extend(mitigation_recs)
        
        # Add life goal recommendations if applicable
        if primary_life_goal:
            recommendations.extend(self._get_life_goal_recommendations(primary_life_goal))
        
        # Add special consideration recommendations if applicable
        special_considerations = room_data.get("furniture", {}).get("specialConsiderations", {})
        for consideration, is_active in special_considerations.items():
            if is_active:
                recommendations.extend(self._get_special_consideration_recommendations(consideration))
        
        # Deduplicate recommendations based on title
        seen_titles = set()
        unique_recommendations = []
        
        for rec in recommendations:
            if rec["title"] not in seen_titles:
                seen_titles.add(rec["title"])
                unique_recommendations.append(rec)
        
        return unique_recommendations
    
    def _get_general_recommendations(self) -> List[Dict[str, Any]]:
        """Get general feng shui recommendations that apply to all rooms."""
        return [
            {
                "type": "general",
                "category": "command_position",
                "title": "Place key furniture in command position",
                "description": "Position beds, desks, and sofas so they have a clear view of the door but are not directly in line with it. This provides a sense of security and control.",
                "importance": "high",
                "example": "A bed placed diagonally across from the bedroom door (not directly in line with it), with a solid wall behind the headboard."
            },
            {
                "type": "general",
                "category": "energy_flow",
                "title": "Maintain good chi (energy) flow",
                "description": "Arrange furniture to create clear pathways throughout the space. Avoid blocking doors, windows, or natural walking paths. Good energy flow promotes vitality and harmony.",
                "importance": "high"
            },
            {
                "type": "enhancement",
                "category": "decluttering",
                "title": "Clear clutter for better energy",
                "description": "Regularly declutter to allow chi to flow freely throughout your space. Organize storage areas and keep pathways clear.",
                "importance": "high"
            },
            {
                "type": "enhancement",
                "category": "lighting",
                "title": "Balance natural and artificial light",
                "description": "Use layered lighting with a mix of overhead, task, and accent lights. Natural light is best during the day, with warm lighting in the evening for better rest.",
                "importance": "medium"
            },
            {
                "type": "enhancement",
                "category": "nature",
                "title": "Incorporate natural elements",
                "description": "Add plants, natural materials, and nature-inspired decor to bring living energy into your space. This connects your home to the natural world and improves air quality.",
                "importance": "medium"
            },
            {
                "type": "general",
                "category": "five_elements",
                "title": "Balance the five elements",
                "description": "Incorporate all five feng shui elements (wood, fire, earth, metal, water) in your space for balance. Each element brings different energy qualities that support various aspects of life.",
                "importance": "medium"
            }
        ]
    
    def _get_room_type_recommendations(self, room_type: str) -> List[Dict[str, Any]]:
        """Get recommendations specific to a room type."""
        recommendations = []
        
        if room_type == "bedroom":
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "bed_placement",
                    "title": "Optimal bed placement",
                    "description": "Place your bed in the command position (diagonally across from the door, but not directly in line with it) with a solid wall behind it for stability and support.",
                    "importance": "high"
                },
                {
                    "type": "general",
                    "category": "sleep_quality",
                    "title": "Create a restful sleep environment",
                    "description": "Use calming colors like blue, lavender, or soft neutrals. Remove electronics and work-related items. Add blackout curtains for better sleep quality.",
                    "importance": "high"
                },
                {
                    "type": "mitigation",
                    "category": "mirror_placement",
                    "title": "Avoid mirrors facing the bed",
                    "description": "Mirrors facing the bed can disturb sleep by bouncing excessive energy and creating a sense of intrusion. Position mirrors where they won't reflect the bed.",
                    "importance": "medium"
                }
            ])
        
        elif room_type == "office":
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "desk_placement",
                    "title": "Strategic desk placement",
                    "description": "Position your desk in the command position with a view of the door but not directly in line with it. Ensure your back is to a solid wall for support and protection.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "productivity",
                    "title": "Enhance focus and productivity",
                    "description": "Place inspiring artwork at eye level and use task lighting to improve focus. Keep the desk clear of clutter for better energy flow and concentration.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "career_growth",
                    "title": "Activate career energy",
                    "description": "Place career symbols or objects that represent professional success in the north area of your office. Use the color black or deep blue accents to stimulate career energy.",
                    "importance": "medium"
                }
            ])
        
        elif room_type == "living_room":
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "seating_arrangement",
                    "title": "Conversation-friendly seating",
                    "description": "Arrange seating in a way that promotes conversation and connection. Create a circular or square arrangement where people can easily see and talk to each other.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "balanced_elements",
                    "title": "Balance active and passive energy",
                    "description": "Include both active areas (for conversation and entertainment) and quieter zones (for reading or relaxation) to create a balanced living space.",
                    "importance": "medium"
                },
                {
                    "type": "mitigation",
                    "category": "sharp_corners",
                    "title": "Soften sharp corners",
                    "description": "Minimize 'poison arrows' from sharp corners by positioning furniture strategically or adding plants to diffuse the energy. Round or oval coffee tables can help.",
                    "importance": "medium"
                }
            ])
        
        elif room_type == "dining_room":
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "table_placement",
                    "title": "Create an abundant dining space",
                    "description": "Position the dining table in a way that allows all diners to see the entrance. Avoid placing the table directly under heavy beams or chandeliers, which can create oppressive energy.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "abundance_energy",
                    "title": "Enhance prosperity energy",
                    "description": "Use a mirror to reflect the dining table, symbolically doubling the abundance. Add a fruit bowl or fresh flowers as a centerpiece to represent growth and vitality.",
                    "importance": "medium"
                }
            ])
        
        elif "kitchen" in room_type:
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "stove_placement",
                    "title": "Optimize stove placement",
                    "description": "Position the cooking area where the chef can see the door but is not directly in line with it. The stove represents wealth and nourishment in feng shui.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "kitchen_energy",
                    "title": "Balance kitchen elements",
                    "description": "Kitchens naturally have strong fire energy (stove) and water energy (sink). Balance these by incorporating wood elements (plants, wooden utensils) and earth tones.",
                    "importance": "medium"
                }
            ])
        
        elif room_type == "studio":
            recommendations.extend([
                {
                    "type": "placement",
                    "category": "zone_separation",
                    "title": "Create distinct functional zones",
                    "description": "Clearly define separate areas for sleeping, working, and relaxing using room dividers, rugs, or furniture arrangement. This helps maintain good energy boundaries.",
                    "importance": "high"
                },
                {
                    "type": "enhancement",
                    "category": "multifunctional_furniture",
                    "title": "Use multifunctional furniture wisely",
                    "description": "Choose furniture that can serve multiple purposes but maintain boundaries between functions. For example, use a screen or bookshelf to separate a sleeping area from a workspace.",
                    "importance": "high"
                },
                {
                    "type": "mitigation",
                    "category": "bed_placement_studio",
                    "title": "Keep bed away from cooking area",
                    "description": "In studio spaces, place the bed as far from the kitchen area as possible. The active energy of the kitchen can disturb sleep quality.",
                    "importance": "medium"
                }
            ])
        
        return recommendations
    
    def _get_mitigation_recommendations(self, issue_type: str) -> List[Dict[str, Any]]:
        """Get recommendations to mitigate specific feng shui issues."""
        recommendations = []
        
        if issue_type == "no_wall_behind":
            recommendations.append({
                "type": "mitigation",
                "category": "wall_support",
                "title": "Create solid support",
                "description": "When furniture can't be placed against a wall, create symbollic support with a solid headboard for beds, a tall console behind a sofa, or a substantial chair back for desks.",
                "importance": "high"
            })
        
        elif issue_type == "bed_under_window":
            recommendations.append({
                "type": "mitigation",
                "category": "window_energy",
                "title": "Mitigate bed under window",
                "description": "If the bed must be under a window, install solid, heavy curtains that can be closed at night to create a sense of protection and reduce energy leakage.",
                "importance": "high"
            })
        
        elif issue_type == "mirror_facing_bed":
            recommendations.append({
                "type": "mitigation",
                "category": "mirror_energy",
                "title": "Address mirrors facing the bed",
                "description": "Cover mirrors that face the bed at night with a curtain, or reposition them to face away from the bed to prevent sleep disturbance and excessive energy.",
                "importance": "high"
            })
        
        elif issue_type == "blocks_door":
            recommendations.append({
                "type": "mitigation",
                "category": "door_clearance",
                "title": "Clear doorway obstructions",
                "description": "Keep at least 3 feet of clearance in front of all doors to allow energy to flow freely into the space. Reposition furniture that blocks doors or creates tight passageways.",
                "importance": "high"
            })
        
        elif issue_type == "blocks_energy_flow":
            recommendations.append({
                "type": "mitigation",
                "category": "energy_pathways",
                "title": "Improve energy circulation",
                "description": "Create clear pathways through the space by repositioning furniture that blocks natural movement. Place plants or small lights in areas with stagnant energy to activate flow.",
                "importance": "medium"
            })
        
        elif issue_type == "desk_not_command":
            recommendations.append({
                "type": "mitigation",
                "category": "desk_positioning",
                "title": "Compensate for desk placement",
                "description": "If the desk cannot be in command position, place a small mirror that allows you to see the door when seated. Ensure you have a solid wall or substantial furniture piece behind your chair.",
                "importance": "medium"
            })
        
        elif issue_type == "suboptimal_placement":
            recommendations.append({
                "type": "mitigation",
                "category": "balancing_elements",
                "title": "Balance imperfect furniture placement",
                "description": "When furniture can't be ideally positioned, add balancing elements nearby. Use colors, materials, and shapes that complement the furniture's energy element.",
                "importance": "medium"
            })
        
        elif issue_type == "non_ideal_bagua_area":
            recommendations.append({
                "type": "enhancement",
                "category": "bagua_harmony",
                "title": "Harmonize furniture with its location",
                "description": "When furniture is placed in non-ideal bagua areas, incorporate colors and accents that bridge the furniture's natural element with the bagua area's element for better energy harmony.",
                "importance": "low"
            })
        
        elif issue_type == "unable_to_place":
            recommendations.append({
                "type": "mitigation",
                "category": "space_constraints",
                "title": "Address space limitations",
                "description": "When space is too limited for all furniture, prioritize essential pieces and consider multi-functional furniture. Remove or replace items that don't fit well in the space.",
                "importance": "high"
            })
        
        return recommendations
    
    def _get_life_goal_recommendations(self, life_goal: str) -> List[Dict[str, Any]]:
        """Get recommendations specific to a life goal."""
        recommendations = []
        
        if life_goal == "career":
            recommendations.append({
                "type": "enhancement",
                "category": "career_focus",
                "title": "Enhance career energy",
                "description": "Activate the north area of your space with water features, black or blue accents, and career symbols. Keep this area clean and well-organized to support professional growth.",
                "importance": "high"
            })
        
        elif life_goal == "wealth":
            recommendations.append({
                "type": "enhancement",
                "category": "prosperity_focus",
                "title": "Amplify wealth energy",
                "description": "Energize the southeast corner with wood elements like healthy plants, green colors, and vertical shapes. Add water elements nearby to nourish the wood energy of abundance.",
                "importance": "high"
            })
        
        elif life_goal == "health":
            recommendations.append({
                "type": "enhancement",
                "category": "health_focus",
                "title": "Support health and vitality",
                "description": "Balance the center of your home with earth elements and nurture the east area with wood energy. Use yellow, brown, and green accents, and incorporate living plants for vibrant energy.",
                "importance": "high"
            })
        
        elif life_goal == "relationships":
            recommendations.append({
                "type": "enhancement",
                "category": "relationship_focus",
                "title": "Nurture relationship energy",
                "description": "Enhance the southwest area with pairs of objects, pink or red accents, and earth elements. Display meaningful photos or symbols of loving partnerships to attract harmonious connections.",
                "importance": "high"
            })
        
        return recommendations
    
    def _get_special_consideration_recommendations(self, consideration: str) -> List[Dict[str, Any]]:
        """Get recommendations for special considerations."""
        recommendations = []
        
        if consideration == "wheelchair":
            recommendations.append({
                "type": "special_need",
                "category": "accessibility",
                "title": "Create accessible feng shui",
                "description": "Maintain 36-inch wide pathways throughout the space. Position furniture to allow easy turning radius, and ensure all important items are within comfortable reaching distance.",
                "importance": "high"
            })
        
        elif consideration == "smallSpace":
            recommendations.append({
                "type": "special_need",
                "category": "small_space",
                "title": "Maximize feng shui in small spaces",
                "description": "Use mirrors strategically to expand the visual space. Choose furniture with visible legs to create a sense of openness, and implement vertical storage to reduce clutter.",
                "importance": "high"
            })
        
        elif consideration == "rental":
            recommendations.append({
                "type": "special_need",
                "category": "rental_friendly",
                "title": "Feng shui for rentals",
                "description": "Use free-standing furniture and removable solutions like tension rods, command hooks, and area rugs to create good feng shui without permanent changes to the space.",
                "importance": "high"
            })
        
        elif consideration == "pets":
            recommendations.append({
                "type": "special_need",
                "category": "pet_friendly",
                "title": "Pet-friendly feng shui",
                "description": "Create designated areas for pet activities and rest that don't disrupt key energy pathways. Position pet beds in quiet, stable locations and use washable materials for easier maintenance.",
                "importance": "medium"
            })
        
        elif consideration == "sensory":
            recommendations.append({
                "type": "special_need",
                "category": "sensory_sensitive",
                "title": "Sensory-friendly feng shui",
                "description": "Create a calm environment with soft, diffused lighting, minimal visual clutter, and sound-absorbing materials. Use gentle, natural colors and create quiet retreat areas.",
                "importance": "high"
            })
        
        return recommendations
    
    def _get_fallback_recommendations(self, room_type: str = None) -> List[Dict[str, Any]]:
        """Get basic recommendations when layout generation fails."""
        # Start with general recommendations
        recommendations = self._get_general_recommendations()
        
        # Add room-specific recommendations if room type is available
        if room_type:
            recommendations.extend(self._get_room_type_recommendations(room_type))
        
        return recommendations