@echo off
echo ========================================
echo    AccNext - Financial Tracking System
echo    Solution NextGen
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is ready

echo.
echo [2/5] Checking project structure...
if not exist "backend" (
    echo [ERROR] Backend folder not found
    echo    Please run project creation commands first
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] Frontend folder not found
    echo    Please run project creation commands first
    pause
    exit /b 1
)

echo [OK] Project structure is correct

echo.
echo [3/5] Installing Backend Dependencies...
cd backend
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Backend dependencies installation failed
        pause
        exit /b 1
    )
) else (
    echo [OK] Backend dependencies already installed
)

echo.
echo [4/5] Setting up database...
if not exist .env (
    echo [INFO] Creating .env file...
    copy env.example .env >nul
    echo [OK] .env file created successfully
) else (
    echo [OK] .env file already exists
)

echo.
echo [5/5] Running Database Migrations...
echo [INFO] Running migrations...
npm run migrate
if errorlevel 1 (
    echo [ERROR] Database migrations failed
    echo    Check database connection in .env file
    pause
    exit /b 1
)

echo.
echo [6/6] Adding sample data...
echo [INFO] Adding sample data...
npm run seed
if errorlevel 1 (
    echo [ERROR] Adding sample data failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Starting servers...
echo ========================================
echo.

echo [INFO] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %cd% && npm run dev"

echo.
echo [INFO] Waiting for Backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo [7/7] Installing Frontend Dependencies...
cd ..\frontend
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Frontend dependencies installation failed
        pause
        exit /b 1
    )
) else (
    echo [OK] Frontend dependencies already installed
)

echo.
echo [INFO] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %cd% && npm run dev"

echo.
echo ========================================
echo    [OK] System is ready!
echo ========================================
echo.
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend API: http://localhost:5000
echo [INFO] Health Check: http://localhost:5000/health
echo.
echo [INFO] Default accounts:
echo    Admin: admin@accnext.com / password123
echo    Accountant: accountant@accnext.com / password123
echo    Viewer: viewer@accnext.com / password123
echo.
echo [INFO] See SETUP.md for usage guide
echo.
echo Press any key to close this window...
pause >nul 