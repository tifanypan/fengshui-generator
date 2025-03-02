# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from app.config import settings

# engine = create_engine(settings.DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# # Dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Set up logging (this was missing)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)  # 👈 Add this line

# Set up database engine
engine = create_engine(settings.DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the base class for models
Base = declarative_base()

def init_db():
    """Initialize the database by creating all tables."""
    from app.models import RoomType, FloorPlan, Occupant, Element, FurnitureType, Layout, FurniturePlacement, FengShuiRecommendation, Tradeoff
    
    logger.info("Creating database tables...")  # ✅ Now this works without errors
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")

# Dependency for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
