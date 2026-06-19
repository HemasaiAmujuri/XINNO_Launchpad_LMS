#!/bin/bash

# OraXinno LMS Backend Setup Script
echo "🚀 Setting up OraXinno LMS Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL command not found. Make sure PostgreSQL is installed and running."
fi

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your database credentials!"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "✨ Setup completed successfully!"
echo ""
echo "📧 Default Login Credentials:"
echo "   Admin:    admin@oraxinno.com / Admin@123"
echo "   Trainer:  trainer@oraxinno.com / Trainer@123"
echo "   Reviewer: reviewer@oraxinno.com / Reviewer@123"
echo "   Student:  student@oraxinno.com / Student@123"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "🎉 Backend will run on http://localhost:3001"
