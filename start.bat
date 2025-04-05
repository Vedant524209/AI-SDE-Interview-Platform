@echo off
echo Starting InterviewXpert...

REM Start backend in a new window
start "InterviewXpert Backend" cmd /c "cd backend && python run.py"

REM Wait a moment for the backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in the current window
echo Starting frontend...
npm start

echo Both servers are starting. Please wait a moment...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000 