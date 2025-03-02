from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base
from app.models.room_type import RoomType  # Import the RoomType class from its new location

class FloorPlan(Base):
    __tablename__ = "floor_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id"))
    file_path = Column(String(255))
    original_filename = Column(String(255))
    file_type = Column(String(50))
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    compass_orientation = Column(String(50), nullable=True)  # North, East, South, West
    created_at = Column(DateTime, server_default=func.now())
    
    room_type = relationship("RoomType")
    occupants = relationship("Occupant", back_populates="floor_plan")
    elements = relationship("Element", back_populates="floor_plan")

class Occupant(Base):
    __tablename__ = "occupants"
    
    id = Column(Integer, primary_key=True, index=True)
    floor_plan_id = Column(Integer, ForeignKey("floor_plans.id"))
    birth_year = Column(Integer)
    birth_month = Column(Integer)
    birth_day = Column(Integer)
    gender = Column(String(20))
    is_primary = Column(Boolean, default=False)
    kua_number = Column(Integer, nullable=True)
    
    floor_plan = relationship("FloorPlan", back_populates="occupants")