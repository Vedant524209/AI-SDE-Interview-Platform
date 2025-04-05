# InterviewXpert Backend

This is the backend service for InterviewXpert, providing APIs for question generation and management using FastAPI and Llama 3.2 via Ollama.

## Features

- Generate coding interview questions with different difficulty levels (easy, medium, hard)
- Store questions in a SQLite database
- RESTful API endpoints for creating and retrieving questions

## Prerequisites

- Python 3.8+
- Ollama installed with Llama 3.2 model available
  - Install Ollama from [ollama.ai](https://ollama.ai/)
  - Pull the Llama 3.2 model: `ollama pull llama3.2`

## Setup

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment (optional but recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies
   ```
   pip install -r requirements.txt
   ```

## Running the Server

1. Make sure Ollama is running with the command:
   ```
   ollama serve
   ```

2. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

3. The API will be available at http://localhost:8000
4. API documentation is available at http://localhost:8000/docs

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /questions/` - Generate a new question with specified difficulty level
- `GET /questions/` - Get a list of all questions
- `GET /questions/{question_id}` - Get a specific question by ID

## Example Usage

Generate a new medium difficulty question:

```bash
curl -X POST "http://localhost:8000/questions/" \
     -H "Content-Type: application/json" \
     -d '{"difficulty": "medium"}'
```

## Future Enhancements

- Add JWT authentication
- Implement user feedback mechanism for questions
- Add rating system for questions
- Implement question categorization by topics 