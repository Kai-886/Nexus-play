# NexusPlay — Project Handoff (30 October 2026)

Status review of the full project: what works, what doesn't, and what was never
tested. Produced after a full-stack test pass (details in §3). Read with
`README.md` (setup) and `docs/REDESIGN_PRD.md` (design system / phase history).

---

## 1. What this project is

Esports tournament platform — React 19 + Vite frontend (:5173), Express 5 +
Mongoose backend (:5000), MongoDB (portable `backend/mongodb-portable`, data in
`backend/data-db/`). Four roles: **player (user), organizer, sponsor,
superadmin**. No root workspace — `backend/` and `frontend/` are independent npm
packages.

Run it: terminal 1 `cd backend && npm run dev` (starts Mongo + API together),
terminal 2 `cd frontend && npm run dev`.

**Credentials:** `NexusPlay-Account-List.docx` (repo root, untracked) lists all
23 accounts with per-role dev passwords (`admin123` / `organizer123` /
`sponsor123` / `player123`), all login-verified. Never commit that file.

## 2. Where the project stands (git)

- Remote: `github.com/Kai-886/Nexus-play.git`. HEAD = `a398ff6` ("Replace
  gamepad logo…"). **Nothing has been committed or pushed this session.**
- **16 modified + 4 new source files, all uncommitted** — this is the Razorpay
  entry-fee integration plus related fixes (~467 insertions):

  | Area | Files |
  |---|---|
  | Payment gateway service (Razorpay + local sandbox modes) | `backend/src/services/paymentGateway.js` *(new)* |
  | Order / signature-verify / sandbox checkout endpoints | `backend/src/controller/paymentController.js`, `backend/src/routes/paymentRoutes.js` *(new)* |
  | Paid-registration gate (402 until payment verified) | `backend/src/controller/registrationController.js` |
  | Payments ledger (admin) | `backend/src/controller/adminController.js`, `backend/src/routes/adminRoutes.js`, `backend/src/models/payment.js` |
  | Route wiring / middleware / auth fixes | `backend/src/app.js`, `errorMiddleware.js`, `authController.js`, `sendToken.js` |
  | Seeded demo data | `backend/src/seeder/seedDemoTournaments.js`, `seeder.js`, `.env.example` |
  | Registration modal (payment step), ledger UI, services | `frontend/src/components/participant/ParticipantRegistrationModal.jsx`, `pages/superadmin/PaymentsManagementPage.jsx`, `services/paymentService.js` *(new)*, `adminService.js`, `participantService.js`, `context/TournamentProvider.jsx` |

- Untracked non-source: `NexusPlay-Account-List.docx` (credentials — keep out of
  git), `report/` (generated project report), `.cloud-attachments/` (tooling).
- Payment config: `backend/.env` has `PAYMENT_MODE=razorpay` with test-mode
  keys (gitignored). Switching to sandbox needs only `PAYMENT_MODE=sandbox` —
  same client contract, no code change.

## 3. Test pass performed (30 Oct 2026)

No automated test suite exists in the repo, so testing was done by exercising
the running stack directly. **104 API checks across 5 stages + frontend
lint/build + browser pass.** All test artifacts (accounts, tournaments,
payments, scripts) were removed afterwards; DB is back to its 23 users / 5
tournaments baseline with demo slot counts intact.

- **API: 104 checks, all passing** (two initial "failures" were diagnosed as
  fixture/data issues, then re-tested successfully with proper fixtures):
  auth + role guards, CORS, 404 handling, paid + free registration flows,
  payment order/verify (bad-signature reject, idempotent retry), organizer KYC
  lifecycle, tournament CRUD, sponsorship lifecycle, admin/superadmin
  endpoints, forgot-password error handling, admin user-status mutation.
- **Frontend build: passes** (`vite build`, ~9 s) with a chunk-size warning.
- **Frontend lint: FAILS — 1 error** (see §4, item 4).
- **Browser pass:** landing, login/logout, superadmin dashboard, participant
  browse all render with correct data and **no JS console errors**; anonymous
  users are correctly redirected to `/login`.

## 4. NOT done / findings (prioritized)

### Security — fix before any production deploy

1. **Tournament rosters (PII) readable by any logged-in user.**
   `GET /api/v1/tournaments/:id/registrations` (`registrationRoutes.js`) only
   requires *any* authenticated user — the controller has no owner/role check.
   Verified: a random player fetched another tournament's full roster with
   names, emails, phone numbers and game UIDs. Should be restricted to the
   tournament's organizer (+ superadmin).
2. **Draft tournaments are publicly visible.** `getAllTournaments`
   (`tournamentController.js`) has no status filter outside
   `?scope=landing` — verified: an anonymous request both *listed* a draft and
   *read its full detail* via `GET /tournaments/:id`. (Completed tournaments
   also appear in the default list — may be intentional as an archive, but
   drafts should not leak.) Only 2 published + 3 completed tournaments exist
   today, so the draft leak needs a draft to demonstrate — it is real.

### Quality

3. **Demo data has stale dates.** `Free Fire Community Clash` registration
   deadline was 29 Oct 2026 (already passed) while its card still shows an
   active **"Register Now"** — the backend correctly rejects with 400, but the
   UI gives no "registration closed" state, and the seeder's dates drift as
   time passes. Re-seed or update dates; consider disabling the CTA when past
   deadline.
4. **ESLint fails (exit 1):** `frontend/src/context/TournamentProvider.jsx:76`
   — `react-hooks/set-state-in-effect` (`fetchMyTournaments()` called
   synchronously in an effect). This is in the *uncommitted* changes; fix
   before commit.
5. **Bundle size:** `premium` chunk is 1.12 MB minified (build warns >500 kB);
   code-splitting recommended.
6. **No automated tests.** Everything above was verified ad-hoc. Highest-value
   next step: commit a smoke suite covering the payment + registration flows.
7. **Stat counters showed "0" during automation** (landing hero + superadmin
   stat cards). Cause identified: `useCountUp` tweens via rAF and the automated
   tab was `document.hidden`, freezing the tween. **Likely not a real bug** —
   confirm manually in a visible browser tab; if still 0, inspect the
   IntersectionObserver path.

### Not tested (unknown state)

- **Real Razorpay hosted checkout popup** (test-mode order creation and the
  full signature-verify contract *were* tested; no money moved).
- **Email delivery** — no SMTP creds; forgot-password degrades gracefully to a
  clean 503 (verified), actual sending untested.
- **Sponsor escrow payment leg** — approval returns "Payment is now pending";
  the sponsor-side payment/settlement flow was not exercised.
- **Vercel production path** (`api/` serverless entry + `vercel.json`) —
  nothing deployed; local dev only.
- Visual/responsive QA, cross-browser, accessibility, and WebGL rendering
  quality (pages rendered without errors, but the automated tab was hidden, so
  visual/motion QA was not performed).

## 5. What is DONE (verified working)

- **Auth:** register/login/logout/profile for all 4 roles; route guards (403),
  anonymous 401; forgot-password fails gracefully without SMTP.
- **Organizer KYC gate:** register → profile → Aadhaar/PAN → superadmin
  verify; unverified organizers are blocked from creating tournaments (403).
- **Tournament lifecycle:** create (draft/published, solo/team rules), update,
  delete, owner-only routes, public list, landing feed, my-tournaments;
  scheduler auto-completes ended tournaments (observed: 3 moved to completed).
- **Registration:** free and paid flows — paid requires verified payment
  (402 without), duplicates blocked, deadlines enforced, captain/roster
  validation, cancel with slot-count bookkeeping (verified counts return to
  baseline after register→cancel).
- **Payments:** order creation against Razorpay test mode, HMAC signature
  verify (rejects bad signatures, idempotent on retry), pending→success ledger
  rows visible to superadmin; sandbox mode available via config.
- **Sponsorship:** sponsor register → KYC → verify → offer on published
  tournament → organizer approve → public listing; unverified sponsors blocked.
- **Admin/superadmin:** dashboards, user governance (status/role), KYC lists,
  tournament moderation (publish/featured/delete), payments ledger, reports.
- **Frontend:** production build succeeds; login/logout flow; landing, admin
  dashboard and participant browse pages render correct live data with no
  console errors; route protection redirects anonymous users.
- **Security basics that do work:** CORS rejects foreign origins, unknown API
  routes return JSON 404, passwords bcrypt-hashed, httpOnly cookies, payment
  secrets server-side only.

## 6. Suggested next steps (in order)

1. Fix the two security holes in §4 (roster access + draft visibility).
2. Fix the ESLint error, then commit the Razorpay work (it's a large uncommitted
   change set — commit soon, split payments vs. fixes if you want clean history).
3. Re-seed/refresh demo dates and add a "registration closed" state.
4. Decide on hosting (Vercel path exists but is unverified) and re-add env vars
   there — `.env` files are gitignored.
5. Add a committed smoke-test suite for the payment/registration flows.

## 7. Updates applied while committing (30 Oct 2026)

- **ESLint fixed** — the `set-state-in-effect` error in
  `frontend/src/context/TournamentProvider.jsx` is resolved; frontend lint now
  passes, so §4 item 4 is closed.
- **Payments are now enforced demo-only** — `backend/src/services/paymentGateway.js`
  refuses `rzp_live_` keys with a 503, so Razorpay can only ever run in test
  mode. The demo still shows the genuine Razorpay checkout popup (test mode
  ribbon), and no configuration can turn it into a real charge. The checkout
  modal copy was updated accordingly (no more "set live keys to charge" hint).
- **Razorpay integration committed to `main`.** The two security findings in
  §4 (roster PII access, public draft visibility) remain **open** and are the
  top items for the next session.
