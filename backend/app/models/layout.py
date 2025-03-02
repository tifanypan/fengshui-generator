from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class Layout(Base):
    __tablename__ = "layouts"
    
    id = Column(Integer, primary_key=True, index=True)
    floor_plan_id = Column(Integer, ForeignKey("floor_plans.id"))
    strategy = Column(String(50))  # optimal, space_conscious, life_goal
    feng_shui_score = Column(Float)
    life_goal = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    floor_plan = relationship("FloorPlan")
    furniture_placements = relationship("FurniturePlacement", back_populates="layout")
    recommendations = relationship("FengShuiRecommendation", back_populates="layout")
    tradeoffs = relationship("Tradeoff", back_populates="layout")

class FurniturePlacement(Base):
    __tablename__ = "furniture_placements"
    
    id = Column(Integer, primary_key=True, index=True)
    layout_id = Column(Integer, ForeignKey("layouts.id"))
    furniture_type_id = Column(Integer, ForeignKey("furniture_types.id"))
    custom_name = Column(String(100), nullable=True)
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    rotation = Column(Float, default=0)
    in_command_position = Column(Boolean, default=False)
    against_wall = Column(Boolean, default=False)
    feng_shui_quality = Column(String(20))  # excellent, good, fair, poor
    
    layout = relationship("Layout", back_populates="furniture_placements")
    furniture_type = relationship("FurnitureType")
    tradeoffs = relationship("Tradeoff", back_populates="furniture_placement")

class FengShuiRecommendation(Base):
    __tablename__ = "feng_shui_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    layout_id = Column(Integer, ForeignKey("layouts.id"))
    type = Column(String(50))  # general, placement, enhancement
    category = Column(String(50))
    title = Column(String(200))
    description = Column(Text)
    importance = Column(String(20))  # high, medium, low
    
    layout = relationship("Layout", back_populates="recommendations")

class Tradeoff(Base):
    __tablename__ = "tradeoffs"
    
    id = Column(Integer, primary_key=True, index=True)
    layout_id = Column(Integer, ForeignKey("layouts.id"))
    furniture_placement_id = Column(Integer, ForeignKey("furniture_placements.id"))
    issue = Column(String(100))
    description = Column(Text)
    severity = Column(String(20))  # high, medium, low
    mitigation = Column(Text, nullable=True)
    
    layout = relationship("Layout", back_populates="tradeoffs")
    furniture_placement = relationship("FurniturePlacement", back_populates="tradeoffs")