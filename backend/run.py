import uvicorn
import logging
import os
import sys
import requests
import time
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Always use mock mode to avoid Ollama timeouts
DEFAULT_MOCK_MODE = True

def check_ollama_available():
    """Check if Ollama server is running and available"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            if models:
                logger.info(f"Ollama is available with models: {', '.join([m['name'] for m in models])}")
                return True, models
            else:
                logger.warning("Ollama is running but no models found")
                return True, []
        else:
            logger.warning(f"Ollama returned status code: {response.status_code}")
            return False, []
    except requests.exceptions.ConnectionError:
        logger.warning("Ollama server is not running on localhost:11434")
        return False, []
    except Exception as e:
        logger.warning(f"Error checking Ollama availability: {e}")
        return False, []

def main():
    # Create db directory if it doesn't exist
    db_dir = Path("db")
    db_dir.mkdir(exist_ok=True)
    
    # Force mock mode to avoid Ollama timeouts
    logger.warning("Using mock mode for question generation (Ollama not required)")
    os.environ["USE_MOCK_MODE"] = "True"
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 