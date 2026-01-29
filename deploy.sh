#!/bin/bash

# 🚀 Demand Planning Deployment Script for Mac Studio
# This script deploys/updates the application

set -e  # Exit on any error

echo "🚀 Starting Demand Planning Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📍 Working directory: $SCRIPT_DIR${NC}"
echo ""

# Step 1: Pull latest changes (optional, uncomment if needed)
# echo -e "${BLUE}📥 Pulling latest changes from Git...${NC}"
# git pull origin main
# echo -e "${GREEN}✅ Git pull completed${NC}"
# echo ""

# Step 2: Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Install frontend dependencies and build
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

echo -e "${BLUE}🏗️  Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend build completed${NC}"
echo ""

# Step 4: Create logs directory if it doesn't exist
cd ..
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ Logs directory ready${NC}"
echo ""

# Step 5: Restart PM2 processes
echo -e "${BLUE}🔄 Restarting PM2 processes...${NC}"

if pm2 list | grep -q "demand-planning"; then
  echo -e "${YELLOW}Found existing PM2 processes. Restarting...${NC}"
  pm2 restart ecosystem.config.js
  echo -e "${GREEN}✅ PM2 processes restarted${NC}"
else
  echo -e "${YELLOW}No existing PM2 processes found. Starting new...${NC}"
  pm2 start ecosystem.config.js
  echo -e "${GREEN}✅ PM2 processes started${NC}"
fi

# Save PM2 configuration
pm2 save
echo ""

# Step 6: Show status
echo -e "${BLUE}📊 Current PM2 Status:${NC}"
pm2 status
echo ""

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "  ${YELLOW}pm2 status${NC}          - View process status"
echo -e "  ${YELLOW}pm2 logs${NC}            - View all logs"
echo -e "  ${YELLOW}pm2 monit${NC}           - Real-time monitoring"
echo -e "  ${YELLOW}pm2 restart all${NC}     - Restart all processes"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo -e "  Frontend: ${YELLOW}http://YOUR_STATIC_IP:3000${NC}"
echo -e "  Backend:  ${YELLOW}http://YOUR_STATIC_IP:5002${NC}"
echo ""
