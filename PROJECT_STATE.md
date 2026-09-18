# Project State & Context (For AI Agents)

**Project Name:** Instagram-Assistant (Socia-Media-Assistant)
**Repository:** https://github.com/EXTIM-Org/socia-media-assistant
**Primary Language:** Persian (Farsi) for UI/Bot outputs. English for codebase/documentation.

## 🎯 Project Goal
To build an intelligent, automated Instagram Assistant that connects to the Meta Graph API via Webhooks. The system automatically responds to Instagram Direct Messages (DMs) and Comments based on a Finite State Machine (FSM) workflow (e.g., asking for the user's phone number, allowing them to edit/cancel, and confirming).

## 🏗️ Architecture & Tech Stack
- **Frontend:** Next.js 16 (App Router), TailwindCSS, TypeScript. (UI is RTL, uses Vazirmatn font).
- **Backend:** NestJS, TypeScript.
- **Database:** PostgreSQL managed via Prisma ORM.
- **Cache & Queue:** Redis + BullMQ (for handling incoming webhook events asynchronously).
- **Deployment Server:** VPS (`82.115.21.96`) running Linux (Ubuntu/Debian). Nginx as reverse proxy.

## 🚀 Server Deployment & Infrastructure Details
- **Production Domain:** `noche.de5.net` and `www.noche.de5.net` (served over HTTPS via Nginx).
- **Nginx Config:** Nginx is configured to proxy all traffic for the domain to the **Frontend (Next.js)**.
- **Frontend Port:** `6001` (Changed from 6000 due to browser X11 restrictions).
- **Backend Port:** `3001`.
- **API Routing Strategy:** The frontend fetches data from `/api/*`, which is intercepted by Next.js `rewrites` in `next.config.ts` and transparently proxied to the backend at `http://localhost:3001/*`. **(Do not use hardcoded localhost:3001 URLs in the frontend codebase)**.
- **Process Manager:** `PM2` is used for managing Node processes.
  - `instagram-frontend` runs `npm start` in the `frontend` folder.
  - `instagram-backend` runs `npm run start:prod` in the `backend` folder.
- **Database/Redis:** Hosted via Docker Compose on the server (PostgreSQL mapped to 5432, Redis mapped to 6380 to avoid conflicts).

## ✅ Accomplished Work & Current Progress
1. **Core Features:** JWT-based Auth, FSM Chatbot (State design pattern), Meta API Integration (Webhooks, `sendDirectMessage`, `replyToComment`).
2. **Dashboard UI:** Implemented a full administrative dashboard with Persian UI. Added 30-day analytics charts (using `recharts@2.12.0`) and user/orders tables.
3. **Bug Fixes:**
   - Downgraded `recharts` to `2.12.0` (with `--legacy-peer-deps`) due to `es-toolkit` resolution errors in v2.13.0.
   - Eliminated PM2 process duplication that was causing `EADDRINUSE` errors on both frontend and backend.
   - Fixed Nginx 502 Bad Gateway by correctly configuring Next.js ports and Nginx routing.

## 📌 Development Workflow (For AI Agents)
- **Local Dev:** Run `npm run dev` in frontend (port 3000) and `npm run start:dev` in backend (port 3001).
- **Deployment Flow:** 
  1. Commit and push changes to GitHub (`git push`).
  2. Connect to the VPS via SSH (`ssh root@82.115.21.96`).
  3. Pull changes in `/home/saas/socia-media-assistant` (`git pull`).
  4. Run `npm install` and `npm run build` in respective folders. (Use `--legacy-peer-deps` on the frontend!).
  5. Restart the PM2 processes (`pm2 restart instagram-frontend` / `pm2 restart instagram-backend`).
- **Database Changes:** Always run `npx prisma generate` after changing the Prisma schema, followed by `npx prisma db push` or `migrate`. Run this on the server as well during deployment.

## 📝 Next Steps
- Expand chatbot FSM flows (e.g., handling product catalogs or payment confirmations).
- Add more granular control over automation rules from the dashboard.
