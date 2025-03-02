from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.room import Base as RoomBase
from app.models.element import Base as ElementBase
from app.database.session import SQLALCHEMY_DATABASE_URL

def init_db():
    """Initialize the database with all required tables."""
    # Create engine
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create all tables
    RoomBase.metadata.create_all(bind=engine)
    ElementBase.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # You can add any initialization data here if needed
        print("Database tables created successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()