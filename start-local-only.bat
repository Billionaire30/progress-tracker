@echo off
echo ========================================
echo Progress Tracker - Local Dev Only
echo ========================================
echo.
echo Starting Next.js dev server on localhost:3000
echo.
echo Access: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
npm run dev
