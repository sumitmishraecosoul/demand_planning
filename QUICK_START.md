# 🚀 Quick Start - Demand Planning

## ⚡ Fast Setup (5 Minutes)

### Step 1: Install (30 seconds)
```powershell
.\install.ps1
```

### Step 2: Create .env file (Backend)
Create `backend/.env`:
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/datahive
JWT_SECRET=datahive_secret_key_2026_change_in_production
NODE_ENV=development
```

### Step 3: Start Servers (30 seconds)
```powershell
.\start-dev.ps1
```

### Step 4: Create Admin Account (1 minute)

**Option A: Via Signup (RECOMMENDED)** ✨
1. Go to http://localhost:3000/signup
2. Fill in:
   - Name: Admin User
   - Email: admin@demandplanning.com
   - Password: admin123
   - Role: Admin
3. Click "Create Account"

**Option B: Via API**
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@demandplanning.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Step 5: Login & Configure (3 minutes)
1. Login at http://localhost:3000
2. Create Department: Admin Panel → Departments
3. Configure Levels: Admin Panel → Manage Levels
4. Create Users: Admin Panel → Users (or use /signup)

**Done! 🎉**

---

## 📍 Important URLs

| Page | URL | Available |
|------|-----|-----------|
| **Login** | http://localhost:3000/login | Always |
| **Signup** | http://localhost:3000/signup | Dev Only ⚠️ |
| **Dashboard** | http://localhost:3000/dashboard | After login |
| **Admin Panel** | http://localhost:3000/admin | Admin only |
| **Backend API** | http://localhost:5000/api | Always |

---

## 🔑 Default Credentials

```
Email:    admin@demandplanning.com
Password: admin123
Role:     Admin
```

---

## 🎯 Quick Actions

### Create Department
```
Admin Panel → Departments → Create Department
Name: Retail
Description: Retail Department
```

### Configure Levels
```
Admin Panel → Manage Levels → Select Department → Configure Levels
L1: Junior Officer
L2: Senior Officer  
L3: Manager
L4: Director
```

### Create User (via Signup - Dev Only)
```
Go to: http://localhost:3000/signup
Name: John Doe
Email: john@company.com
Password: password123
Role: User
Department: Retail
Level: 1
Designation: Junior Officer
```

### Upload File
```
Dashboard → Upload File
Select CSV/PDF → Add title → Sign → Submit
```

---

## ⚠️ Important Notes

### Signup Page (Development Only)

✅ **Development Mode:**
- Signup available at `/signup`
- "Sign Up" link visible on login
- Anyone can create account

❌ **Production Mode:**
- Signup redirects to login
- No signup link visible
- Admin-only user creation

### Check Your Mode
```bash
# Development (signup works)
npm run dev

# Production (signup disabled)
npm run build
npm start
```

---

## 🆘 Quick Troubleshooting

### Can't connect to MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Backend won't start
```bash
cd backend
# Check .env file exists
# Check MongoDB is running
npm run dev
```

### Frontend won't start
```bash
cd frontend
npm run dev
```

### Can't see signup page
```bash
# Make sure you're in development mode
# Check: npm run dev (NOT npm start)
```

### No departments in dropdown
```bash
# Login as admin first
# Create departments via Admin Panel
```

---

## 📚 Full Documentation

- **CHANGES_SUMMARY.md** - All recent changes
- **SIGNUP_GUIDE.md** - Complete signup documentation
- **SETUP.md** - Detailed setup guide
- **README.md** - Full system documentation

---

## ✅ Quick Test

1. ✅ Visit http://localhost:3000/signup
2. ✅ See "Development Mode Only" badge
3. ✅ Create admin account
4. ✅ Login successfully
5. ✅ Create a department
6. ✅ Create a regular user via signup
7. ✅ Upload a test file
8. ✅ Pass file to next level

---

**Ready to go! Start building! 🚀**
