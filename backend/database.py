from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get MySQL connection details from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "interviewxpert")
DB_PORT = os.getenv("DB_PORT", "3306")

# Create database URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    # Create engine
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL
    )
    logger.info(f"Connected to MySQL database at {DB_HOST}:{DB_PORT}")
except Exception as e:
    # Fallback to SQLite if MySQL connection fails
    logger.error(f"Failed to connect to MySQL: {str(e)}")
    logger.info("Falling back to SQLite database")
    
    # Create database directory if it doesn't exist
    os.makedirs("./db", exist_ok=True)
    
    # Use SQLite as fallback
    SQLALCHEMY_DATABASE_URL = "sqlite:///./db/interview_questions.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 