from sqlalchemy import Column, Integer, String, DateTime, JSON, Float, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sessions = relationship("InterviewSession", back_populates="user")

class QuestionTable(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    desc = Column(Text)
    difficulty = Column(String(50))
    example = Column(JSON, nullable=True)
    constraints = Column(JSON)
    topics = Column(JSON)
    test_cases = Column(JSON, nullable=True)
    
    # New fields for user state tracking
    attention_level = Column(Float, nullable=True)
    positivity_level = Column(Float, nullable=True)
    arousal_level = Column(Float, nullable=True)
    dominant_emotion = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session_questions = relationship("SessionQuestion", back_populates="question")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_name = Column(String(255), nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Integer, nullable=True) # in seconds
    completed = Column(Boolean, default=False)
    
    # Emotional data aggregated over the session
    avg_attention_level = Column(Float, nullable=True)
    avg_positivity_level = Column(Float, nullable=True)
    avg_arousal_level = Column(Float, nullable=True)
    overall_assessment = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    session_questions = relationship("SessionQuestion", back_populates="session")
    emotion_snapshots = relationship("EmotionSnapshot", back_populates="session")

class SessionQuestion(Base):
    __tablename__ = "session_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    order_index = Column(Integer) # Question order in the session
    
    # User's code submission
    code_submitted = Column(Text, nullable=True)
    language = Column(String(50), nullable=True)
    
    # Test results
    passed_tests = Column(Integer, nullable=True)
    total_tests = Column(Integer, nullable=True)
    test_results = Column(JSON, nullable=True)
    
    # Time spent on this question
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Integer, nullable=True) # in seconds
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session = relationship("InterviewSession", back_populates="session_questions")
    question = relationship("QuestionTable", back_populates="session_questions")

class EmotionSnapshot(Base):
    __tablename__ = "emotion_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    
    # Timestamp when this snapshot was taken
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Emotion metrics
    attention_level = Column(Float, nullable=True)
    positivity_level = Column(Float, nullable=True)
    arousal_level = Column(Float, nullable=True)
    dominant_emotion = Column(String(50), nullable=True)
    
    # Additional context
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    face_detected = Column(Boolean, default=False)
    
    # Relationships
    session = relationship("InterviewSession", back_populates="emotion_snapshots") 