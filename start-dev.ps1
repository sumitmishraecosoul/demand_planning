# Demand Planning Development Startup Script for Windows PowerShell
# Run this script with: .\start-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Demand Planning Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Starting! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two new PowerShell windows will open with the servers." -ForegroundColor Yellow
Write-Host "Wait a few seconds for them to start, then open:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
