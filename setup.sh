#!/bin/bash

# Team Management App - Setup Script for macOS/Linux

echo ""
echo "======================================"
echo "Team Management App - Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found: "
node --version

echo ""
echo "Installing backend dependencies..."
cd "$(dirname "$0")/backend"
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Terminal 1 - Start Backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. Terminal 2 - Start Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "Default Admin Credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "======================================"
