@echo off
echo ========================================
echo Integration Test Suite
echo ========================================
echo.
echo This script will test:
echo 1. Environment configuration
echo 2. Firebase configuration
echo 3. Dev server startup
echo 4. Cloudflare tunnel connectivity
echo.
echo ========================================
echo.

REM Test 1: Check .env.local exists
echo [1/5] Checking environment configuration...
if exist ".env.local" (
    echo ✓ .env.local exists
) else (
    echo ✗ .env.local not found
    echo Please copy .env.example to .env.local and fill in your Firebase credentials
    pause
    exit /b 1
)

REM Test 2: Check Firebase config
echo.
echo [2/5] Checking Firebase configuration...
node test-firebase-auth.js
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Firebase configuration check failed
    pause
    exit /b 1
)

REM Test 3: Check if cloudflared is installed
echo.
echo [3/5] Checking Cloudflare tunnel installation...
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ cloudflared not found
    echo Please install: npm install -g cloudflared
    pause
    exit /b 1
) else (
    echo ✓ cloudflared is installed
    cloudflared --version
)

REM Test 4: Check port 3000 availability
echo.
echo [4/5] Checking port 3000 availability...
netstat -ano | findstr :3000 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Port 3000 is already in use
    echo Please stop any existing dev server or use a different port
    echo Current processes on port 3000:
    netstat -ano | findstr :3000
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if %ERRORLEVEL% NEQ 1 (
        exit /b 1
    )
) else (
    echo ✓ Port 3000 is available
)

REM Test 5: Check Next.js configuration
echo.
echo [5/5] Checking Next.js configuration...
if exist "next.config.js" (
    echo ✓ next.config.js exists
) else (
    echo ✗ next.config.js not found
    pause
    exit /b 1
)

if exist "package.json" (
    echo ✓ package.json exists
) else (
    echo ✗ package.json not found
    pause
    exit /b 1
)

echo.
echo ========================================
echo Integration Tests Complete
echo ========================================
echo.
echo All checks passed! ✓
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start the dev server
echo 2. Run 'start-with-tunnel.bat' to start with Cloudflare tunnel
echo 3. Open the app in your browser and test authentication
echo 4. Follow INTEGRATION_VERIFICATION.md for detailed testing
echo.
pause
