# ecosoulhometech.com — Demand Planning (Mac Studio)

- **Guide:** `MAC_STUDIO_ECOSOUL_DOMAIN_SETUP.md`
- **Nginx:** `nginx.demand-planning.ecosoulhometech.conf` → `servers/demand-planning.ecosoulhometech.conf` (Homebrew prefix: `/opt/homebrew` or `/usr/local`).
- **This app’s URLs:**
  - Frontend: `https://demand-planning.ecosoulhometech.com`
  - API: `https://api.demand-planning.ecosoulhometech.com/api`
- **Env:** `FRONTEND_URL=https://demand-planning.ecosoulhometech.com`, `NEXT_PUBLIC_API_URL=https://api.demand-planning.ecosoulhometech.com/api` (rebuild frontend after change).
- **CORS:** `backend/server.js` includes `https://demand-planning.ecosoulhometech.com` (+ `FRONTEND_URL`).
- **DNS:** A records `demand-planning` and `api.demand-planning` → public IP (e.g. 49.249.157.19). Root domain stays available for other apps.
- **Multi-project:** Same Mac / same 80+443; add more `.conf` files + certs per project.
