"""
Enumerations used in the room analysis services.
"""
from enum import Enum


class Direction(Enum):
    """Compass directions"""
    NORTH = "N"
    EAST = "E"
    SOUTH = "S"
    WEST = "W"
    NORTHEAST = "NE"
    SOUTHEAST = "SE"
    SOUTHWEST = "SW"
    NORTHWEST = "NW"
    CENTER = "C"


class ElementType(Enum):
    """Room element types"""
    WALL = "wall"
    DOOR = "door"
    WINDOW = "window"
    CLOSET = "closet"
    COLUMN = "column"
    FIREPLACE = "fireplace"
    RADIATOR = "radiator"
    NO_FURNITURE = "nofurniture"


class ConstraintType(Enum):
    """Room constraint types"""
    UNUSABLE_AREA = "unusable_area"  # Area that cannot be used for furniture
    TRAFFIC_FLOW = "traffic_flow"    # Area that should be kept clear for movement
    DOOR_SWING = "door_swing"        # Area needed for door to open/close
    FENG_SHUI_ISSUE = "feng_shui_issue"  # Area with negative feng shui energy