"""
Database reset and initialization script.
This script will:
1. Drop all tables in the database
2. Recreate the tables
3. Initialize the room types
"""
import sys
import os
from pathlib import Path

# Add the project root to Python path to ensure imports work
project_root = str(Path(__file__).resolve().parent)
sys.path.insert(0, project_root)

from app.database.session import Base, engine, SessionLocal
from app.models.room import RoomType
import app.database.models  # Import all models to ensure they're registered

def reset_database():
    """Drop all tables and recreate them."""
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database schema reset complete.")

def init_room_types():
    """Initialize all room types in the database."""
    print("Initializing room types...")
    db = SessionLocal()
    try:
        # Define all room types
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

        # Add each room type
        for rt in room_types:
            db.add(RoomType(code=rt["code"], name=rt["name"]))
            print(f"  - Added room type: {rt['code']}")
        
        db.commit()
        print("Room types initialized successfully!")

        # Verify all room types were added
        all_types = db.query(RoomType).all()
        print(f"Verified {len(all_types)} room types in database:")
        for rt in all_types:
            print(f"  - {rt.id}: {rt.code} - {rt.name}")
            
    except Exception as e:
        print(f"Error initializing room types: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ask for confirmation before resetting
    confirm = input("This will RESET the entire database. Are you sure? (y/n): ")
    if confirm.lower() == 'y':
        reset_database()
        init_room_types()
        print("Database reset and initialization complete!")
    else:
        print("Operation cancelled.")