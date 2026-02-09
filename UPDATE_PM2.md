# 🚀 Update PM2 Configuration on Mac Studio

## What Changed?
- Added `env_file` to `ecosystem.config.js` to load `.env` files
- This fixes the MongoDB and Brevo API key errors

## Steps to Deploy on Mac Studio

### 1. SSH into Mac Studio
```bash
# From office network
ssh thrivestudio@192.168.50.29

# From outside office
ssh thrivestudio@49.249.157.19
```

### 2. Navigate to Project Directory
```bash
cd ~/Developer/demand_planning
```

### 3. Pull Latest Changes
```bash
git fetch origin
git checkout feature/multilevel_2.1
git pull origin feature/multilevel_2.1
```

### 4. Verify .env Files Exist

**Backend .env:**
```bash
cat backend/.env
```

Should contain:
```env
MONGO_URI=mongodb://localhost:27017/demand-planning
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=5002
NODE_ENV=production
FRONTEND_URL=http://192.168.50.29:3000
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@thrivebrands.ai
BREVO_SENDER_NAME=Demand Planning System
```

**Frontend .env.local:**
```bash
cat frontend/.env.local
```

Should contain:
```env
NEXT_PUBLIC_API_URL=http://192.168.50.29:5002/api
NODE_ENV=production
```

### 5. Rebuild Frontend (Important!)
```bash
cd frontend
npm run build
cd ..
```

### 6. Restart PM2 with Updated Config
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### 7. Check Logs
```bash
pm2 logs
```

**Expected Output (Backend):**
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

**Should NOT see:**
```
❌ MongoDB Connection Error: uri parameter must be a string
⚠️ BREVO_API_KEY not configured
```

### 8. Test the Application

**From Mac Studio terminal:**
```bash
# Test backend
curl http://localhost:5002/api/health

# Test frontend
curl http://localhost:3000
```

**From browser on any device in office:**
```
http://192.168.50.29:3000
```

### 9. Enable PM2 Auto-Start on Reboot (if not already done)
```bash
pm2 startup
# Copy and run the command it outputs
pm2 save
```

## Troubleshooting

### If MongoDB still fails:
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if needed
brew services start mongodb-community
```

### If frontend build fails:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
cd ..
pm2 restart demand-planning-frontend
```

### View specific app logs:
```bash
pm2 logs demand-planning-backend
pm2 logs demand-planning-frontend
```

### Check PM2 status:
```bash
pm2 status
```

## What This Fixed
✅ PM2 now loads `.env` files automatically  
✅ MongoDB connection will work  
✅ Brevo email service will be configured  
✅ No more "uri parameter must be a string" errors  
✅ Frontend will have correct API URL  

## Important Notes
- **Nginx does NOT need any changes** - it only forwards traffic
- `.env` files are loaded by PM2, not Nginx
- After any `.env` changes, always restart PM2
- Frontend needs rebuild after env changes
