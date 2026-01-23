# Debug Script for Signup Issue
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Signup Debug Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .next exists
Write-Host "1. Checking .next folder..." -ForegroundColor Yellow
if (Test-Path .next) {
    Write-Host "   [X] .next folder exists (will delete)" -ForegroundColor Red
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   [OK] .next deleted" -ForegroundColor Green
} else {
    Write-Host "   [OK] .next does not exist (good)" -ForegroundColor Green
}

# Check if config.ts exists
Write-Host ""
Write-Host "2. Checking config.ts..." -ForegroundColor Yellow
if (Test-Path "src\lib\config.ts") {
    Write-Host "   [OK] config.ts exists" -ForegroundColor Green
} else {
    Write-Host "   [X] config.ts NOT found!" -ForegroundColor Red
}

# Check if signup page exists
Write-Host ""
Write-Host "3. Checking signup page..." -ForegroundColor Yellow
if (Test-Path "src\app\signup\page.tsx") {
    Write-Host "   [OK] signup page exists" -ForegroundColor Green
} else {
    Write-Host "   [X] signup page NOT found!" -ForegroundColor Red
}

# Check if test-env page exists
Write-Host ""
Write-Host "4. Checking test-env page..." -ForegroundColor Yellow
if (Test-Path "src\app\test-env\page.tsx") {
    Write-Host "   [OK] test-env page exists" -ForegroundColor Green
} else {
    Write-Host "   [X] test-env page NOT found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Starting Development Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After server starts:" -ForegroundColor Yellow
Write-Host "1. Visit: http://localhost:3000/test-env" -ForegroundColor White
Write-Host "2. Check what it shows" -ForegroundColor White
Write-Host "3. Then visit: http://localhost:3000/signup" -ForegroundColor White
Write-Host ""

# Start the dev server
npm run dev
