"""
Enumerations used in the feng shui services.
"""
from enum import Enum


class LifeGoal(Enum):
    """Feng Shui life goals (for premium optimization)"""
    CAREER = "career"
    WEALTH = "wealth"
    HEALTH = "health"
    RELATIONSHIPS = "relationships"


class KuaGroup(Enum):
    """Kua number groups"""
    EAST = "east"  # Kua numbers 1, 3, 4, 9
    WEST = "west"  # Kua numbers 2, 5, 6, 7, 8


class LayoutStrategy(Enum):
    """Layout generation strategies"""
    OPTIMAL = "optimal"  # Best feng shui with no compromises
    SPACE_CONSCIOUS = "space_conscious"  # Prioritizes efficient use of space
    LIFE_GOAL = "life_goal"  # Prioritizes a specific life goal


# Helper function for tradeoff severity comparison
def severity_value(severity: str) -> int:
    """Convert severity string to numerical value for comparison."""
    values = {"high": 3, "medium": 2, "low": 1}
    return values.get(severity, 0)