import uvicorn
import logging
import os
import requests
import time
from services import MOCK_MODE

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def check_ollama_available():
    """Check if Ollama server is available and get available models"""
    try:
        logger.info("Checking if Ollama server is available...")
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [model.get("name") for model in models]
            logger.info(f"Ollama available with models: {model_names}")
            return True, model_names
        else:
            logger.warning(f"Ollama server responded with status {response.status_code}")
            return False, []
    except Exception as e:
        logger.warning(f"Ollama server not available: {str(e)}")
        return False, []

def main():
    """Main entry point for the application"""
    # Create database directory if it doesn't exist
    os.makedirs("./db", exist_ok=True)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Check if Ollama is available and get models
    ollama_available, available_models = check_ollama_available()
    
    # Set environment variables
    if not ollama_available:
        logger.warning("Ollama server not available, running in mock mode")
        os.environ["MOCK_MODE"] = "True"
    else:
        # Check if the requested model is available
        requested_model = os.environ.get("OLLAMA_MODEL", "llama3.2")
        if requested_model not in available_models:
            logger.warning(f"Requested model {requested_model} not available")
            
            if available_models:
                # Use the first available model
                os.environ["OLLAMA_MODEL"] = available_models[0]
                logger.info(f"Using available model: {available_models[0]}")
            else:
                # No models available, use mock mode
                logger.warning("No Ollama models available, running in mock mode")
                os.environ["MOCK_MODE"] = "True"
    
    # Start server
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 