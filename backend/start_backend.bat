@echo off
echo Starting Flow Sentinel Backend
echo ================================================================

:: Activate venv
call venv\Scripts\activate.bat

:: Upgrade pip 
python -m pip install --upgrade pip

:: Install dependencies
pip install -r requirements.txt

:: Set environment variable for Alembic (Windows syntax)
set "PYTHONPATH=."

:: Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
