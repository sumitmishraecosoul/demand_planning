# PM2 Environment Variable Configuration

## Problem Identified (Feb 6, 2026)
PM2 was **NOT** loading `.env` files automatically, causing:
- ❌ MongoDB connection failure: `uri parameter must be a string, got "undefined"`
- ❌ Brevo API key not configured
- ❌ Backend crashing on startup

## Root Cause
The `ecosystem.config.js` was missing the `env_file` property.

**Without `env_file`:**
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5002,
}
// PM2 only knows about NODE_ENV and PORT
// It does NOT read .env automatically
```

**With `env_file` (CORRECT):**
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5002,
},
env_file: './backend/.env',  // ⭐ THIS IS CRITICAL
```

## Solution
Updated `ecosystem.config.js` to include `env_file` for both apps:

### Backend:
```javascript
{
  name: 'demand-planning-backend',
  script: './backend/server.js',
  env_file: './backend/.env',  // ⭐ Loads all environment variables
  // ... rest of config
}
```

### Frontend:
```javascript
{
  name: 'demand-planning-frontend',
  script: 'npm',
  args: 'start',
  cwd: './frontend',
  env_file: './frontend/.env.local',  // ⭐ Loads frontend env vars
  // ... rest of config
}
```

## Key Learnings

### ✅ What PM2 Does:
- Manages Node.js processes
- Loads env files when configured with `env_file`
- Restarts apps automatically
- Handles logging

### ❌ What PM2 Does NOT Do:
- Does NOT auto-load `.env` without `env_file` property
- Does NOT reload env vars without restart

### ✅ What Nginx Does:
- Forwards HTTP/HTTPS traffic
- Handles SSL certificates
- Routes requests to correct ports

### ❌ What Nginx Does NOT Do:
- Does NOT read or load `.env` files
- Does NOT manage Node.js environment variables
- Does NOT need to know about your app's secrets

## Important: Nginx vs PM2 vs .env

```
┌─────────────────────────────────────────┐
│  Browser (User)                         │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Request
               ▼
┌─────────────────────────────────────────┐
│  NGINX (Port 80/443)                    │
│  - Does NOT read .env                   │
│  - Only forwards traffic                │
└──────────────┬──────────────────────────┘
               │
               ├──► http://localhost:3000 (Frontend)
               │
               └──► http://localhost:5002 (Backend API)
                    ▼
               ┌─────────────────────────┐
               │  PM2 Process Manager    │
               │  - Reads .env via       │
               │    env_file property    │
               │  - Passes to Node.js    │
               └─────────┬───────────────┘
                         │
                         ▼
               ┌─────────────────────────┐
               │  Node.js (Backend)      │
               │  - Uses process.env.*   │
               │  - Connects to MongoDB  │
               │  - Uses Brevo API       │
               └─────────────────────────┘
```

## Deployment Process

### When to Restart PM2:
1. ✅ After `.env` changes
2. ✅ After `ecosystem.config.js` changes
3. ✅ After backend code changes
4. ✅ After frontend rebuild

### Correct Restart Command:
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### When to Rebuild Frontend:
1. ✅ After `.env.local` changes
2. ✅ After `NEXT_PUBLIC_*` variable changes
3. ✅ After frontend code changes

### Correct Rebuild Process:
```bash
cd frontend
npm run build
cd ..
pm2 restart demand-planning-frontend
```

## Environment Variable Files

### Backend `.env` Location:
```
backend/.env
```

### Frontend `.env.local` Location:
```
frontend/.env.local
```

### Why `.env.local` for Frontend?
- Next.js convention
- Overrides `.env` in local/production
- Not committed to Git (in .gitignore)

## Common Mistakes to Avoid

### ❌ WRONG:
1. Adding env vars to `nginx.conf`
2. Running `npm run dev` while PM2 is running
3. Not restarting PM2 after env changes
4. Expecting Next.js to auto-reload env at runtime

### ✅ CORRECT:
1. Put secrets in `.env` files
2. Configure PM2 with `env_file`
3. Always restart PM2 after changes
4. Always rebuild Next.js after env changes

## Verification Checklist

After deploying, check:

1. **PM2 Status:**
   ```bash
   pm2 status
   # Both apps should show "online"
   ```

2. **Backend Logs:**
   ```bash
   pm2 logs demand-planning-backend --lines 50
   # Should see: "✅ MongoDB connected"
   # Should NOT see: "uri parameter must be a string"
   ```

3. **Frontend Logs:**
   ```bash
   pm2 logs demand-planning-frontend --lines 50
   # Should show Next.js server running
   ```

4. **Health Check:**
   ```bash
   curl http://localhost:5002/api/health
   curl http://localhost:3000
   ```

## Production Best Practices

1. **Never expose .env files in Git**
   - Already in .gitignore
   - Keep it that way

2. **Use different values per environment**
   - Development: localhost
   - Production: domain/IP

3. **Restart PM2 with --update-env flag**
   ```bash
   pm2 restart all --update-env
   ```

4. **Save PM2 state after changes**
   ```bash
   pm2 save
   ```

5. **Enable startup script for auto-start on reboot**
   ```bash
   pm2 startup
   pm2 save
   ```

## Summary
- ✅ Fixed: Added `env_file` to `ecosystem.config.js`
- ✅ PM2 now loads environment variables correctly
- ✅ MongoDB connection works
- ✅ Brevo email service configured
- ✅ No Nginx changes needed
- ✅ Deployment process clarified
