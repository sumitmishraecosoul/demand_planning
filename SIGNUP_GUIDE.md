# Signup Feature - Development Only Guide

## 🎉 What's New

The project has been updated with the following changes:

### 1. ✅ Project Renamed: DataHive → Demand Planning
All references to "DataHive" have been updated to "Demand Planning" throughout the codebase.

### 2. ✅ Signup Page (Development Only)
A new signup page has been added at `/signup` that is **only accessible in development mode**.

---

## 📋 How Signup Works

### Development Mode (localhost)
- **Signup Available**: ✅ YES
- **URL**: `http://localhost:3000/signup`
- **Visible**: Login page shows "Sign Up" link
- **Access**: Anyone can create an account

### Production Mode (deployed)
- **Signup Available**: ❌ NO
- **Auto Redirect**: Automatically redirects to `/login`
- **Hidden**: No signup link visible anywhere
- **Access**: Only admins can create users via Admin Panel

---

## 🚀 Using the Signup Page

### Step 1: Access Signup (Development Only)

**Option A: From Login Page**
1. Go to `http://localhost:3000/login`
2. Look for "Sign Up" link at the bottom (with yellow "Dev Only" badge)
3. Click to go to signup page

**Option B: Direct URL**
1. Go directly to `http://localhost:3000/signup`
2. Works only in development mode

### Step 2: Fill Signup Form

The signup form requires different fields based on the role:

#### For All Users:
- **Name** (required)
- **Email** (required)
- **Password** (required, minimum 6 characters)
- **Confirm Password** (required, must match password)
- **Role** (required: User/Director/Admin)

#### For User Role:
- **Department** (required)
- **Designation** (required, e.g., "Junior Officer")
- **Level** (required, e.g., 1, 2, 3, 4)

#### For Director Role:
- **Department** (required)
- **Designation** (required, e.g., "Regional Director")

#### For Admin Role:
- No additional fields required

### Step 3: Submit

1. Click "Create Account" button
2. Wait for success message
3. Automatically redirected to login page
4. Login with your new credentials

---

## 💡 Example Signup Scenarios

### Example 1: Creating a Regular User

```
Name: John Doe
Email: john@company.com
Password: password123
Confirm Password: password123
Role: User
Department: Retail
Designation: Junior Data Analyst
Level: 1
```

### Example 2: Creating a Director

```
Name: Sarah Smith
Email: sarah@company.com
Password: password123
Confirm Password: password123
Role: Director
Department: Retail
Designation: Regional Director
```

### Example 3: Creating an Admin

```
Name: Admin User
Email: admin@demandplanning.com
Password: admin123
Confirm Password: admin123
Role: Admin
```

---

## 🔒 Security Features

### Environment-Based Access Control

The signup page checks `process.env.NODE_ENV`:

```typescript
// In signup page
useEffect(() => {
  const isDevMode = process.env.NODE_ENV === 'development';
  setIsDevelopment(isDevMode);

  if (!isDevMode) {
    // Redirect to login if not in development
    router.push('/login');
    return;
  }
}, [router]);
```

### Production Behavior

In production (when deployed):
1. `NODE_ENV` = `production`
2. Signup page automatically redirects to `/login`
3. No signup link visible on login page
4. Only admins can create users via Admin Panel

---

## 🎨 Visual Indicators

### Development Mode Badges

The signup page shows visual indicators that it's dev-only:

1. **Yellow Badge** on signup page header: "Development Mode Only"
2. **Yellow Badge** on login page signup link: "Dev Only"
3. **Automatic hiding** in production

---

## 🔧 How to Switch Modes

### Development Mode (Default)
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```
- `NODE_ENV` is automatically set to `development`
- Signup page is accessible

### Production Mode (Testing)
```bash
# Frontend - Build for production
cd frontend
npm run build
npm start
```
- `NODE_ENV` is automatically set to `production`
- Signup page redirects to login

---

## 📝 Environment Variables

### Frontend

No environment variable needed! The mode is automatically detected.

**Optional:** If you want to explicitly set it:

**`.env.local`** (for local development)
```env
NODE_ENV=development
```

**`.env.production`** (for production)
```env
NODE_ENV=production
```

But Next.js sets this automatically based on the command used.

---

## ✅ Validation Rules

### Password Requirements
- Minimum 6 characters
- Must match confirmation password

### Email Requirements
- Valid email format
- Must be unique (not already registered)

### Department Selection
- Required for User and Director roles
- Must select from existing departments
- Departments are fetched from the backend

### Level
- Required for User role only
- Must be a number (1, 2, 3, 4, etc.)
- Should match the configured levels for the department

---

## 🚨 Error Handling

The signup page handles various errors:

### Common Errors

**"Passwords do not match"**
- Solution: Make sure password and confirm password are identical

**"Please select a department"**
- Solution: Choose a department from the dropdown
- Note: Create departments first via Admin Panel

**"User with this email already exists"**
- Solution: Use a different email or login with existing account

**"Please enter your designation"**
- Solution: Fill in the designation field (e.g., "Junior Officer")

---

## 🔄 User Creation Workflow

### In Development (Recommended)

```
1. Start servers (both backend & frontend)
2. Admin creates departments via Admin Panel
3. Users visit /signup
4. Fill form and create account
5. Login immediately
6. Start using the system
```

### In Production (Admin-Managed)

```
1. Admin logs in
2. Goes to Admin Panel → Users
3. Creates user accounts manually
4. Provides credentials to users
5. Users login with provided credentials
6. Start using the system
```

---

## 📊 Changes Summary

### Files Modified

**Frontend:**
- ✅ Created: `frontend/src/app/signup/page.tsx` (new signup page)
- ✅ Updated: `frontend/src/app/login/page.tsx` (added signup link)
- ✅ Updated: `frontend/src/components/Layout.tsx` (renamed to Demand Planning)
- ✅ Updated: `frontend/src/app/layout.tsx` (updated title)
- ✅ Updated: `frontend/package.json` (renamed project)

**Backend:**
- ✅ Updated: `backend/server.js` (updated API message)
- ✅ Updated: `backend/package.json` (renamed project)

**Documentation:**
- ✅ Updated: `README.md` (renamed + signup info)
- ✅ Updated: `SETUP.md` (renamed + signup instructions)
- ✅ Updated: `frontend/README.md` (renamed)
- ✅ Updated: `backend/README.md` (renamed)
- ✅ Updated: `install.ps1` (renamed)
- ✅ Updated: `start-dev.ps1` (renamed)

---

## 🎯 Testing the Signup Feature

### Test in Development Mode

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Create a department first (as admin):**
   - Login as admin
   - Go to Admin Panel → Departments
   - Create "Retail" department

3. **Test signup:**
   - Go to http://localhost:3000/signup
   - Fill in the form (use Retail department)
   - Click "Create Account"
   - Should redirect to login
   - Login with new credentials

4. **Verify the account:**
   - Should see dashboard
   - Check user info in top-right
   - Verify department and level

### Test Production Mode Behavior

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

2. **Try to access signup:**
   - Go to http://localhost:3000/signup
   - Should automatically redirect to /login

3. **Check login page:**
   - Should NOT see "Sign Up" link
   - Signup is completely hidden

---

## ⚠️ Important Notes

1. **Always create departments first** before signing up users
2. **Signup link only appears in development** mode
3. **Production deployments** should use admin-managed user creation
4. **Email must be unique** - can't register same email twice
5. **Level numbers** should match your department hierarchy

---

## 🆘 Troubleshooting

### Issue: Can't see signup link on login page
**Solution:** Make sure you're in development mode
```bash
# Check your terminal output
# Should see: npm run dev (not npm start)
```

### Issue: Signup page redirects to login
**Solution:** You're in production mode
```bash
# Stop the server
# Run: npm run dev (not npm run build && npm start)
```

### Issue: No departments in dropdown
**Solution:** Create departments first
```bash
# Login as admin
# Go to Admin Panel → Departments
# Create at least one department
```

### Issue: Can't create admin user via signup
**Solution:** You can! Just select "Admin" role
```bash
# No department/level needed for admin
# Just name, email, password, and role
```

---

## 🎉 Benefits of Dev-Only Signup

### Development Benefits
✅ Quick testing with multiple users  
✅ Easy onboarding for developers  
✅ Fast account creation  
✅ No API calls needed  
✅ Self-service for team

### Production Security
✅ Prevents unauthorized registrations  
✅ Admin controls all user creation  
✅ Centralized user management  
✅ Better security and compliance  
✅ Audit trail through admin

---

## 📱 Screenshots Flow

### Development Mode
```
Login Page
   └─→ "Sign Up" link visible (with "Dev Only" badge)
          └─→ Signup Page
                 └─→ Create Account
                        └─→ Success → Redirect to Login
                               └─→ Login with new credentials
```

### Production Mode
```
Login Page
   └─→ No "Sign Up" link
   └─→ Direct /signup URL
          └─→ Automatic redirect to Login
```

---

**Signup feature is now ready! Test it in development mode and enjoy easy user creation! 🚀**
