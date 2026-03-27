# Mac Studio + ecosoulhometech.com — Demand Planning (subdomains)

Run everything below **on the Mac Studio** after `git pull`. The **root domain** `ecosoulhometech.com` stays free for other projects (landing page, marketing, etc.). This app uses **dedicated subdomains**.

**URLs for this project**

| What | URL |
|------|-----|
| Frontend | `https://demand-planning.ecosoulhometech.com` |
| Backend API | `https://api.demand-planning.ecosoulhometech.com/api/...` |

**Stack**

- PM2: `demand-planning-backend` (**5002**), `demand-planning-frontend` (**3000**)
- Nginx: **80** / **443** → `127.0.0.1:3000` / `127.0.0.1:5002` (only for these hostnames)

**Network**

- Public IP **49.249.157.19** → router forwards **80** and **443** to Mac LAN IP (e.g. **192.168.50.29**).
- Other projects on the same Mac can add **separate** Nginx `server` blocks (and their own Certbot certificates) in additional files under `servers/`.

---

## 1. DNS (registrar for ecosoulhometech.com)

Add **A** records pointing to **49.249.157.19** (adjust if your ISP IP changes):

| Type | Host / Name (examples) | Value | TTL |
|------|------------------------|-------|-----|
| A | `demand-planning` | `49.249.157.19` | 3600 |
| A | `api.demand-planning` | `49.249.157.19` | 3600 |

Resulting FQDNs:

- `demand-planning.ecosoulhometech.com`
- `api.demand-planning.ecosoulhometech.com`

*(Some panels use a single field: type `demand-planning` and `api.demand-planning` as the record name.)*

Verify:

```bash
dig +short demand-planning.ecosoulhometech.com @8.8.8.8
dig +short api.demand-planning.ecosoulhometech.com @8.8.8.8
```

Both should return `49.249.157.19`.

---

## 2. Router / firewall

Forward **TCP 80** and **TCP 443** to the Mac Studio. Same ports serve all vhosts; Nginx chooses the site by `Host` header.

---

## 3. Project path and git

```bash
cd ~/Documents/Datahive
git pull origin main
```

---

## 4. Environment variables

### Backend `backend/.env`

```env
NODE_ENV=production
PORT=5002

FRONTEND_URL=https://demand-planning.ecosoulhometech.com
```

### Frontend `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.demand-planning.ecosoulhometech.com/api
NODE_ENV=production
```

After any `.env.local` change:

```bash
cd ~/Documents/Datahive/frontend
npm run build
cd ..
```

---

## 5. Install Nginx (Homebrew)

```bash
brew install nginx
brew services start nginx
nginx -v
```

**Config roots:** Apple Silicon → `/opt/homebrew/etc/nginx/` · Intel → `/usr/local/etc/nginx/`

Ensure `http { ... }` includes `include servers/*;`.

---

## 6. Copy Nginx site config

```bash
cd ~/Documents/Datahive

# Apple Silicon
sudo cp nginx.demand-planning.ecosoulhometech.conf /opt/homebrew/etc/nginx/servers/demand-planning.ecosoulhometech.conf

# Intel: copy to /usr/local/etc/nginx/servers/ and replace /opt/homebrew/etc/nginx with /usr/local/etc/nginx inside the file
```

---

## 7. TLS (Let’s Encrypt)

Stop Nginx so standalone Certbot can bind to **80**:

```bash
brew services stop nginx
```

```bash
brew install certbot
sudo certbot certonly --standalone \
  -d demand-planning.ecosoulhometech.com \
  -d api.demand-planning.ecosoulhometech.com
```

Certificate directory (default first name):

`/etc/letsencrypt/live/demand-planning.ecosoulhometech.com/`

Copy to paths referenced in the Nginx file:

```bash
# Apple Silicon
sudo mkdir -p /opt/homebrew/etc/nginx/ssl
sudo cp /etc/letsencrypt/live/demand-planning.ecosoulhometech.com/fullchain.pem /opt/homebrew/etc/nginx/ssl/demand-planning.ecosoulhometech.com.crt
sudo cp /etc/letsencrypt/live/demand-planning.ecosoulhometech.com/privkey.pem   /opt/homebrew/etc/nginx/ssl/demand-planning.ecosoulhometech.com.key
sudo chmod 640 /opt/homebrew/etc/nginx/ssl/demand-planning.ecosoulhometech.com.key
```

Intel: use `/usr/local/etc/nginx/ssl/` and matching paths in the `.conf` file.

```bash
sudo nginx -t
brew services start nginx
```

### Renewal (cron example)

```text
0 3 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/demand-planning.ecosoulhometech.com/fullchain.pem /opt/homebrew/etc/nginx/ssl/demand-planning.ecosoulhometech.com.crt && cp /etc/letsencrypt/live/demand-planning.ecosoulhometech.com/privkey.pem /opt/homebrew/etc/nginx/ssl/demand-planning.ecosoulhometech.com.key && brew services restart nginx"
```

(Adjust paths for Intel. With several certs, `certbot renew` runs hooks only for renewed certs.)

---

## 8. PM2

```bash
cd ~/Documents/Datahive
mkdir -p logs
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 start ecosystem.config.js   # or pm2 restart ecosystem.config.js
pm2 save
pm2 startup
```

Checks:

```bash
curl -sS https://api.demand-planning.ecosoulhometech.com/api/health
```

---

## 9. Deploy updates

```bash
cd ~/Documents/Datahive
git pull
./deploy.sh
brew services restart nginx
```

---

## 10. Adding another project on the same domain

1. Pick new subdomains (e.g. `app2.ecosoulhometech.com`, `api.app2.ecosoulhometech.com`).
2. Add DNS **A** records → same public IP.
3. Add a **new** file under `servers/` with its own `server_name` and **local** ports (or upstreams).
4. Run **Certbot** with that project’s hostnames (new certificate, or one cert with many `-d` if you prefer).
5. `sudo nginx -t && brew services restart nginx`

---

## Repo files

| File | Purpose |
|------|---------|
| `nginx.demand-planning.ecosoulhometech.conf` | This app’s vhosts only |
| `ecosystem.config.js` | PM2 |
| `deploy.sh` | Build + PM2 restart |
| `MAC_STUDIO_SETUP.txt` | IP:port testing |

`backend/server.js` allows `https://demand-planning.ecosoulhometech.com` plus `FRONTEND_URL`.
