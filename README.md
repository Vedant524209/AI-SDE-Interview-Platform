# InterviewXpert - AI Interview Practice Platform

InterviewXpert is an AI-powered platform for practicing technical coding interviews. It generates data structure and algorithm questions, allows you to write code solutions, and evaluates your answers.

## Project Structure

```
interviewxpert/
├── backend/           # Python FastAPI backend
│   ├── db/            # Database files
│   ├── models.py      # Database models
│   ├── schemas.py     # Pydantic schemas
│   ├── services.py    # Business logic and LLM integration
│   ├── main.py        # API endpoints
│   └── run.py         # Server startup script
├── src/               # React frontend
│   ├── components/    # React components
│   ├── services/      # API service layers
│   └── App.tsx        # Main application component
└── public/            # Static assets
```

## Starting the Application (Easy Way)

We've created a PowerShell script that starts both frontend and backend servers in separate windows:

```powershell
# Run the all-in-one starter script
cd interviewxpert
.\startAll.ps1
```

## Starting the Application (Windows PowerShell)

If you prefer to start servers manually:

```powershell
# First, start the backend
cd interviewxpert\backend
python run.py
```

Open a new PowerShell window:

```powershell
# Then start the frontend in a new window
cd interviewxpert
npm start
```

## Starting the Application (Command Prompt)

Using Windows Command Prompt:

```cmd
cd interviewxpert\backend
python run.py
```

Open a new Command Prompt window:

```cmd
cd interviewxpert
npm start
```

## Application URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features

- Generate coding interview questions of varying difficulties
- Code editor with multiple language support
- Test your code against the provided examples
- Get detailed feedback on your solution
- Track your performance across multiple interviews
- **NEW! Emotion Analysis** - Real-time tracking of your emotional state during interviews
  - Measures confidence and engagement levels
  - Provides visual feedback through webcam
  - Helps improve your interview performance by monitoring your demeanor

## Emotion Analysis

The emotion analysis feature captures your facial expressions through your webcam and analyzes them to provide real-time feedback on:

- Confidence level
- Engagement level
- Overall emotional state

This helps you understand how you appear to interviewers and improve your non-verbal communication during technical interviews. To use this feature:

1. Grant camera permissions when prompted
2. Position yourself clearly in the camera view
3. The emotion analysis panel will display your current emotional state

## Mock Mode

The application uses mock mode by default, which means it doesn't require the Ollama LLM to be running. This provides a consistent experience with predefined questions.

## Notes

- The backend automatically creates a SQLite database in the `db` directory
- The application doesn't require authentication for development purposes
