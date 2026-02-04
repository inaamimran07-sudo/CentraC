@echo off
REM Team Management App - Setup Script for Windows

echo.
echo ======================================
echo Team Management App - Setup
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo To start the application:
echo.
echo 1. Terminal 1 - Start Backend:
echo    cd backend
echo    npm start
echo.
echo 2. Terminal 2 - Start Frontend:
echo    cd frontend
echo    npm start
echo.
echo Default Admin Credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo ======================================
pause
