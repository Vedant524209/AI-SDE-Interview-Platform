from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class Example(BaseModel):
    input: str
    output: str
    explanation: str

class QuestionCreate(BaseModel):
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")

class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1)
    desc: str = Field(..., min_length=1)
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    example: Optional[Example] = None
    constraints: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)

class Question(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 