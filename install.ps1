# DataHive Installation Script for Windows PowerShell
# Run this script with: .\install.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Demand Planning Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional check)
Write-Host ""
Write-Host "Note: Make sure MongoDB is installed and running" -ForegroundColor Yellow
Write-Host "If not installed, download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
Write-Host ""

# Install Backend Dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Copy .env file if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Install Frontend Dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Open two terminal windows" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Start Backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 - Start Frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Read SETUP.md for detailed instructions!" -ForegroundColor Cyan
Write-Host ""
