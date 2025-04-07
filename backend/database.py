from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, text
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
DB_PASSWORD = os.getenv("DB_PASSWORD", "4590")
DB_NAME = os.getenv("DB_NAME", "interviewxpert")
DB_PORT = os.getenv("DB_PORT", "3306")

# Create database URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

logger.info(f"Connecting to MySQL database at {DB_HOST}:{DB_PORT} with user {DB_USER}")

# Create engine with proper error handling
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Enable connection health checks
        pool_recycle=3600,   # Recycle connections after 1 hour
        pool_size=5,         # Set a reasonable pool size
        max_overflow=10,     # Allow some overflow connections
        echo=False           # Set to True for SQL query logging
    )
    
    # Test the connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        result.fetchone()
    logger.info(f"Successfully connected to MySQL database at {DB_HOST}:{DB_PORT}")
except Exception as e:
    logger.error(f"Failed to connect to MySQL: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 