@echo off
echo Starting Flow-Sentinel Backend Server...
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please create a virtual environment first by running:
    echo python -m venv venv
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if installation was successful
if %errorlevel% neq 0 (
    echo.
    echo Error installing dependencies!
    pause
    exit /b 1
)

REM Start the server
echo.
echo Starting FastAPI server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM Keep window open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo Server stopped with an error!
    pause
)