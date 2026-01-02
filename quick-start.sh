#!/bin/bash

# Quick Start Script for Seamless Auth Development

set -e

echo "🚀 Seamless Auth - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) found"
echo ""

# Check if PostgreSQL is running
if command -v pg_isready &> /dev/null; then
    if pg_isready &> /dev/null; then
        echo "✓ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
        echo "   macOS: brew services start postgresql"
        echo "   Linux: sudo systemctl start postgresql"
        echo "   Docker: docker run --name seamless-auth-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=seamless_auth -p 5432:5432 -d postgres:15"
        exit 1
    fi
else
    echo "⚠️  PostgreSQL not found. Please install and start PostgreSQL."
    exit 1
fi

echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo "   ⚠️  Please update DATABASE_URL in backend/.env with your PostgreSQL credentials"
fi

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

echo "   Generating Prisma client..."
npm run prisma:generate

echo "   Pushing database schema..."
npm run prisma:push

echo "✓ Backend setup complete"
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -f ".env.local" ]; then
    echo "   Creating .env.local file..."
    cp .env.example .env.local
fi

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

echo "✓ Frontend setup complete"
echo ""

# Instructions
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update backend/.env with your PostgreSQL credentials if needed"
echo ""
echo "2. Start the backend (in terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start the frontend (in terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo ""
echo "5. Test the application:"
echo "   - Sign up at: http://localhost:3000/signup"
echo "   - Get your API key from the dashboard"
echo "   - Test embed at: demo-embed.html (update with your API key)"
echo ""
echo "📖 For detailed testing instructions, see TESTING.md"
echo "🚀 For deployment instructions, see DEPLOYMENT.md"
echo ""
