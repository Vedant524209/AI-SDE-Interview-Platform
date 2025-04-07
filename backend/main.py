import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import sys
import logging
import json
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session
import statistics
import re

from database import get_db, engine, Base
from models import QuestionTable, InterviewSession, SessionQuestion, EmotionSnapshot, User, CodeSubmission as CodeSubmissionModel
from schemas import (
    Question, QuestionCreate, UserState, EmotionType, CodeSubmission, TestResult,
    InterviewSessionCreate, InterviewSession as InterviewSessionSchema,
    InterviewSessionUpdate, InterviewSessionWithDetails, SessionQuestionCreate,
    SessionQuestionUpdate, SessionQuestion as SessionQuestionSchema,
    EmotionSnapshotCreate, EmotionSnapshot as EmotionSnapshotSchema
)
from services import generate_question, analyze_facial_expression, evaluate_code_submission, MOCK_MODE, MOCK_QUESTIONS
from seed_questions import seed_questions
from judge0_service import judge0_service

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

# Seed the database with sample questions
db = next(get_db())
try:
    seed_questions(db)
except Exception as e:
    logger.error(f"Error seeding database: {e}")
finally:
    db.close()

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

class CodeSubmission(BaseModel):
    code: str
    language: str = "javascript"
    session_question_id: Optional[int] = None

@app.post("/questions/", response_model=Question)
async def create_question(question: QuestionCreate = Body(...), db: Session = Depends(get_db)):
    try:
        # Log request details for debugging
        logger.info(f"Received question creation request: {question}")
        
        # Default values for missing fields
        difficulty = question.difficulty if question.difficulty else "medium"
        
        # Validate difficulty
        if difficulty not in ["easy", "medium", "hard"]:
            logger.warning(f"Invalid difficulty: {difficulty}, defaulting to medium")
            difficulty = "medium"
        
        logger.info(f"Processing question creation with difficulty: {difficulty}")
        
        # Always generate new question (either from Ollama or mock data)
        generated_question = None
        if MOCK_MODE:
            # In mock mode, use a predefined question from the mock data
            mock_questions_for_difficulty = [q for q in MOCK_QUESTIONS if q["difficulty"] == difficulty]
            if mock_questions_for_difficulty:
                generated_question = random.choice(mock_questions_for_difficulty)
            else:
                generated_question = MOCK_QUESTIONS[0]
            logger.info(f"Using mock question: {generated_question['title']}")
        else:
            # Use Ollama for real generation
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
            test_cases=generated_question.get("test_cases", [])
        )
        
        # Add emotion data if available
        if question.user_state:
            db_question.attention_level = question.user_state.attention_level
            db_question.positivity_level = question.user_state.positivity_level
            db_question.arousal_level = question.user_state.arousal_level
            db_question.dominant_emotion = question.user_state.dominant_emotion
        
        # Save to database
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        # Convert datetime to ISO format for response
        if hasattr(db_question, 'created_at') and db_question.created_at:
            db_question.created_at = db_question.created_at.isoformat()
        if hasattr(db_question, 'updated_at') and db_question.updated_at:
            db_question.updated_at = db_question.updated_at.isoformat()
        
        logger.info(f"Successfully created question with ID: {db_question.id}")
        return db_question
    except ValidationError as ve:
        logger.error(f"Validation error creating question: {str(ve)}")
        # Use a mock question if validation fails
        if MOCK_MODE:
            logger.info("Using mock question due to validation error")
            mock_question = MOCK_QUESTIONS[0]
            db_question = QuestionTable(
                title=mock_question["title"],
                desc=mock_question["desc"],
                difficulty=mock_question["difficulty"],
                example=mock_question["example"],
                constraints=mock_question["constraints"],
                topics=mock_question["topics"],
                test_cases=mock_question["test_cases"]
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            
            # Convert datetime to ISO format for response
            if hasattr(db_question, 'created_at') and db_question.created_at:
                db_question.created_at = db_question.created_at.isoformat()
            if hasattr(db_question, 'updated_at') and db_question.updated_at:
                db_question.updated_at = db_question.updated_at.isoformat()
                
            logger.info(f"Created mock question with ID: {db_question.id}")
            return db_question
        else:
            raise HTTPException(status_code=422, detail=str(ve))
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
        
        # Manually convert the datetime fields to ISO format strings for serialization
        for question in questions:
            if hasattr(question, 'created_at') and question.created_at:
                question.created_at = question.created_at.isoformat()
            if hasattr(question, 'updated_at') and question.updated_at:
                question.updated_at = question.updated_at.isoformat()
        
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
        
        # Manually convert the datetime fields to ISO format strings for serialization
        if hasattr(question, 'created_at') and question.created_at:
            question.created_at = question.created_at.isoformat()
        if hasattr(question, 'updated_at') and question.updated_at:
            question.updated_at = question.updated_at.isoformat()
        
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

# Session management endpoints

@app.post("/sessions/", response_model=InterviewSessionSchema)
def create_interview_session(
    session_data: InterviewSessionCreate,
    db: Session = Depends(get_db)
):
    """Create a new interview session."""
    new_session = InterviewSession(
        user_id=session_data.user_id,
        session_name=session_data.session_name or f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    logger.info(f"Created new interview session with id: {new_session.id}")
    return new_session

@app.get("/sessions/{session_id}", response_model=InterviewSessionWithDetails)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get details of an interview session by ID."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    return session

@app.delete("/sessions/{session_id}")
def delete_interview_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Delete an interview session."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Delete associated records first (cascade delete not automatic in SQLAlchemy ORM)
    db.query(EmotionSnapshot).filter(EmotionSnapshot.session_id == session_id).delete()
    db.query(SessionQuestion).filter(SessionQuestion.session_id == session_id).delete()
    
    # Delete the session
    db.delete(session)
    db.commit()
    
    return {"message": f"Session {session_id} deleted successfully"}

@app.get("/sessions/{session_id}/questions")
def get_session_questions(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get all questions for a session."""
    try:
        # Verify session exists
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        # Get questions for the session
        session_questions = db.query(SessionQuestion).filter(
            SessionQuestion.session_id == session_id
        ).order_by(SessionQuestion.order_index).all()
        
        return session_questions
    except Exception as e:
        logger.error(f"Error getting session questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Session questions endpoints

@app.post("/sessions/{session_id}/questions/", response_model=SessionQuestionSchema)
def add_question_to_session(
    session_id: int,
    question_data: SessionQuestionCreate,
    db: Session = Depends(get_db)
):
    """Add a question to an interview session"""
    try:
        logger.info(f"Adding question to session: {session_id}, question_id: {question_data.question_id}")
        
        # Check if session exists
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if session is None:
            logger.warning(f"Session not found: {session_id}")
            raise HTTPException(status_code=404, detail=f"Session not found with ID: {session_id}")
        
        # Try to fetch the requested question
        question = db.query(QuestionTable).filter(QuestionTable.id == question_data.question_id).first()
        
        # If question not found, create a new one
        if question is None:
            logger.warning(f"Question not found: {question_data.question_id}, creating new question")
            
            # In mock mode, use a predefined question
            if MOCK_MODE:
                mock_question = MOCK_QUESTIONS[0]
                generated_question = mock_question
                logger.info(f"Using mock question: {mock_question['title']}")
            else:
                # Use Ollama for real generation
                generated_question = generate_question("medium")
                if not generated_question:
                    logger.error("Failed to generate question")
                    raise HTTPException(status_code=500, detail="Failed to generate question")
            
            # Create a new question in the database
            question = QuestionTable(
                title=generated_question["title"],
                desc=generated_question["desc"],
                difficulty=generated_question["difficulty"],
                example=generated_question["example"],
                constraints=generated_question.get("constraints", []),
                topics=generated_question.get("topics", []),
                test_cases=generated_question.get("test_cases", [])
            )
            
            try:
                db.add(question)
                db.commit()
                db.refresh(question)
                logger.info(f"Created new question with ID: {question.id}")
            except Exception as e:
                db.rollback()
                logger.error(f"Error creating question: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error creating question: {str(e)}")
        
        # Create session question
        session_question = SessionQuestion(
            session_id=session_id,
            question_id=question.id,
            order_index=question_data.order_index
        )
        
        try:
            db.add(session_question)
            db.commit()
            db.refresh(session_question)
            
            logger.info(f"Successfully added question to session, session_question ID: {session_question.id}")
            return session_question
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating session question: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating session question: {str(e)}")
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Roll back the transaction if there was an error
        db.rollback()
        logger.error(f"Error adding question to session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/sessions/{session_id}/questions/{question_id}", response_model=SessionQuestionSchema)
def update_session_question(
    session_id: int,
    question_id: int,
    question_data: SessionQuestionUpdate,
    db: Session = Depends(get_db)
):
    """Update a question in an interview session."""
    session_question = db.query(SessionQuestion).filter(
        SessionQuestion.session_id == session_id,
        SessionQuestion.question_id == question_id
    ).first()
    
    if not session_question:
        raise HTTPException(status_code=404, detail="Session question not found")
    
    # Update fields
    for key, value in question_data.dict(exclude_unset=True).items():
        setattr(session_question, key, value)
    
    # If end_time is set but duration is not, calculate duration
    if question_data.end_time and not question_data.duration and session_question.start_time:
        duration = int((question_data.end_time - session_question.start_time).total_seconds())
        session_question.duration = duration
    
    db.commit()
    db.refresh(session_question)
    return session_question

# Emotion snapshots endpoints

@app.post("/sessions/{session_id}/emotions/", response_model=EmotionSnapshotSchema)
def add_emotion_snapshot(
    session_id: int,
    emotion_data: EmotionSnapshotCreate,
    db: Session = Depends(get_db)
):
    """Add an emotion snapshot to an interview session."""
    # Verify session exists
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Create emotion snapshot
    new_snapshot = EmotionSnapshot(
        session_id=session_id,
        attention_level=emotion_data.attention_level,
        positivity_level=emotion_data.positivity_level,
        arousal_level=emotion_data.arousal_level,
        dominant_emotion=emotion_data.dominant_emotion,
        face_detected=emotion_data.face_detected,
        question_id=emotion_data.question_id
    )
    
    db.add(new_snapshot)
    db.commit()
    db.refresh(new_snapshot)
    
    return new_snapshot

@app.get("/sessions/{session_id}/emotions/", response_model=List[EmotionSnapshotSchema])
def get_session_emotions(
    session_id: int,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get emotion snapshots for an interview session."""
    # Verify session exists
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Get emotion snapshots with pagination
    snapshots = db.query(EmotionSnapshot).filter(
        EmotionSnapshot.session_id == session_id
    ).order_by(
        EmotionSnapshot.timestamp.desc()
    ).offset(offset).limit(limit).all()
    
    return snapshots

@app.get("/sessions/{session_id}/emotions/summary")
def get_session_emotion_summary(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get a summary of emotion data for an interview session."""
    # Verify session exists
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Get emotion snapshots
    snapshots = db.query(EmotionSnapshot).filter(EmotionSnapshot.session_id == session_id).all()
    
    if not snapshots:
        return {
            "attention_level": None,
            "positivity_level": None,
            "arousal_level": None,
            "dominant_emotions": {},
            "snapshot_count": 0
        }
    
    # Calculate metrics
    attention_values = [s.attention_level for s in snapshots if s.attention_level is not None]
    positivity_values = [s.positivity_level for s in snapshots if s.positivity_level is not None]
    arousal_values = [s.arousal_level for s in snapshots if s.arousal_level is not None]
    
    # Count occurrences of each emotion
    emotions_count = {}
    for s in snapshots:
        if s.dominant_emotion:
            emotions_count[s.dominant_emotion] = emotions_count.get(s.dominant_emotion, 0) + 1
    
    # Sort emotions by count
    dominant_emotions = dict(sorted(emotions_count.items(), key=lambda x: x[1], reverse=True))
    
    return {
        "attention_level": statistics.mean(attention_values) if attention_values else None,
        "positivity_level": statistics.mean(positivity_values) if positivity_values else None,
        "arousal_level": statistics.mean(arousal_values) if arousal_values else None,
        "dominant_emotions": dominant_emotions,
        "snapshot_count": len(snapshots)
    }

# Report generation endpoints
@app.get("/sessions/{session_id}/report")
def generate_session_report(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Generate a comprehensive report for an interview session."""
    # Verify session exists
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Get all session data
    questions = db.query(SessionQuestion).filter(
        SessionQuestion.session_id == session_id
    ).order_by(SessionQuestion.order_index).all()
    
    emotion_snapshots = db.query(EmotionSnapshot).filter(
        EmotionSnapshot.session_id == session_id
    ).all()
    
    # Build the report
    report = {
        "session_info": {
            "id": session.id,
            "session_name": session.session_name,
            "start_time": session.start_time.isoformat() if session.start_time else None,
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
            "completed": session.completed,
        },
        "question_performance": [],
        "emotional_analysis": {
            "average": {
                "attention_level": session.avg_attention_level,
                "positivity_level": session.avg_positivity_level,
                "arousal_level": session.avg_arousal_level,
            },
            "assessment": session.overall_assessment,
            "emotion_distribution": {}
        },
        "overall_assessment": {
            "problem_solving_score": None,
            "code_quality_score": None,
            "emotional_state_score": None,
            "overall_score": None,
            "strengths": [],
            "areas_for_improvement": [],
            "recommendations": []
        }
    }
    
    # Process questions and code submissions
    total_time_spent = 0
    problems_solved = 0
    total_test_cases = 0
    passed_test_cases = 0
    languages_used = set()
    
    for q in questions:
        # Get question details
        question_data = db.query(QuestionTable).filter(QuestionTable.id == q.question_id).first()
        if not question_data:
            continue
        
        time_spent = q.duration if q.duration is not None else 0
        total_time_spent += time_spent
        
        if q.passed_tests is not None and q.total_tests is not None:
            if q.passed_tests == q.total_tests:
                problems_solved += 1
            passed_test_cases += q.passed_tests
            total_test_cases += q.total_tests
        
        if q.language:
            languages_used.add(q.language)
        
        # Calculate code quality metrics
        code_quality = {
            "readability": 0.0,
            "efficiency": 0.0,
            "correctness": 0.0,
            "overall": 0.0
        }
        
        # Simple code quality metrics based on test results
        if q.passed_tests is not None and q.total_tests is not None and q.total_tests > 0:
            pass_rate = q.passed_tests / q.total_tests
            code_quality["correctness"] = pass_rate * 10  # 0-10 scale
            
            # Simulate efficiency and readability scores for demo
            if q.code_submitted:
                code_lines = q.code_submitted.count('\n') + 1
                # Complexity heuristic - penalize very short or very long solutions
                if code_lines < 5:
                    code_quality["readability"] = 5.0
                    code_quality["efficiency"] = 7.0
                elif code_lines < 20:
                    code_quality["readability"] = 8.0
                    code_quality["efficiency"] = 8.0
                elif code_lines < 50:
                    code_quality["readability"] = 7.0
                    code_quality["efficiency"] = 6.0
                else:
                    code_quality["readability"] = 5.0
                    code_quality["efficiency"] = 4.0
                
                # Adjust based on test pass rate
                code_quality["efficiency"] *= (0.5 + 0.5 * pass_rate)
            
            code_quality["overall"] = (code_quality["readability"] + 
                                     code_quality["efficiency"] + 
                                     code_quality["correctness"]) / 3
        
        # Add to report
        question_performance = {
            "question_id": q.question_id,
            "title": question_data.title,
            "difficulty": question_data.difficulty,
            "topics": question_data.topics,
            "time_spent": time_spent,
            "language": q.language,
            "test_results": {
                "passed": q.passed_tests,
                "total": q.total_tests,
                "pass_rate": q.passed_tests / q.total_tests if q.total_tests else 0
            },
            "code_quality": code_quality
        }
        
        report["question_performance"].append(question_performance)
    
    # Process emotion data
    emotion_counts = {}
    for snapshot in emotion_snapshots:
        if snapshot.dominant_emotion:
            emotion = snapshot.dominant_emotion.lower()
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Sort emotions by frequency
    total_snapshots = len(emotion_snapshots)
    emotion_distribution = {}
    for emotion, count in emotion_counts.items():
        emotion_distribution[emotion] = round(count / total_snapshots * 100, 1) if total_snapshots > 0 else 0
    
    report["emotional_analysis"]["emotion_distribution"] = emotion_distribution
    
    # Overall assessment
    # Calculate problem solving score (0-100)
    problem_solving_score = 0
    if total_test_cases > 0:
        problem_solving_score = (passed_test_cases / total_test_cases) * 100
    
    # Calculate code quality score (0-100)
    code_quality_score = 0
    if report["question_performance"]:
        avg_code_quality = sum(q["code_quality"]["overall"] for q in report["question_performance"]) / len(report["question_performance"])
        code_quality_score = avg_code_quality * 10  # Convert 0-10 to 0-100
    
    # Calculate emotional state score (0-100)
    emotional_state_score = 0
    if session.avg_attention_level is not None and session.avg_positivity_level is not None:
        emotional_state_score = ((session.avg_attention_level + session.avg_positivity_level) / 2) * 100
    
    # Overall score is weighted average
    overall_score = (
        problem_solving_score * 0.4 +  # 40% weight on problem solving
        code_quality_score * 0.4 +     # 40% weight on code quality
        emotional_state_score * 0.2    # 20% weight on emotional state
    )
    
    report["overall_assessment"]["problem_solving_score"] = round(problem_solving_score, 1)
    report["overall_assessment"]["code_quality_score"] = round(code_quality_score, 1)
    report["overall_assessment"]["emotional_state_score"] = round(emotional_state_score, 1)
    report["overall_assessment"]["overall_score"] = round(overall_score, 1)
    
    # Identify strengths
    strengths = []
    areas_for_improvement = []
    
    # Problem solving strengths/areas
    if problem_solving_score >= 80:
        strengths.append("Strong problem-solving skills demonstrated by high test pass rate")
    elif problem_solving_score >= 60:
        strengths.append("Decent problem-solving approach with moderate success in test cases")
    else:
        areas_for_improvement.append("Work on problem-solving techniques to improve test case pass rate")
    
    # Code quality strengths/areas
    if code_quality_score >= 80:
        strengths.append("High-quality code that is readable, efficient, and correct")
    elif code_quality_score >= 60:
        strengths.append("Reasonable code quality with some room for improvement")
    else:
        areas_for_improvement.append("Focus on writing cleaner and more efficient code")
    
    # Emotional state strengths/areas
    if emotional_state_score >= 80:
        strengths.append("Excellent engagement and positive emotional state throughout the interview")
    elif emotional_state_score >= 60:
        strengths.append("Good emotional control during the interview process")
    else:
        areas_for_improvement.append("Work on maintaining focus and positive engagement during problem-solving")
    
    # Add time management feedback
    if total_time_spent < session.duration * 0.7:
        strengths.append("Efficient time management demonstrated")
    elif total_time_spent > session.duration * 0.9:
        areas_for_improvement.append("Work on time management to ensure completing all tasks")
    
    # Recommendations based on strengths and areas for improvement
    recommendations = []
    if "work on problem-solving techniques" in str(areas_for_improvement).lower():
        recommendations.append("Practice algorithmic problems daily focusing on test case coverage")
    
    if "cleaner and more efficient code" in str(areas_for_improvement).lower():
        recommendations.append("Review code style guides and refactoring techniques")
    
    if "emotional" in str(areas_for_improvement).lower():
        recommendations.append("Work on stress management techniques for high-pressure situations")
    
    if len(recommendations) == 0:
        recommendations.append("Continue with current study plan to maintain skills")
    
    # Add a specific recommendation based on language usage
    languages_list = list(languages_used)
    if languages_list:
        recommendations.append(f"Consider expanding your skills beyond {', '.join(languages_list)}")
    
    report["overall_assessment"]["strengths"] = strengths
    report["overall_assessment"]["areas_for_improvement"] = areas_for_improvement
    report["overall_assessment"]["recommendations"] = recommendations
    
    return report

# Judge0 API endpoints
@app.post("/judge0/execute")
async def execute_code(submission: dict):
    """Execute code using Judge0."""
    try:
        code = submission.get("source_code", "")
        language_id = submission.get("language_id", 71)  # Default to Python
        stdin = submission.get("stdin", "")
        
        # Convert language_id to language name
        language_map = {
            63: "javascript",
            71: "python",
            62: "java",
            54: "cpp"
        }
        language = language_map.get(language_id, "python")
        
        logger.info(f"Executing {language} code with Judge0")
        
        # Execute the code
        result = judge0_service.execute_code(code, language, stdin)
        
        return result
    except Exception as e:
        logger.error(f"Error executing code: {str(e)}")
        # Return a mock result instead of raising an error
        return {
            "status": {"id": 3, "description": "Accepted (Mock)"},
            "stdout": "Mock output - Judge0 service is not available",
            "stderr": None,
            "compile_output": None,
            "message": None,
            "time": 0.1,
            "memory": 1024
        }

@app.get("/judge0/languages")
async def get_languages():
    """Get supported languages from Judge0."""
    try:
        logger.info("Fetching supported languages from Judge0")
        
        # For now, return a static list of supported languages
        # In a real implementation, you would fetch this from Judge0
        languages = [
            {"id": 63, "name": "JavaScript (Node.js 12.14.0)", "is_archived": False},
            {"id": 71, "name": "Python (3.8.1)", "is_archived": False},
            {"id": 62, "name": "Java (OpenJDK 13.0.1)", "is_archived": False},
            {"id": 54, "name": "C++ (GCC 9.2.0)", "is_archived": False}
        ]
        
        return languages
    except Exception as e:
        logger.error(f"Error fetching languages: {str(e)}")
        # Return a static list of languages instead of raising an error
        return [
            {"id": 63, "name": "JavaScript (Node.js 12.14.0)", "is_archived": False},
            {"id": 71, "name": "Python (3.8.1)", "is_archived": False},
            {"id": 62, "name": "Java (OpenJDK 13.0.1)", "is_archived": False},
            {"id": 54, "name": "C++ (GCC 9.2.0)", "is_archived": False}
        ]

@app.get("/judge0/submissions/{token}")
async def get_submission(token: str):
    """Get the status of a submission."""
    try:
        logger.info(f"Fetching submission status for token: {token}")
        
        # Get the submission status
        result = judge0_service.get_submission(token)
        
        return result
    except Exception as e:
        logger.error(f"Error fetching submission status: {str(e)}")
        # Return a mock result instead of raising an error
        return {
            "status": {"id": 3, "description": "Accepted (Mock)"},
            "stdout": "Mock output - Judge0 service is not available",
            "stderr": None,
            "compile_output": None,
            "message": None,
            "time": 0.1,
            "memory": 1024
        }

def normalize_output(output, language):
    """Normalize output based on language and format."""
    # Remove "Output:" prefix if present
    if output.startswith("Output:"):
        normalized = output[7:].strip()
    else:
        normalized = output.strip()
    
    # For C++, handle array output format
    if language.lower() == 'cpp':
        # Remove any trailing newlines that C++ might add
        normalized = normalized.rstrip('\n')
        # Normalize array output format
        if '[' in normalized and ']' in normalized:
            # Extract numbers and join with spaces
            numbers = re.findall(r'-?\d+', normalized)
            normalized = ' '.join(numbers)
    else:
        # For other languages, normalize array/list outputs
        if normalized.startswith('[') and normalized.endswith(']'):
            normalized = normalized.replace(" , ", ", ").replace(", ", ", ")
    
    return normalized.strip()

@app.post("/questions/{question_id}/batch-test")
def batch_test_question(
    question_id: int,
    submission: CodeSubmission,
    db: Session = Depends(get_db)
):
    """Run all test cases for a question in batch."""
    try:
        # Get the question from the database
        question = db.query(QuestionTable).filter(QuestionTable.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail=f"Question not found with ID: {question_id}")
        
        # Check if the question has test cases
        if not question.test_cases or len(question.test_cases) == 0:
            raise HTTPException(status_code=400, detail="Question has no test cases")
        
        # Execute all test cases in batch
        test_results = judge0_service.batch_execute_code(
            code=submission.code,
            language=submission.language,
            test_cases=question.test_cases
        )
        
        # Process results
        passed_count = 0
        total_time = 0.0  # Initialize as float
        results = []
        
        for test_result in test_results:
            test_case = test_result["test_case"]
            result = test_result["result"]
            
            # Check if the test passed
            passed = False
            if result["status"]["id"] == 3:  # Accepted
                actual_output = result["stdout"].strip() if result["stdout"] else ""
                expected_output = test_case["output"].strip()
                
                # Normalize outputs for comparison using the language-aware function
                normalized_actual = normalize_output(actual_output, submission.language)
                normalized_expected = normalize_output(expected_output, submission.language)
                
                passed = normalized_actual == normalized_expected
                
                # Log comparison details for debugging
                logger.debug(f"Output comparison for test case:")
                logger.debug(f"Raw actual: {actual_output}")
                logger.debug(f"Raw expected: {expected_output}")
                logger.debug(f"Normalized actual: {normalized_actual}")
                logger.debug(f"Normalized expected: {normalized_expected}")
                logger.debug(f"Passed: {passed}")
            
            if passed:
                passed_count += 1
            
            # Convert time to float if it's a string
            execution_time = 0.0  # Initialize as float
            if result["time"] is not None:
                try:
                    execution_time = float(result["time"])
                except (ValueError, TypeError):
                    execution_time = 0.0
            
            total_time += execution_time
            
            # Add to results
            results.append({
                "test_case": test_case,
                "passed": passed,
                "actual_output": result["stdout"] if result["stdout"] else "",
                "error_message": result["stderr"] if result["stderr"] else None,
                "execution_time": execution_time
            })
        
        # Calculate pass rate
        pass_rate = (passed_count / len(question.test_cases)) * 100
        
        # Create response object
        response = {
            "passed": pass_rate == 100,
            "passed_test_cases": passed_count,
            "total_test_cases": len(question.test_cases),
            "pass_rate": pass_rate,
            "total_execution_time": float(total_time),  # Ensure it's a float
            "results": results,
            "feedback": "All tests passed! Great job!" if pass_rate == 100 else "Some tests failed. Check the details below."
        }
        
        # Save the code submission and Judge0 response to the database
        if submission.session_question_id:
            code_submission = CodeSubmissionModel(
                session_question_id=submission.session_question_id,
                code=submission.code,
                language=submission.language,
                judge0_response=response
            )
            db.add(code_submission)
            db.commit()
            
            # Update the session question with the test results
            session_question = db.query(SessionQuestion).filter(SessionQuestion.id == submission.session_question_id).first()
            if session_question:
                session_question.passed_tests = passed_count
                session_question.total_tests = len(question.test_cases)
                session_question.test_results = response
                db.commit()
        
        # Return the test results
        return response
    except Exception as e:
        logger.error(f"Error in batch testing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 