NexusPlay — Esports Tournament Platform

React 19 + Vite frontend, Express 5 + Mongoose backend, MongoDB. Four authenticated roles (participant, organizer, sponsor, superadmin) plus a public landing page.

Design system: the app is styled by the token contract in docs/REDESIGN_PRD.md ("Deep Space Neon" — --np-* CSS variables, Clash Display + Outfit, GSAP motion). Redesign status and phase history live there.

Project layout — two independent npm packages (no root workspace):

NexusPlay/
├── backend/    Express API (:5000) + portable MongoDB + database files
├── frontend/   React/Vite app (:5173)
├── docs/       PRD, asset licenses
└── README.md

Full Setup Guide (fresh PC, ~5 minutes)

Prerequisites (install once)

Node.js 20.19+ / 22 LTS — from nodejs.org. npm comes bundled. The only hard prerequisite.

MongoDB — nothing to install on Windows: this repo ships a portable mongod.exe (backend/mongodb-portable/) plus the ready-seeded database (backend/data-db/). On macOS/Linux, install MongoDB Community instead and point MONGODB_URI at it.

1. Get the project

Either clone:

git clone https://github.com/Kai-886/Nexus-play.git
cd Nexus-play

…or extract a shared zip of the project folder anywhere (if it came with backend/data-db/, you already have the demo data — skip step 5).

2. Install backend dependencies

cd backend
npm install
copy .env.example .env

The defaults in .env.example already match this repo (local Mongo :27017, port 5000). Only edit it if you changed something: MONGODB_URI, JWT_SECRET, or SMTP keys for email features (optional — a free Mailtrap account works).

3. Start MongoDB + Backend — one terminal

The backend now starts the project's portable MongoDB and the API together, so you only need one terminal for both.

From the backend folder:

npm run dev

This starts:

Portable MongoDB from backend/mongodb-portable/mongod.exe

MongoDB database from backend/data-db/

Express backend on port 5000

Wait for:

MongoDB connected: 127.0.0.1
Tournament scheduler started
Server running on port 5000

Keep this terminal open while using the app.

Windows note: npm run db is also available if you need to start MongoDB by itself. The npm run dev command is the recommended development command because it starts MongoDB and the backend together.

<details>
<summary>Using your own MongoDB / Atlas instead</summary>

Set MONGODB_URI in backend/.env to your connection string. If you use an external MongoDB instance, do not start the project's portable MongoDB on the same port.

</details>

4. Frontend — Terminal 2 (new terminal)

Open a second terminal:

cd frontend
npm install
npm run dev

Open the printed URL — http://localhost:5173.

If 5173 is taken (a stale Vite process from an earlier session), Vite picks 5174 — use whatever port it prints, and kill the stale process if pages look outdated.

5. Demo data (optional)

If your copy shipped without backend/data-db/ (or you wiped it), seed the landing page with 5 demo tournaments (idempotent — run from the project root, with Mongo running):

node backend/src/seeder/seedDemoTournaments.js

6. Sign in

Role

Email

Password

Superadmin

admin@nexusplay.gg

admin123

The superadmin owns the seeded demo tournaments. Register player / organizer / sponsor accounts through the UI — organizers and sponsors additionally complete a profile and need superadmin verification for gated actions.

⚠️ The seeded admin123 password is for development only — change it before anything real.

Stopping / restarting

Use Ctrl+C in the backend terminal to stop MongoDB + the backend together. Stop the frontend separately with Ctrl+C.

Next session:

Terminal 1 — backend + MongoDB:

cd backend
npm run dev

Terminal 2 — frontend:

cd frontend
npm run dev

No reinstall needed after the initial npm install.

Production build (frontend)

cd frontend
npm run build     # outputs dist/, served by any static host
npm run preview   # local preview of the build

Gotchas

Backend exits immediately if MongoDB isn't reachable — normally npm run dev in backend/ starts the bundled MongoDB automatically.

Frontend renders without the backend, but every API call fails with a network error — start the backend first.

Backend must start before the seeder and after Mongo; the demo seeder connects directly to :27017.

The frontend API base URL is hardcoded to http://localhost:5000/api/v1 in frontend/src/services/api.js, adminService.js, and participantService.js — fine when both run on the same PC; if the backend lives elsewhere, change those three lines.

Never copy node_modules between machines — delete it and run npm install (the lockfiles pin exact versions).

Do not copy backend/data-db/ while mongod is running — stop it first, or the copied database can be corrupt.

3D models import with ?url — rolldown-vite otherwise tries to UTF-8-parse the GLB binaries (see docs/REDESIGN_PRD.md Phase 4).

OneDrive users: if the project lives in OneDrive, make files "Always keep on this device" before zipping/sharing — cloud-only placeholders copy as 0-byte stubs.