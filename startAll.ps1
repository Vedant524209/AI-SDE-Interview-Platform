# PowerShell script to start both frontend and backend servers

Write-Host "Starting InterviewXpert servers..." -ForegroundColor Cyan

# Create a new PowerShell window for the backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; cd backend; python run.py"

# Create a new PowerShell window for the frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start"

Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to close this window. The server windows will remain open." -ForegroundColor Gray 