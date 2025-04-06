from pydantic import BaseModel, Field, confloat
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class EmotionType(str, Enum):
    HAPPY = "happy"
    CONFIDENT = "confident"
    NEUTRAL = "neutral"
    UNCOMFORTABLE = "uncomfortable"

class UserState(BaseModel):
    attention_level: float = Field(..., ge=0, le=1)
    positivity_level: float = Field(..., ge=0, le=1)
    arousal_level: float = Field(..., ge=0, le=1)
    dominant_emotion: str

class Example(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class QuestionCreate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    difficulty: Optional[str] = "medium"
    example: Optional[Example] = None
    constraints: Optional[List[str]] = []
    topics: Optional[List[str]] = []
    test_cases: Optional[List[TestCase]] = None
    user_state: Optional[UserState] = None

class Question(BaseModel):
    id: int
    title: str
    desc: str
    difficulty: str
    example: Example
    constraints: List[str]
    topics: List[str]
    test_cases: List[TestCase]
    created_at: datetime
    updated_at: Optional[datetime] = None
    attention_level: Optional[float] = None
    positivity_level: Optional[float] = None
    arousal_level: Optional[float] = None
    dominant_emotion: Optional[str] = None

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        }

class CodeSubmission(BaseModel):
    code: str
    language: Optional[str] = "javascript"

class TestCaseResult(BaseModel):
    passed: bool
    test_case: TestCase
    actual_output: str
    execution_time: float  # in seconds
    error_message: Optional[str] = None

class TestResult(BaseModel):
    passed: bool
    passed_test_cases: int
    total_test_cases: int
    results: List[TestCaseResult]
    feedback: str
    time_complexity: str
    space_complexity: str

# New schemas for interview session tracking

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class EmotionSnapshotCreate(BaseModel):
    attention_level: float = Field(ge=0, le=1)
    positivity_level: float = Field(ge=0, le=1)
    arousal_level: float = Field(ge=0, le=1) 
    dominant_emotion: str
    face_detected: bool = True
    question_id: Optional[int] = None

class EmotionSnapshot(EmotionSnapshotCreate):
    id: int
    session_id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

class SessionQuestionCreate(BaseModel):
    question_id: int
    order_index: int = 0

class SessionQuestionUpdate(BaseModel):
    code_submitted: Optional[str] = None
    language: Optional[str] = None
    passed_tests: Optional[int] = None
    total_tests: Optional[int] = None
    test_results: Optional[Dict[str, Any]] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None

class SessionQuestion(BaseModel):
    id: int
    session_id: int
    question_id: int
    order_index: int
    code_submitted: Optional[str] = None
    language: Optional[str] = None
    passed_tests: Optional[int] = None
    total_tests: Optional[int] = None
    test_results: Optional[Dict[str, Any]] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class InterviewSessionCreate(BaseModel):
    user_id: Optional[int] = None
    session_name: Optional[str] = None

class InterviewSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    completed: Optional[bool] = None
    avg_attention_level: Optional[float] = None
    avg_positivity_level: Optional[float] = None
    avg_arousal_level: Optional[float] = None
    overall_assessment: Optional[str] = None

class InterviewSession(BaseModel):
    id: int
    user_id: Optional[int] = None
    session_name: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    completed: bool
    avg_attention_level: Optional[float] = None
    avg_positivity_level: Optional[float] = None
    avg_arousal_level: Optional[float] = None
    overall_assessment: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class InterviewSessionWithDetails(InterviewSession):
    session_questions: List[SessionQuestion] = []
    emotion_snapshots: List[EmotionSnapshot] = []
    
    class Config:
        orm_mode = True 