# InterviewXpert Backend

This backend service is designed to generate DSA (Data Structures and Algorithms) coding interview questions using the Llama3 model running locally with Ollama.

## Features

- Generates coding interview questions with varying difficulty levels
- Uses Llama3 to create realistic DSA questions
- Provides questions with detailed descriptions, examples, test cases, and constraints
- RESTful API endpoints for question generation and retrieval

## Prerequisites

- Python 3.8+ installed
- [Ollama](https://ollama.ai/) installed and running
- Llama3 model pulled in Ollama

## Installation

1. Install Ollama following instructions at [ollama.ai](https://ollama.ai/)

2. Pull the Llama3 model (you can use any size that fits your hardware):
   ```bash
   ollama pull llama3.2
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Backend

1. Start the Ollama server:
   ```bash
   ollama serve
   ```

2. In a separate terminal, start the backend server:
   ```bash
   python run.py
   ```

   The server will start at http://localhost:8000

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /questions/` - Generate a new question (requires a difficulty level)
- `GET /questions/` - Retrieve a list of generated questions
- `GET /questions/{question_id}` - Retrieve a specific question by ID

## Example API Usage

Generate a new question:
```bash
curl -X POST "http://localhost:8000/questions/" -H "Content-Type: application/json" -d '{"difficulty":"medium"}'
```

Retrieve all questions:
```bash
curl "http://localhost:8000/questions/"
```

## Question Format

Generated questions follow this JSON schema:
```json
{
  "title": "String",
  "desc": "String",
  "difficulty": "String (easy/medium/hard)",
  "example": {
    "input": "String",
    "output": "String",
    "explanation": "String"
  },
  "constraints": ["String"],
  "topics": ["String"],
  "test_cases": [
    {
      "input": "String",
      "output": "String",
      "explanation": "String"
    }
  ]
}
```

## Troubleshooting

- If you encounter issues with the Ollama connection, ensure the Ollama server is running using `ollama serve`
- For other issues, check the server logs for detailed error information

## Future Enhancements

- Add JWT authentication
- Implement user feedback mechanism for questions
- Add rating system for questions
- Implement question categorization by topics 