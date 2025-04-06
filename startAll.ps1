# PowerShell script to start both backend and frontend servers

Write-Host "Starting InterviewXpert servers..."

# Start backend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python run.py"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start frontend server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start"

Write-Host "Both servers are starting in separate windows."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Press Ctrl+C to close this window. The server windows will remain open." 