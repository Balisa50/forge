#!/bin/bash
echo "============================================"
echo "  THE FORGE — Local Proctoring Server"
echo "  YOLOv5 + MediaPipe + OpenCV"
echo "  Port: 8900"
echo "============================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu --quiet
echo ""

# Start server
echo "Starting proctoring server on http://localhost:8900"
echo ""
python server.py
