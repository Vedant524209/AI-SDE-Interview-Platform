import os
import sys
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def init_database():
    """Initialize the database if it doesn't exist."""
    # Get MySQL connection details from environment variables
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "4590")
    DB_NAME = os.getenv("DB_NAME", "interviewxpert")
    DB_PORT = os.getenv("DB_PORT", "3306")
    
    # Create connection URL without database name
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}"
    
    try:
        # Connect to MySQL server
        logger.info(f"Connecting to MySQL server at {DB_HOST}:{DB_PORT}")
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        
        # Check if database exists
        with engine.connect() as conn:
            result = conn.execute(text(f"SHOW DATABASES LIKE '{DB_NAME}'"))
            database_exists = result.fetchone() is not None
            
            if not database_exists:
                logger.info(f"Database '{DB_NAME}' does not exist. Creating it...")
                conn.execute(text(f"CREATE DATABASE {DB_NAME}"))
                conn.commit()
                logger.info(f"Database '{DB_NAME}' created successfully.")
            else:
                logger.info(f"Database '{DB_NAME}' already exists.")
        
        # Now connect to the specific database
        DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        engine = create_engine(DB_URL)
        
        # Import models to create tables
        from models import Base
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
        
        return True
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return False

if __name__ == "__main__":
    success = init_database()
    if success:
        logger.info("Database initialization completed successfully.")
        sys.exit(0)
    else:
        logger.error("Database initialization failed.")
        sys.exit(1) 