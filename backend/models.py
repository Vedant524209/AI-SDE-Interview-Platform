from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.sql import func
from database import Base

class QuestionTable(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    desc = Column(String)
    difficulty = Column(String)
    example = Column(JSON, nullable=True)
    constraints = Column(JSON)
    topics = Column(JSON)
    test_cases = Column(JSON, nullable=True)
    
    # New fields for user state tracking
    attention_level = Column(Float, nullable=True)
    positivity_level = Column(Float, nullable=True)
    arousal_level = Column(Float, nullable=True)
    dominant_emotion = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 