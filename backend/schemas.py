from pydantic import BaseModel, Field, confloat
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EmotionType(str, Enum):
    HAPPY = "happy"
    CONFIDENT = "confident"
    NEUTRAL = "neutral"
    UNCOMFORTABLE = "uncomfortable"

class UserState(BaseModel):
    attention_level: confloat(ge=0, le=1) = Field(..., description="0-1 scale of user attention")
    positivity_level: confloat(ge=0, le=1) = Field(..., description="0-1 scale of positive emotions")
    arousal_level: confloat(ge=0, le=1) = Field(..., description="0-1 scale of emotional arousal")
    dominant_emotion: EmotionType = Field(..., description="Dominant emotional state")

class Example(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class QuestionCreate(BaseModel):
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    user_state: Optional[UserState] = None  # Track user state when question is created

class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1)
    desc: str = Field(..., min_length=1)
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    example: Optional[Example] = None
    constraints: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    test_cases: Optional[List[TestCase]] = None

class Question(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Include emotion metrics in response if available
    attention_level: Optional[float] = None
    positivity_level: Optional[float] = None
    arousal_level: Optional[float] = None
    dominant_emotion: Optional[str] = None

    class Config:
        from_attributes = True

class CodeSubmission(BaseModel):
    """Schema for code submission to test against question test cases."""
    code: str = Field(..., min_length=1, description="The code to test")
    language: str = Field(..., description="Programming language of the code submission")

class TestCaseResult(BaseModel):
    """Result of running a single test case."""
    test_case: TestCase
    passed: bool
    actual_output: Optional[str] = None
    error_message: Optional[str] = None
    execution_time: Optional[float] = None  # in milliseconds

class TestResult(BaseModel):
    """Result of testing code submission against all test cases."""
    passed: bool
    total_test_cases: int
    passed_test_cases: int
    results: List[TestCaseResult]
    overall_execution_time: Optional[float] = None  # in milliseconds
    feedback: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None 