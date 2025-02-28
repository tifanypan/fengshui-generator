# Import all models here to ensure they're discovered by SQLAlchemy
from app.models.room import RoomType, FloorPlan, Occupant

# Import Base for creating all tables
from app.database.session import Base, engine

def create_tables():
    Base.metadata.create_all(bind=engine)