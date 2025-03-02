"""
Utility script to initialize room types in the database.
Run this directly to populate the database with standard room types.
"""
import sys
import os
from pathlib import Path
import requests

# Add the project root to Python path to ensure imports work
project_root = str(Path(__file__).resolve().parent)
sys.path.insert(0, project_root)

# Option 1: Use direct DB access
def init_room_types_db():
    print("Initializing room types directly in database...")
    from app.database.session import SessionLocal
    from app.models.room import RoomType
    
    db = SessionLocal()
    try:
        # Check if room types already exist
        if db.query(RoomType).count() > 0:
            print("Room types already exist in database.")
            # Display existing room types
            room_types = db.query(RoomType).all()
            print("Existing room types:")
            for rt in room_types:
                print(f"  - {rt.code}: {rt.name}")
            return True
        
        # Add room types
        room_types = [
            {"code": "bedroom", "name": "Bedroom"},
            {"code": "office", "name": "Office"},
            {"code": "bedroom_office", "name": "Bedroom + Office"},
            {"code": "studio", "name": "Studio"},
            {"code": "living_room", "name": "Living Room"},
            {"code": "dining_room", "name": "Dining Room"},
            {"code": "kitchen_dining", "name": "Kitchen + Dining"},
            {"code": "kitchen_dining_living", "name": "Kitchen + Dining + Living"},
        ]

        for rt in room_types:
            db.add(RoomType(code=rt["code"], name=rt["name"]))
        
        db.commit()
        print("Room types initialized successfully!")
        return True
    except Exception as e:
        print(f"Error initializing room types: {str(e)}")
        return False
    finally:
        db.close()

# Option 2: Use API endpoint
def init_room_types_api():
    print("Initializing room types via API endpoint...")
    try:
        response = requests.post("http://localhost:8000/api/room-types/init")
        data = response.json()
        print(f"API Response: {data}")
        
        # Also get the list of room types to confirm
        list_response = requests.get("http://localhost:8000/api/room-types/")
        if list_response.status_code == 200:
            room_types = list_response.json()
            print("Available room types:")
            for rt in room_types:
                print(f"  - {rt['code']}: {rt['name']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error calling API: {str(e)}")
        return False

if __name__ == "__main__":
    # Try API method first
    api_success = init_room_types_api()
    
    # If API method fails, try direct DB method
    if not api_success:
        print("API initialization failed, trying direct database initialization...")
        db_success = init_room_types_db()
        
        if db_success:
            print("Room types initialized successfully via direct database access.")
        else:
            print("Failed to initialize room types.")
    else:
        print("Room types initialized successfully via API.")