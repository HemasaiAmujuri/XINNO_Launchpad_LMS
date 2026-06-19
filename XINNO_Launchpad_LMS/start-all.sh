#!/bin/bash

# Oraxinno LMS - Start All Services
echo "🚀 Starting Oraxinno LMS..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend-nextjs" ]; then
    echo -e "${RED}❌ Error: backend-nextjs directory not found!${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend-angular" ]; then
    echo -e "${RED}❌ Error: frontend-angular directory not found!${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd backend-nextjs
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID) - Port 3001${NC}"
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Backend is ready!${NC}"
else
    echo -e "${RED}⚠️  Backend might not be ready yet...${NC}"
fi

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend-angular
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID) - Port 4200${NC}"
cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Oraxinno LMS Started Successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}📍 Frontend:${NC} http://localhost:4200"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo -e "${BLUE}🛑 To stop servers:${NC}"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${BLUE}💡 Credentials:${NC}"
echo "   Admin: admin@oraxinno.com / Admin@123"
echo ""

# Save PIDs to file for easy cleanup
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "Press Ctrl+C to view logs..."
sleep 2

# Show combined logs
tail -f backend.log frontend.log
