from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Element(Base):
    __tablename__ = "elements"
    
    id = Column(Integer, primary_key=True, index=True)
    floor_plan_id = Column(Integer, ForeignKey("floor_plans.id"))
    element_type = Column(String(50))  # door, window, closet, etc.
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    rotation = Column(Float, default=0)
    properties = Column(JSON, nullable=True)  # Additional properties like isOpen for doors
    
    floor_plan = relationship("FloorPlan", back_populates="elements")