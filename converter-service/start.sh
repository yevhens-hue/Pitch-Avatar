#!/bin/bash
cd "$(dirname "$0")"

# Active virtual environment
source venv/bin/activate

# Load environment variables
set -a
source ../.env.local
set +a

# Start the uvicorn server
exec uvicorn main:app --host 0.0.0.0 --port 8000
