#!/bin/bash

# OraXinno LMS - Master Setup Script
# This script sets up both backend and frontend automatically

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         OraXinno LMS - Complete Setup Script              ║"
echo "║    Learning Management System Installation                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm $(npm -v)${NC}"
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL command not found${NC}"
    echo "Please ensure PostgreSQL is installed and running"
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL installed${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Get database credentials
echo -e "${BLUE}📊 Database Configuration${NC}"
echo ""
read -p "Enter PostgreSQL username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name [oraxinno_lms]: " DB_NAME
DB_NAME=${DB_NAME:-oraxinno_lms}

read -p "Enter database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Setup Backend
echo -e "${BLUE}🚀 Setting up Backend (Next.js)...${NC}"
echo ""

cd backend-nextjs || exit 1

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4200"
ADMIN_EMAIL="admin@oraxinno.com"
ADMIN_PASSWORD="Admin@123"
EOF

echo -e "${GREEN}✅ .env file created${NC}"

# Setup database
echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""

# Return to root directory
cd ..

echo "════════════════════════════════════════════════════════════"
echo ""

# Setup Frontend
echo -e "${BLUE}🎨 Setting up Frontend (Angular)...${NC}"
echo ""

cd frontend-angular || exit 1

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Check if Angular CLI is installed globally
if ! command -v ng &> /dev/null; then
    echo "📥 Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

echo ""
echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""

# Return to root directory
cd ..

echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Default Credentials                     ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Role      │  Email                    │  Password        ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Admin     │  admin@oraxinno.com       │  Admin@123       ║"
echo "║  Trainer   │  trainer@oraxinno.com     │  Trainer@123     ║"
echo "║  Reviewer  │  reviewer@oraxinno.com    │  Reviewer@123    ║"
echo "║  Student   │  student@oraxinno.com     │  Student@123     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend-nextjs"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend-angular"
echo "   $ npm start"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:4200"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📚 For more information, see README.md"
echo ""
