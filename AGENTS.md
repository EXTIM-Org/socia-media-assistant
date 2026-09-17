# AI Agent Rules and Guidelines

This file contains the core rules and constraints that all AI agents must strictly follow when working on the `Instagram-Assistant` project.

## 1. Version Control & Git
- **NEVER Push to GitHub:** You must absolutely never push any code, commits, or branches to the remote GitHub repository unless the user explicitly and directly instructs you to do so. You may use local git commands (like `git add` or `git commit`) if necessary for version control, but `git push` is strictly forbidden without explicit permission.

## 2. Language & Documentation
- **Documentation Language:** All project documentation files (README, architecture, requirements) must be written entirely in English.
- **UI & Localization:** The actual platform User Interface (Dashboard, Web Pages) and chatbot outputs must be designed completely in Persian (Farsi) with full Right-to-Left (RTL) layout support.

## 3. Tech Stack Restrictions
- **Frontend:** Next.js with TailwindCSS.
- **Backend:** NestJS.
- **Database:** PostgreSQL with Prisma ORM.
- **Cache & Queue:** Redis and BullMQ.
