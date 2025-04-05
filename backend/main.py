from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging

from database import get_db, engine, Base
from models import QuestionTable
from schemas import Question, QuestionCreate
from services import generate_question

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/questions/", response_model=Question)
async def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Received question creation request with difficulty: {question.difficulty}")
        
        # Generate question using LLM
        generated_question = generate_question(question.difficulty)
        logger.info("Successfully generated question from LLM")
        
        if not generated_question or "title" not in generated_question or "desc" not in generated_question:
            raise HTTPException(status_code=500, detail="Failed to generate valid question")
        
        # Create database record
        db_question = QuestionTable(
            title=generated_question["title"],
            desc=generated_question["desc"],
            difficulty=generated_question["difficulty"],
            example=generated_question.get("example"),
            constraints=generated_question.get("constraints", []),
            topics=generated_question.get("topics", [])
        )
        
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        logger.info(f"Successfully created question with ID: {db_question.id}")
        return db_question
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/questions/", response_model=List[Question])
def get_questions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    questions = db.query(QuestionTable).offset(skip).limit(limit).all()
    return questions

@app.get("/questions/{question_id}", response_model=Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(QuestionTable).filter(QuestionTable.id == question_id).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.get("/health")
def health_check():
    return {"status": "healthy"} 