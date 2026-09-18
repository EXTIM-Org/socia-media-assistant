# Project State & Context (For AI Agents)

**Project Name:** Instagram-Assistant (Socia-Media-Assistant)
**Repository:** https://github.com/EXTIM-Org/socia-media-assistant
**Primary Language:** Persian (Farsi) for UI/Bot outputs. English for codebase/documentation.

## 🎯 Project Goal
To build an intelligent, automated Instagram Assistant that connects to the Meta Graph API via Webhooks. The system automatically responds to Instagram Direct Messages (DMs) and Comments based on a Finite State Machine (FSM) workflow (e.g., asking for the user's phone number, allowing them to edit/cancel, and confirming).

## 🏗️ Architecture & Tech Stack
- **Frontend:** Next.js (App Router), TailwindCSS, TypeScript. (UI is RTL, uses Vazirmatn font).
- **Backend:** NestJS, TypeScript.
- **Database:** PostgreSQL managed via Prisma ORM.
- **Cache & Queue:** Redis + BullMQ (for handling incoming webhook events asynchronously).
- **Deployment Server:** VPS (`82.115.21.96`) running Linux.

## ✅ Accomplished Work & Current Progress
1. **Full-Stack Setup:** Both Next.js and NestJS are fully bootstrapped and communicating.
2. **Authentication:** JWT-based authentication using HTTP-only cookies is fully functional. The bug where users were incorrectly redirected to the dashboard due to stale cookies after DB resets has been fixed.
3. **FSM Chatbot:** The core state machine logic (State design pattern) for handling Instagram chat flows is implemented.
4. **Meta API Integration (Real API):** 
   - Replaced mock services with actual HTTP calls to Meta's Graph API `v20.0` using `axios`.
   - `sendDirectMessage` and `replyToComment` are fully implemented.
   - Webhook signature verification (`hub.verify_token` and `X-Hub-Signature-256`) is built into the `webhook.controller.ts`.
5. **Environment Configuration:** All sensitive data (`META_PAGE_ID`, `META_ACCESS_TOKEN`, `META_APP_SECRET`, etc.) has been moved to `.env`.
6. **Server Deployment (VPS):**
   - The project was cloned to the VPS (`root@82.115.21.96`).
   - PostgreSQL and Redis were configured via Docker Compose.
   - Node processes were managed using `PM2`.
   - `Cloudflare Tunnel` (cloudflared) was successfully used to provide a secure HTTPS endpoint for the Meta Webhook.
   - *Swap Memory:* The VPS swap space was manually increased to `4GB` to ensure stability across multiple running apps.
7. **Version Control:** Code is initialized with Git and pushed to the `main` branch on GitHub.

## 🟢 Current Status
**Status:** ACTIVE / WEBHOOK VERIFIED & WORKING.
- The PM2 processes (`instagram-backend`, `instagram-frontend`), Docker containers (DB/Redis on alternate ports 5433/6380), and Cloudflare Tunnel are all running successfully on the VPS.
- The Meta Webhook is verified. The Facebook Page is properly linked to the Instagram account, the App has a Page Access Token, and end-to-end DM processing via the Meta Graph API is fully functional.
- Prisma tables have been pushed to the new database, and the FSM successfully processes inbound text and sends replies.

## 🚀 Next Steps
1. **Bot Customization:** Customize the bot's text responses and automation rules via the frontend dashboard.
2. **Production Domain:** Move from `trycloudflare` temporary URLs to a persistent domain or persistent Cloudflare Tunnel for the webhook.
3. **Testing Edge Cases:** Test handling of other messaging events (postbacks, quick replies, images) and comment automation.
