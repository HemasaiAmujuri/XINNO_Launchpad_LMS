#!/bin/bash

# Stop all Oraxinno LMS services

echo "🛑 Stopping Oraxinno LMS..."

# Read PIDs from files
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    else
        echo "ℹ️  Backend already stopped"
    fi
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo "ℹ️  Frontend already stopped"
    fi
    rm .frontend.pid
fi

# Kill any remaining processes on ports
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "🔧 Killed any remaining process on port 3001"
lsof -ti:4200 | xargs kill -9 2>/dev/null && echo "🔧 Killed any remaining process on port 4200"

echo "✅ All services stopped!"
