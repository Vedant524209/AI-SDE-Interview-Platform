from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Example(BaseModel):
    input: str
    output: str
    explanation: str

class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class QuestionCreate(BaseModel):
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")

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