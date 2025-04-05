import subprocess
import sys
import time
import requests
import os

def check_ollama():
    """Check if Ollama is running properly."""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            print("✅ Ollama is running.")
            return True
        else:
            print("❌ Ollama is not responding correctly.")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama is not running. Please start it with 'ollama serve'.")
        return False

def check_llama_model():
    """Check if Llama 3.2 model is available."""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json().get("models", [])
            if any(model.get("name") == "llama3.2" for model in models):
                print("✅ Llama 3.2 model is available.")
                return True
            else:
                print("❌ Llama 3.2 model is not available. Please install it with 'ollama pull llama3.2'.")
                return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama is not running. Please start it with 'ollama serve'.")
        return False
    except Exception as e:
        print(f"❌ Error checking Llama 3.2 model: {str(e)}")
        return False

def main():
    print("🚀 Starting InterviewXpert Backend...")
    
    # Check prerequisites
    if not check_ollama():
        print("\nPlease start Ollama with 'ollama serve' in a separate terminal and try again.")
        sys.exit(1)
    
    # Start the FastAPI server
    try:
        print("\n🌐 Starting FastAPI server...")
        cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"\n❌ Error starting FastAPI server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 