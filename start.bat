@echo off
title SmartPocket Daily Expense Web App
echo ========================================================
echo         SmartPocket - Daily Expenses Web App
echo ========================================================
echo Starting local web server...
echo The app will automatically open in your default browser!
echo.
cd /d "%~dp0"
call npm run dev -- --open
pause
