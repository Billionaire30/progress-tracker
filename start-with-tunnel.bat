@echo off
echo ========================================
echo Progress Tracker - Full Stack Start
echo ========================================
echo.
echo This script will:
echo 1. Start the Next.js dev server on localhost:3000
echo 2. Start Cloudflare tunnel for external access
echo 3. Enable Firebase cloud sync (when authenticated)
echo.
echo ========================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: cloudflared not found!
    echo Please install Cloudflare Tunnel:
    echo   npm install -g cloudflared --allow-scripts=cloudflared
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting Next.js dev server...
start "Progress Tracker Dev Server" cmd /k "cd /d "%~dp0" && npm run dev"

REM Wait for server to start
echo Waiting for dev server to initialize...
timeout /t 8 /nobreak >nul

echo [2/3] Starting Cloudflare tunnel...
echo This will provide an external URL for accessing the app
echo.

REM Start Cloudflare tunnel and capture the URL
echo Your Cloudflare tunnel URL will appear below. Note it for external access.
echo.

REM Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000

pause
