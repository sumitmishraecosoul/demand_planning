# Demand Planning - Quick Setup Guide

Follow these steps to get Demand Planning up and running on your local machine.

## Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Step-by-Step Setup

### 1. Install MongoDB (if not already installed)

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file and update if needed
# The defaults should work for local development

# Start the backend server
npm run dev
```

Backend will start on `http://localhost:5000`

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### 3. Setup Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will start on `http://localhost:3000`

### 4. Create Admin User

You have two options:

**Option A: Via Signup Page (Development Only - RECOMMENDED)**

1. Make sure both backend and frontend are running
2. Go to http://localhost:3000/signup
3. Fill in the form:
   - Name: Admin User
   - Email: admin@demandplanning.com
   - Password: admin123
   - Role: Admin
4. Click "Create Account"
5. Login with your credentials

**Option B: Via API (using Postman or cURL)**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@demandplanning.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Option B: Via MongoDB Compass or MongoDB Shell**

1. Open MongoDB Compass and connect to `mongodb://localhost:27017`
2. Select `datahive` database → `users` collection
3. Insert a new document:
```json
{
  "name": "Admin User",
  "email": "admin@datahive.com",
  "password": "$2a$10$XYZ...", // Use bcrypt to hash "admin123"
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Easier Option A is recommended!**

### 5. Login and Configure System

1. Open browser and go to `http://localhost:3000`
2. Login with:
   - Email: `admin@demandplanning.com`
   - Password: `admin123`

   Or create a new account at: `http://localhost:3000/signup` (dev only)

3. **Create Departments:**
   - Click "Admin Panel" → "Manage Departments"
   - Create departments like "Retail", "Quick Commerce", "E-commerce"

4. **Configure Levels:**
   - Go to "Admin Panel" → "Manage Levels"
   - Select a department
   - Click "Configure Levels"
   - Add levels (e.g., L1, L2, L3, L4)
   - Save

5. **Create Users:**
   - Go to "Admin Panel" → "Users"
   - Create users for each department and level
   - Example:
     - Name: John Doe
     - Email: john@company.com
     - Password: password123
     - Role: User
     - Department: Retail
     - Level: 1
     - Designation: Junior Officer

6. **Start Using:**
   - Login as a user
   - Upload files
   - Review and pass files through levels

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `sudo systemctl status mongodb` (Linux) or check Services (Windows)
- Check MONGODB_URI in backend/.env

### Port Already in Use
- Change PORT in backend/.env to another port (e.g., 5001)
- Update frontend API URL accordingly

### Cannot Login
- Check backend console for errors
- Verify user exists in MongoDB
- Clear browser cache and cookies

### File Upload Errors
- Check backend/uploads folder exists (it's created automatically)
- Verify file size is under 10MB
- Check file type (PDF, CSV, Excel only)

## Default Ports

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

## Next Steps

1. Create more users for different levels
2. Upload test documents
3. Test the workflow by passing files through levels
4. Explore the tracking and status features

## Production Deployment

For production deployment:
1. Update JWT_SECRET in .env to a secure random string
2. Use a cloud MongoDB (MongoDB Atlas)
3. Build frontend: `npm run build`
4. Use PM2 or similar for backend process management
5. Setup reverse proxy with Nginx
6. Enable HTTPS

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review the README.md for detailed documentation
3. Contact your system administrator

## Important Notes

### Signup Page (Development Only)

The signup page at `/signup` is **only accessible in development mode**. 

- **Development**: `http://localhost:3000/signup` ✅ (visible)
- **Production**: Automatically redirects to login ❌ (hidden)

This is controlled by `process.env.NODE_ENV` and ensures that only admins can create accounts in production.

---

**Congratulations! Your Demand Planning system is ready to use! 🎉**
