@echo off
echo ========================================
echo Update Cloudflare Tunnel URL
echo ========================================
echo.
echo Current Tunnel URL: blue-metals-processing-photographic.trycloudflare.com
echo.
echo This script will update all documentation files with the new tunnel URL.
echo.
echo Note: The tunnel URL changes each time you start a new tunnel.
echo You may need to run this script again if the URL changes.
echo.
echo ========================================
echo.

REM Update next.config.js
echo Updating next.config.js...
powershell -Command "(Get-Content next.config.js) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content next.config.js"

REM Update INTEGRATION_SUMMARY.md
echo Updating INTEGRATION_SUMMARY.md...
powershell -Command "(Get-Content INTEGRATION_SUMMARY.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content INTEGRATION_SUMMARY.md"

REM Update INTEGRATION_GUIDE.md
echo Updating INTEGRATION_GUIDE.md...
powershell -Command "(Get-Content INTEGRATION_GUIDE.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content INTEGRATION_GUIDE.md"

REM Update INTEGRATION_COMPLETE.md
echo Updating INTEGRATION_COMPLETE.md...
powershell -Command "(Get-Content INTEGRATION_COMPLETE.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content INTEGRATION_COMPLETE.md"

REM Update INTEGRATION_VERIFICATION.md
echo Updating INTEGRATION_VERIFICATION.md...
powershell -Command "(Get-Content INTEGRATION_VERIFICATION.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content INTEGRATION_VERIFICATION.md"

REM Update CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md
echo Updating CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md...
powershell -Command "(Get-Content CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md"

REM Update VERIFICATION_COMPLETE.md
echo Updating VERIFICATION_COMPLETE.md...
powershell -Command "(Get-Content VERIFICATION_COMPLETE.md) -replace 'complicated-logo-wonder-passes\.trycloudflare\.com', 'blue-metals-processing-photographic.trycloudflare.com' | Set-Content VERIFICATION_COMPLETE.md"

echo.
echo ========================================
echo Update Complete
echo ========================================
echo.
echo All documentation files have been updated with the new tunnel URL.
echo.
echo IMPORTANT: You need to restart the dev server for the changes to take effect.
echo.
echo To restart:
echo 1. Stop the current dev server (Ctrl+C)
echo 2. Run: npm run dev
echo.
pause
