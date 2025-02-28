#!/bin/bash

# Start the backend server
cd backend
source venv/bin/activate
python3 run.py &
BACKEND_PID=$!

# Start the frontend server
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

# Wait for both processes
wait

