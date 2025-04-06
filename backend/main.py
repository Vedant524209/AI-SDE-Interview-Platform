import os
import sys
import logging
import json
import random
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, engine, Base
from models import QuestionTable
from schemas import Question, QuestionCreate, UserState, EmotionType, CodeSubmission, TestResult
from services import generate_question, analyze_facial_expression, evaluate_code_submission, MOCK_MODE

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Force mock mode
MOCK_MODE = True
logger.info("Running in MOCK mode - using predefined questions instead of Ollama")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InterviewXpert API",
    description="API for generating and retrieving coding interview questions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development, restrict for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/questions/", response_model=Question)
async def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    try:
        difficulty = question.difficulty.lower()
        
        # Validate difficulty
        if difficulty not in ["easy", "medium", "hard"]:
            logger.warning(f"Invalid difficulty: {difficulty}")
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid difficulty: {difficulty}. Must be one of: easy, medium, hard"
            )
        
        logger.info(f"Received question creation request with difficulty: {difficulty}")
        
        # Generate question using LLM
        generated_question = generate_question(difficulty)
        
        if not generated_question:
            logger.error("Failed to generate question: No data returned")
            raise HTTPException(status_code=500, detail="Failed to generate question")
        
        logger.info(f"Successfully generated question: {generated_question.get('title', 'Unknown title')}")
        
        if not generated_question or "title" not in generated_question or "desc" not in generated_question:
            logger.error("Failed to generate valid question: Missing required fields")
            raise HTTPException(status_code=500, detail="Failed to generate valid question")
        
        # Create database record with user state
        db_question = QuestionTable(
            title=generated_question["title"],
            desc=generated_question["desc"],
            difficulty=generated_question["difficulty"],
            example=generated_question.get("example"),
            constraints=generated_question.get("constraints", []),
            topics=generated_question.get("topics", []),
            test_cases=generated_question.get("test_cases", []),
            attention_level=question.user_state.attention_level if question.user_state else None,
            positivity_level=question.user_state.positivity_level if question.user_state else None,
            arousal_level=question.user_state.arousal_level if question.user_state else None,
            dominant_emotion=question.user_state.dominant_emotion.value if question.user_state else None
        )
        
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        logger.info(f"Successfully created question with ID: {db_question.id}")
        return db_question
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Roll back the transaction if there was an error
        db.rollback()
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/questions/", response_model=List[Question])
def get_questions(
    skip: int = 0, 
    limit: int = 10, 
    difficulty: Optional[str] = Query(None, description="Filter questions by difficulty (easy, medium, hard)"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(QuestionTable)
        
        # Apply difficulty filter if provided
        if difficulty:
            if difficulty.lower() not in ["easy", "medium", "hard"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid difficulty: {difficulty}. Must be one of: easy, medium, hard"
                )
            query = query.filter(QuestionTable.difficulty == difficulty.lower())
        
        # Apply pagination
        questions = query.offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(questions)} questions from database")
        return questions
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error retrieving questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/questions/{question_id}", response_model=Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    try:
        question = db.query(QuestionTable).filter(QuestionTable.id == question_id).first()
        if question is None:
            logger.warning(f"Question not found with ID: {question_id}")
            raise HTTPException(status_code=404, detail="Question not found")
        
        logger.info(f"Retrieved question with ID: {question_id}")
        return question
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error retrieving question with ID {question_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/questions/{question_id}/test", response_model=TestResult)
async def test_code_submission(question_id: int, submission: CodeSubmission, db: Session = Depends(get_db)):
    """Test a code submission against the test cases for a question."""
    try:
        # Get the question
        question = db.query(QuestionTable).filter(QuestionTable.id == question_id).first()
        if question is None:
            logger.warning(f"Question not found with ID: {question_id}")
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Log the submission
        logger.info(f"Received code submission for question ID {question_id}, language: {submission.language}")
        
        # Evaluate the submission
        result = evaluate_code_submission(submission.code, submission.language, question)
        
        return result
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error testing code submission: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-emotion/")
async def analyze_emotion(image_data: Dict[str, str] = Body(...)):
    """
    Analyze facial expression from a webcam image
    Expects a base64 encoded image in the request body
    """
    try:
        if "image" not in image_data:
            raise HTTPException(status_code=400, detail="Image data missing")
            
        result = analyze_facial_expression(image_data["image"])
        return result
    except Exception as e:
        logger.error(f"Error analyzing emotion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user-state/")
async def log_user_state(state: UserState, db: Session = Depends(get_db)):
    """Endpoint specifically for logging user state independent of questions"""
    try:
        # Create a minimal question record just to store the user state
        db_state = QuestionTable(
            title="User State Log",
            desc="Autogenerated record for user state tracking",
            difficulty="medium",  # Default value
            attention_level=state.attention_level,
            positivity_level=state.positivity_level,
            arousal_level=state.arousal_level,
            dominant_emotion=state.dominant_emotion.value
        )
        
        db.add(db_state)
        db.commit()
        db.refresh(db_state)
        
        return {"message": "User state logged successfully", "id": db_state.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mock_mode": MOCK_MODE,
        "database_connected": True,
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to InterviewXpert API",
        "docs_url": "/docs",
        "healthcheck_url": "/health",
        "mock_mode": MOCK_MODE
    } 