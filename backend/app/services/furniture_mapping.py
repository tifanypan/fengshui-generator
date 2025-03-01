"""
Furniture Mapping Service - Maps frontend furniture IDs to feng shui attributes.
This service contains the proprietary feng shui knowledge and keeps it secure on the backend.
"""
from enum import Enum
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

# Feng Shui Element Types
class Element(Enum):
    WOOD = "wood"
    FIRE = "fire"
    EARTH = "earth"
    METAL = "metal"
    WATER = "water"

# Feng Shui Energy Types
class Energy(Enum):
    GROUNDING = "grounding"       # Stabilizing, solid energy
    ACTIVATING = "activating"     # Movement, action energy
    NOURISHING = "nourishing"     # Supportive, nurturing energy
    EXPANSIVE = "expansive"       # Growth, opportunity energy
    BALANCING = "balancing"       # Harmonizing energy
    PROTECTIVE = "protective"     # Boundary, shield energy

# Bagua Areas
class BaguaArea(Enum):
    CAREER = "career"             # North
    KNOWLEDGE = "knowledge"       # Northeast
    FAMILY = "family"             # East
    HEALTH = "health"             # East
    WEALTH = "wealth"             # Southeast
    FAME = "fame"                 # South
    RELATIONSHIPS = "relationships" # Southwest
    CHILDREN = "children"         # West
    HELPFUL_PEOPLE = "helpful_people" # Northwest
    CENTER = "center"             # Center

# Furniture Feng Shui Properties
class FurnitureProperties:
    def __init__(
        self,
        element: Element,
        energy: Energy,
        ideal_bagua_areas: List[BaguaArea],
        command_position_required: bool = False,
        solid_wall_required: bool = False,
        needs_stability: bool = False,
        affects_sleep: bool = False,
        affects_career: bool = False,
        affects_relationships: bool = False,
        affects_health: bool = False,
        priority: int = 2,  # 1=high, 2=medium, 3=low
    ):
        self.element = element
        self.energy = energy
        self.ideal_bagua_areas = ideal_bagua_areas
        self.command_position_required = command_position_required
        self.solid_wall_required = solid_wall_required
        self.needs_stability = needs_stability
        self.affects_sleep = affects_sleep
        self.affects_career = affects_career
        self.affects_relationships = affects_relationships
        self.affects_health = affects_health
        self.priority = priority

# Furniture mapping dictionary - maps frontend IDs to feng shui properties
# This is the proprietary knowledge that stays on the backend
FURNITURE_MAPPING: Dict[str, FurnitureProperties] = {
    # Beds
    "twin_bed": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_sleep=True,
        affects_relationships=True,
        affects_health=True,
        priority=1  # High priority
    ),
    "full_bed": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_sleep=True,
        affects_relationships=True,
        affects_health=True,
        priority=1  # High priority
    ),
    "queen_bed": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_sleep=True,
        affects_relationships=True,
        affects_health=True,
        priority=1  # High priority
    ),
    "king_bed": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_sleep=True,
        affects_relationships=True,
        affects_health=True,
        priority=1  # High priority
    ),
    
    # Desks
    "desk": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.ACTIVATING,
        ideal_bagua_areas=[BaguaArea.CAREER, BaguaArea.KNOWLEDGE, BaguaArea.WEALTH],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_career=True,
        priority=1  # High priority
    ),
    "gaming_desk": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.ACTIVATING,
        ideal_bagua_areas=[BaguaArea.CAREER, BaguaArea.KNOWLEDGE],
        command_position_required=True,
        solid_wall_required=True,
        needs_stability=True,
        affects_career=True,
        priority=1  # High priority
    ),
    
    # Seating
    "sofa": FurnitureProperties(
        element=Element.EARTH,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY, BaguaArea.CENTER],
        solid_wall_required=True,
        needs_stability=True,
        affects_relationships=True,
        priority=1  # High priority
    ),
    "sofa_small": FurnitureProperties(
        element=Element.EARTH,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY, BaguaArea.CENTER],
        solid_wall_required=True,
        needs_stability=True,
        affects_relationships=True,
        priority=1  # High priority
    ),
    "lounge_chair": FurnitureProperties(
        element=Element.EARTH,
        energy=Energy.GROUNDING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY, BaguaArea.CENTER],
        needs_stability=False,
        priority=2  # Medium priority
    ),
    
    # Storage
    "bookshelf": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.PROTECTIVE,
        ideal_bagua_areas=[BaguaArea.KNOWLEDGE, BaguaArea.FAMILY],
        solid_wall_required=True,
        needs_stability=True,
        priority=2  # Medium priority
    ),
    "dresser": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.PROTECTIVE,
        ideal_bagua_areas=[BaguaArea.FAMILY, BaguaArea.WEALTH],
        solid_wall_required=True,
        needs_stability=True,
        priority=2  # Medium priority
    ),
    "nightstand": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.BALANCING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY],
        needs_stability=True,
        affects_sleep=True,
        priority=2  # Medium priority
    ),
    
    # Tables
    "dining_table": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.NOURISHING,
        ideal_bagua_areas=[BaguaArea.FAMILY, BaguaArea.HEALTH, BaguaArea.WEALTH],
        needs_stability=True,
        affects_relationships=True,
        priority=1  # High priority
    ),
    "coffee_table": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.BALANCING,
        ideal_bagua_areas=[BaguaArea.RELATIONSHIPS, BaguaArea.CENTER],
        needs_stability=False,
        priority=2  # Medium priority
    ),
    
    # Decorative & Wellness
    "plant_large": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.EXPANSIVE,
        ideal_bagua_areas=[BaguaArea.FAMILY, BaguaArea.HEALTH, BaguaArea.WEALTH],
        needs_stability=False,
        affects_health=True,
        priority=3  # Low priority
    ),
    "plant_small": FurnitureProperties(
        element=Element.WOOD,
        energy=Energy.EXPANSIVE,
        ideal_bagua_areas=[BaguaArea.FAMILY, BaguaArea.HEALTH, BaguaArea.WEALTH],
        needs_stability=False,
        affects_health=True,
        priority=3  # Low priority
    ),
    "mirror": FurnitureProperties(
        element=Element.WATER,
        energy=Energy.EXPANSIVE,
        ideal_bagua_areas=[BaguaArea.WEALTH, BaguaArea.FAME],
        needs_stability=True,
        priority=3  # Low priority
    ),
    
    # Add more furniture mappings here...
}

def get_furniture_properties(furniture_id: str) -> Optional[FurnitureProperties]:
    """
    Get feng shui properties for a specific furniture ID.
    
    Args:
        furniture_id: The frontend furniture ID
        
    Returns:
        FurnitureProperties object if found, None otherwise
    """
    return FURNITURE_MAPPING.get(furniture_id)

def get_multiple_furniture_properties(furniture_items: List[Dict[str, Any]]) -> Dict[str, FurnitureProperties]:
    """
    Get feng shui properties for multiple furniture items.
    
    Args:
        furniture_items: List of furniture items with at least an 'id' field
        
    Returns:
        Dictionary mapping furniture IDs to their feng shui properties
    """
    result = {}
    for item in furniture_items:
        furniture_id = item.get('id')
        if furniture_id and furniture_id in FURNITURE_MAPPING:
            result[furniture_id] = FURNITURE_MAPPING[furniture_id]
        else:
            logger.warning(f"Furniture ID not found in mapping: {furniture_id}")
    
    return result

def get_custom_furniture_properties(furniture_type: str, feng_shui_role: str) -> FurnitureProperties:
    """
    Create feng shui properties for custom furniture based on type and role.
    
    Args:
        furniture_type: General type of furniture (e.g., 'seating', 'storage')
        feng_shui_role: Role in feng shui (e.g., 'productivity', 'comfort')
        
    Returns:
        Generated FurnitureProperties object
    """
    # Map furniture type to element
    element_mapping = {
        'seating': Element.EARTH,
        'storage': Element.WOOD,
        'desk': Element.WOOD,
        'table': Element.WOOD,
        'bed': Element.WOOD,
        'decor': Element.METAL,
    }
    
    # Map feng shui role to energy and bagua areas
    role_mapping = {
        'productivity': (Energy.ACTIVATING, [BaguaArea.CAREER, BaguaArea.KNOWLEDGE]),
        'comfort': (Energy.GROUNDING, [BaguaArea.RELATIONSHIPS, BaguaArea.FAMILY]),
        'balance': (Energy.BALANCING, [BaguaArea.CENTER]),
        'creativity': (Energy.EXPANSIVE, [BaguaArea.CHILDREN, BaguaArea.KNOWLEDGE]),
        'organization': (Energy.PROTECTIVE, [BaguaArea.KNOWLEDGE, BaguaArea.FAMILY]),
        'rest': (Energy.GROUNDING, [BaguaArea.RELATIONSHIPS, BaguaArea.HEALTH]),
        'wealth': (Energy.EXPANSIVE, [BaguaArea.WEALTH, BaguaArea.FAME]),
    }
    
    # Default values
    element = Element.WOOD
    energy = Energy.BALANCING
    ideal_areas = [BaguaArea.CENTER]
    command_position = False
    solid_wall = False
    stability = True
    priority = 2
    
    # Apply mappings if found
    if furniture_type in element_mapping:
        element = element_mapping[furniture_type]
    
    if feng_shui_role in role_mapping:
        energy, ideal_areas = role_mapping[feng_shui_role]
    
    # Special considerations based on type
    if furniture_type == 'bed':
        command_position = True
        solid_wall = True
        priority = 1
    elif furniture_type in ['desk', 'workspace']:
        command_position = True
        solid_wall = True
        priority = 1
    elif furniture_type == 'seating' and feng_shui_role == 'comfort':
        solid_wall = True
        priority = 1
    
    return FurnitureProperties(
        element=element,
        energy=energy,
        ideal_bagua_areas=ideal_areas,
        command_position_required=command_position,
        solid_wall_required=solid_wall,
        needs_stability=stability,
        priority=priority
    )