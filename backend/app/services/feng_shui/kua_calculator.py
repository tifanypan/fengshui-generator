"""
Kua number calculator for feng shui.
Calculates personal kua numbers based on birth date and gender.
"""
from typing import Optional, Tuple, Dict, Any
import math
from .enums import KuaGroup


def calculate_kua_number(gender: str, birth_year: int, birth_month: int, birth_day: int) -> Optional[int]:
    """
    Calculate the kua number based on gender and birth date.
    
    Args:
        gender: 'male' or 'female'
        birth_year: Year of birth
        birth_month: Month of birth
        birth_day: Day of birth
        
    Returns:
        Kua number (1-9) or None if any input is missing
    """
    # Handle missing data
    if not all([gender, birth_year, birth_month, birth_day]):
        return None
    
    # Use lunar year if date is before February 4
    if birth_month == 1 or (birth_month == 2 and birth_day < 4):
        lunar_year = birth_year - 1
    else:
        lunar_year = birth_year
    
    # Calculate kua number based on gender
    if gender.lower() == 'male':
        # For males: 10 - (sum of year digits) % 9
        year_sum = sum(int(digit) for digit in str(lunar_year))
        while year_sum > 9:
            year_sum = sum(int(digit) for digit in str(year_sum))
        kua = 10 - year_sum
        if kua == 10:  # Special case
            kua = 1
        elif kua == 5:  # Special case
            kua = 2
    else:  # female
        # For females: (sum of year digits) + 5
        year_sum = sum(int(digit) for digit in str(lunar_year))
        while year_sum > 9:
            year_sum = sum(int(digit) for digit in str(year_sum))
        kua = year_sum + 5
        if kua > 9:  # If over 9, subtract 9
            kua = kua - 9
        elif kua == 5:  # Special case
            kua = 8
    
    return kua


def get_kua_group(kua_number: Optional[int]) -> Optional[KuaGroup]:
    """
    Determine the kua group (East or West) based on kua number.
    
    Args:
        kua_number: Kua number (1-9)
        
    Returns:
        KuaGroup enum value or None if kua_number is invalid
    """
    if not kua_number:
        return None
        
    east_group = [1, 3, 4, 9]
    west_group = [2, 5, 6, 7, 8]
    
    if kua_number in east_group:
        return KuaGroup.EAST
    elif kua_number in west_group:
        return KuaGroup.WEST
    else:
        return None


def get_kua_direction_rotation(position: Dict[str, Any], kua_group: Optional[KuaGroup], 
                              room_width: float, room_length: float) -> int:
    """
    Determine optimal rotation based on kua number and position.
    
    Args:
        position: Position data with x, y coordinates
        kua_group: KuaGroup enum value
        room_width: Width of the room
        room_length: Length of the room
        
    Returns:
        Optimal rotation in degrees (0, 90, 180, or 270)
    """
    if not kua_group:
        return 0  # Default no rotation
    
    # Get room center
    room_center_x = room_width / 2
    room_center_y = room_length / 2
    
    # Calculate direction from center
    dx = position["x"] - room_center_x
    dy = position["y"] - room_center_y
    
    # Determine compass direction
    angle = math.degrees(math.atan2(dy, dx)) % 360
    
    # Convert angle to 8 directions
    directions = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"]
    direction_index = round(angle / 45) % 8
    direction = directions[direction_index]
    
    # East group lucky directions: E, SE, S, N
    # West group lucky directions: W, SW, NW, NE
    lucky_directions = {
        KuaGroup.EAST: ["E", "SE", "S", "N"],
        KuaGroup.WEST: ["W", "SW", "NW", "NE"]
    }
    
    # Determine the best rotation to face a lucky direction
    if kua_group in lucky_directions:
        current_lucky = direction in lucky_directions[kua_group]
        
        if current_lucky:
            return 0  # Already facing a lucky direction
        
        # Try rotations to find a lucky direction
        for rotation in [90, 180, 270]:
            rotated_index = (direction_index + (rotation // 45)) % 8
            rotated_direction = directions[rotated_index]
            
            if rotated_direction in lucky_directions[kua_group]:
                return rotation
    
    return 0  # Default no rotation


def get_favorable_directions(kua_group: Optional[KuaGroup]) -> Dict[str, list]:
    """
    Get favorable and unfavorable directions based on kua group.
    
    Args:
        kua_group: KuaGroup enum value
        
    Returns:
        Dictionary with favorable and unfavorable direction lists
    """
    if not kua_group:
        return {"favorable": [], "unfavorable": []}
    
    if kua_group == KuaGroup.EAST:
        return {
            "favorable": ["E", "SE", "S", "N"],
            "unfavorable": ["W", "SW", "NW", "NE"]
        }
    else:  # WEST group
        return {
            "favorable": ["W", "SW", "NW", "NE"],
            "unfavorable": ["E", "SE", "S", "N"]
        }