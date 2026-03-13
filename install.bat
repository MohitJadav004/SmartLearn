@echo off
REM SmartLearn Installation Script for Windows

echo.
echo ====================================
echo  SmartLearn - Installation Script
echo ====================================
echo.

REM Check if running from root directory
if not exist "backend" (
    echo Error: backend folder not found!
    echo Please run this script from the smartlearn1 directory.
    pause
    exit /b 1
)

echo [1/6] Setting up Backend...
cd backend

echo.
echo Installing composer dependencies...
call composer install
if errorlevel 1 (
    echo Error: Composer install failed!
    pause
    exit /b 1
)

echo.
echo Generating application key...
php artisan key:generate

echo.
echo Installing Laravel Sanctum for authentication...
call composer require laravel/sanctum
if errorlevel 1 (
    echo Warning: Sanctum installation may have failed. Please run manually.
)

echo.
echo Running database migrations...
echo.
echo IMPORTANT: Make sure your MySQL database 'smartlearn' is created!
echo You can create it in phpMyAdmin or run:
echo   CREATE DATABASE smartlearn;
echo.
pause

php artisan migrate

if errorlevel 1 (
    echo.
    echo Error: Migration failed!
    echo Make sure:
    echo   1. MySQL is running (check XAMPP Control Panel)
    echo   2. Database 'smartlearn' exists
    echo   3. .env file has correct database credentials
    echo.
    pause
    exit /b 1
)

echo.
cd ..

echo [2/6] Backend setup complete!
echo.

echo [3/6] Setting up Frontend...
cd frontend

echo.
echo Installing npm dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo Error: npm install failed!
    pause
    exit /b 1
)

cd ..

echo [4/6] Frontend setup complete!
echo.

echo.
echo ====================================
echo  ✓ Installation Complete!
echo ====================================
echo.

echo To run the application:
echo.
echo 1. Terminal 1 - Backend:
echo    cd backend
echo    php artisan serve
echo.
echo 2. Terminal 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo Then open http://localhost:5173 in your browser.
echo.

echo.
echo ====================================
echo  Documentation
echo ====================================
echo.
echo - QUICK_START.md .......... Quick start guide
echo - SETUP_GUIDE.md .......... Detailed setup guide
echo - CONFIG_CHECKLIST.md .... Configuration checklist
echo - BUILD_SUMMARY.md ....... What has been built
echo.

pause
