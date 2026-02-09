# PM2 Working Directory Fix - Critical Issue

## The Problem (Feb 6, 2026)

**Symptom:** Application works perfectly when run manually but fails with PM2:
- ✅ Works: `cd backend && node server.js`
- ✅ Works: `cd backend && npm run dev`
- ❌ Fails: `pm2 start ecosystem.config.js`

**Error:**
```
❌ MongoDB Connection Error: uri parameter must be a string, got "undefined"
⚠️ BREVO_API_KEY not configured
```

## Root Cause Analysis

### Why Manual Run Works:
```bash
cd backend
node server.js
```

1. Current working directory: `backend/`
2. `dotenv.config()` looks for `.env` in current directory
3. Finds `backend/.env` ✅
4. All environment variables loaded ✅

### Why PM2 Fails (BEFORE fix):

**Old Configuration:**
```javascript
{
  name: 'demand-planning-backend',
  script: './backend/server.js',  // ❌ Script path from project root
  env_file: './backend/.env',     // ❌ Path from project root
}
```

**What PM2 Does:**
1. Starts from project root directory
2. Runs `./backend/server.js` from root
3. `dotenv.config()` looks for `.env` in **current directory** (root)
4. Doesn't find `root/.env` ❌
5. Even though `env_file` is set, cluster mode can break this
6. Result: `process.env.MONGO_URI === undefined`

## The Solution

### Key Concept: `cwd` (Current Working Directory)

PM2's `cwd` option tells PM2 to **change directory first** before running the script.

**Correct Configuration:**
```javascript
{
  name: 'demand-planning-backend',
  script: 'server.js',       // ✅ Relative to cwd
  cwd: './backend',          // ✅ Change to backend/ first
  exec_mode: 'fork',         // ✅ Fork mode for reliable env loading
  env_file: '.env',          // ✅ Relative to backend/
}
```

**What PM2 Does Now:**
1. Changes to `./backend/` directory first
2. Runs `server.js` from there
3. `dotenv.config()` looks for `.env` in current directory
4. Finds `backend/.env` ✅
5. All environment variables loaded ✅
6. **Behaves EXACTLY like manual run** ✅

## Complete Fixed Configuration

### Backend (Fixed):
```javascript
{
  name: 'demand-planning-backend',
  script: 'server.js',              // Relative to cwd
  cwd: './backend',                 // ⭐ CRITICAL: Set working directory
  exec_mode: 'fork',                // Fork mode (not cluster)
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 5002,
  },
  env_file: '.env',                 // ⭐ Relative to ./backend/
  error_file: '../logs/backend-error.log',
  out_file: '../logs/backend-out.log',
  log_file: '../logs/backend-combined.log',
  time: true,
}
```

### Frontend (Fixed):
```javascript
{
  name: 'demand-planning-frontend',
  script: 'npm',
  args: 'start',
  cwd: './frontend',                // ⭐ CRITICAL: Set working directory
  exec_mode: 'fork',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
  },
  env_file: '.env.local',           // ⭐ Relative to ./frontend/
  error_file: '../logs/frontend-error.log',
  out_file: '../logs/frontend-out.log',
  log_file: '../logs/frontend-combined.log',
  time: true,
}
```

## Why `exec_mode: 'fork'` Matters

PM2 has two execution modes:

1. **Fork Mode** (recommended for our case):
   - Single process
   - Environment variables load reliably
   - `dotenv` works as expected
   - Simpler, more predictable

2. **Cluster Mode** (not needed here):
   - Multiple processes
   - Load balancing
   - Can have env loading issues
   - Overkill for single backend API

## Path Resolution Rules

### Before (WRONG):
```
Project Root/
├── backend/
│   ├── server.js
│   └── .env
└── ecosystem.config.js

PM2 Working Directory: Project Root/
Script: ./backend/server.js (from root)
dotenv looks for: .env (in root) ❌ NOT FOUND
```

### After (CORRECT):
```
Project Root/
├── backend/
│   ├── server.js
│   └── .env
└── ecosystem.config.js

PM2 Working Directory: ./backend/ (due to cwd)
Script: server.js (in current dir)
dotenv looks for: .env (in backend/) ✅ FOUND
```

## Log File Paths Explained

With `cwd: './backend'`:
- Working directory: `backend/`
- To access logs in project root: `../logs/`
- Full path: `backend/../logs/` = `logs/`

```javascript
error_file: '../logs/backend-error.log',  // backend/../logs/
```

## How to Verify the Fix

### Test 1: Check PM2 Environment
```bash
pm2 env demand-planning-backend | grep MONGO
```

**Before fix:**
```
(empty or undefined)
```

**After fix:**
```
MONGO_URI=mongodb://localhost:27017/demand-planning
```

### Test 2: Check Logs
```bash
pm2 logs demand-planning-backend --lines 20
```

**Before fix:**
```
❌ MongoDB Connection Error: uri parameter must be a string, got "undefined"
```

**After fix:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

### Test 3: Check Working Directory
```bash
pm2 describe demand-planning-backend | grep cwd
```

**Should show:**
```
cwd: /Users/thrivestudio/Developer/demand_planning/backend
```

## Common Mistakes to Avoid

### ❌ WRONG:
```javascript
{
  script: './backend/server.js',  // Absolute from root
  env_file: './backend/.env',     // Absolute from root
  // Missing cwd!
}
```

### ❌ WRONG:
```javascript
{
  script: 'server.js',
  cwd: './backend',
  env_file: './backend/.env',     // Still absolute! Should be relative
}
```

### ✅ CORRECT:
```javascript
{
  script: 'server.js',            // Relative to cwd
  cwd: './backend',               // Set working directory
  env_file: '.env',               // Relative to cwd
}
```

## Why This Was So Confusing

1. **Manual run always worked** - Made us think code was fine
2. **PM2 silently changed directory** - Not obvious what was happening
3. **`env_file` seemed correct** - But wasn't enough without `cwd`
4. **Error was vague** - "uri must be a string" doesn't mention directory issues
5. **Cluster mode complications** - Made env loading unreliable

## The "Aha!" Moment

> **When you run manually, you instinctively `cd backend` first.**  
> **PM2 doesn't know to do that unless you tell it via `cwd`.**

That's it. That's the whole issue.

## Next.js Frontend: Additional Note

For Next.js, `.env.local` is primarily used at **build time**, not runtime.

**Important:**
```bash
# Build must happen with .env.local present
cd frontend
ls .env.local          # Verify exists
npm run build          # Variables baked into build
npm start              # Uses pre-built app with embedded vars
```

PM2's `env_file` for frontend is less critical but still good practice for any server-side runtime variables.

## Deployment Checklist

When deploying to Mac Studio:

- [ ] Pull latest code with updated `ecosystem.config.js`
- [ ] Verify `backend/.env` exists with all keys
- [ ] Verify `frontend/.env.local` exists
- [ ] Rebuild frontend: `cd frontend && npm run build`
- [ ] Delete old PM2 apps: `pm2 delete demand-planning-backend demand-planning-frontend`
- [ ] Start with new config: `pm2 start ecosystem.config.js`
- [ ] Save state: `pm2 save`
- [ ] Check logs: `pm2 logs`
- [ ] Verify MongoDB connected
- [ ] Test application in browser

## Summary

**Problem:** PM2 working directory mismatch  
**Solution:** Add `cwd` to PM2 config  
**Result:** PM2 behaves exactly like manual run  

**Critical config:**
- `cwd: './backend'` - Change to backend directory first
- `script: 'server.js'` - Relative to cwd
- `env_file: '.env'` - Relative to cwd
- `exec_mode: 'fork'` - Reliable env loading

This is a **very common PM2 gotcha** that catches even experienced developers.
