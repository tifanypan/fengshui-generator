from sqlalchemy import Column, Integer, String, Float
from app.database.session import Base

class FurnitureType(Base):
    __tablename__ = "furniture_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    code = Column(String(50), unique=True, index=True)
    default_width = Column(Float)
    default_height = Column(Float)
    category = Column(String(50))
    feng_shui_role = Column(String(50), nullable=True)