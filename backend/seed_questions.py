import logging
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import QuestionTable
from services import MOCK_QUESTIONS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def seed_questions(db: Session):
    """Seed the database with sample questions if none exist."""
    # Check if questions already exist
    count = db.query(QuestionTable).count()
    if count > 0:
        logger.info(f"Database already has {count} questions, skipping seed")
        return
    
    logger.info("Seeding database with sample questions")
    for question_data in MOCK_QUESTIONS:
        db_question = QuestionTable(
            title=question_data["title"],
            desc=question_data["desc"],
            difficulty=question_data["difficulty"],
            example=question_data["example"],
            constraints=question_data.get("constraints", []),
            topics=question_data.get("topics", []),
            test_cases=question_data.get("test_cases", [])
        )
        db.add(db_question)
    
    db.commit()
    logger.info(f"Added {len(MOCK_QUESTIONS)} sample questions to the database")

def main():
    """Seed the database with sample questions."""
    db = next(get_db())
    try:
        seed_questions(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    main() 