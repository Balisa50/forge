@echo off
echo ============================================
echo   THE FORGE - Local Proctoring Server
echo   YOLOv5 + MediaPipe + OpenCV
echo   Port: 8900
echo ============================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install PyTorch CPU first (separate index, ~200MB)
echo Installing PyTorch CPU...
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu --quiet
echo.

REM Install other dependencies
echo Installing remaining dependencies...
pip install -r requirements.txt --quiet
echo.

REM Start server
echo Starting proctoring server on http://localhost:8900
echo.
python server.py
