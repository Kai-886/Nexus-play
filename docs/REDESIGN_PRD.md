# NexusPlay — Cinematic Redesign PRD

| | |
|---|---|
| **Status** | ✅ IMPLEMENTED v2.1 — all seven phases complete (Phase 7 closed 2026-09-26) |
| **Version** | v2.1 (2026-09-26) |
| **Owner** | Product owner (user) + implementing agent sessions |
| **Purpose** | Single source of truth. Any session (human or agent) must be able to review this document and continue implementation without re-deriving decisions. |
| **Rule** | No implementation outside this document's scope. Scope changes require editing this PRD first. |

> **v1 redesign complete.** Phases 0–6 shipped and verified. **Phase 7 (v2.1)** — landing polish & premium 3D, opened from the product owner's 2026-09-26 review — is defined in §11 and tracked there.

---

## 0. How to use this document (for future sessions)

1. Read §3 Decisions Log and §11 Phased Build Order first — they tell you what to build next.
2. Never invent tokens, easings, or colors. Everything is specified in §5–§7. If something is missing, add it to this PRD in the same change.
3. Every phase has **exit criteria**. A phase is done only when all criteria pass (see §12 QA checklist).
4. The repo may contain in-flight changes from other sessions — run `git status` before starting and do not discard changes you did not make.
5. If the design system and an existing page conflict, the design system wins; migrate the page.

---

## 1. Product context

**NexusPlay** is an esports tournament platform (React 19 + Vite 7 + Tailwind 4 frontend, Express 5 + Mongoose 9 backend, MongoDB). Four authenticated roles: participant (`user`), `organizer`, `sponsor`, `superadmin`/`admin` — each with a sidebar layout — plus a public landing page and auth flows.

Current state (as of 2026-09-25): the app builds and runs; landing/auth/participant/superadmin were visually refreshed once; GSAP + ScrollTrigger + Lenis already animate the landing hero and reveals. The redesign upgrades the **entire app** to one cinematic, game-like system.

### Verified baseline facts (do not re-verify)

- Installed & used: `gsap` (+ScrollTrigger), `lenis`, `lucide-react`, `react-router-dom` v7, Tailwind 4 via `@tailwindcss/vite`, `sonner` (toasts).
- Installed but unused: `motion` (Framer Motion). **Decision: do not use it** — GSAP is the single motion system (§10).
- `three`, `@react-three/fiber`, `drei`, `@gltf-transform/cli` are **not installed** (new deps, Phase 0).
- Theme: `ThemeContext` persists `nexus_theme` in localStorage; `index.html` applies it pre-paint (class `dark` on `<html>`). The app is dark-first.
- Fonts already loaded: **Clash Display** (display) via Fontshare, **Outfit** (body) via Google Fonts.
- Assets: 7 PNGs in `frontend/src/assets/landing/` (hero, footer-bg, login-bg, 4 game banners — total ~10 MB, to be compressed in Phase 1).
- API base: `http://localhost:5000/api/v1` (see §12 for run instructions and demo accounts).

---

## 2. Vision

NexusPlay should feel like **the main menu of a AAA game**: cinematic load-in, real depth, tactile feedback on every interaction, and one coherent visual language from landing page to superadmin panel. "Anti-slop": no placeholder text, no emoji-as-icon, no three stacked hover effects, no orphaned one-off styles.

## 3. Decisions Log (approved by product owner)

| # | Decision | Choice |
|---|---|---|
| D1 | 3D pipeline | **Procedural 3D + real optimized `.glb` models** (three + @react-three/fiber + drei; model pipeline in §7) |
| D2 | Scope | **Full app** — landing, auth, all four role dashboards; backend untouched |
| D3 | Sound | **No audio.** Visual feedback only (press, ripple, glow, tilt) |
| D4 | Roadmap | **Phased build order** committed in §11 so future sessions can continue |
| D5 | Motion system | GSAP-only (single motion system; `motion` dep stays unused, removal optional in Phase 6 cleanup) |
| D6 | Libraries | No UI framework swap, no router/state changes, Tailwind 4 + CSS variables only |
| D7 | Premium 3D look | **Premium-procedural** (Phase 7): keep the optimized CC0/CC-BY models; achieve a realistic, on-brand look through *rendering* — PBR material overrides, procedural studio environment lighting (drei `Environment` + `Lightformer`, no remote HDR fetches), soft contact shadows, bloom post-processing. No multi-MB photoreal assets; budgets in §7.3 stand. |

---

## 4. Design pillars

1. **Cinematic** — staggered scene reveals, pinned scroll storytelling, scene-based route transitions.
2. **Tactile** — every interactive element answers input visibly (press/ripple/tilt/glow).
3. **3D depth** — WebGL hero + hero models; pointer-reactive tilt and CSS 3D where WebGL is overkill.
4. **One motion language** — shared duration/easing tokens; every pattern has a reduced-motion fallback.
5. **One system** — one palette, one type scale, one card/button pattern, one icon set, everywhere.

---

## 5. Design system spec ("the template contract")

### 5.1 Color — "Deep Space Neon"

Dark-first. Light mode stays functional via existing CSS-variable swap; all new tokens ship in both.

| Token | Dark value | Role |
|---|---|---|
| `--np-bg-0` | `#05060F` | Page background (deepest) |
| `--np-bg-1` | `#0A0C1A` | Alternate section background |
| `--np-bg-2` | `#10132B` | Card surface |
| `--np-glass` | `rgba(16,19,43,0.6)` + 16px blur | Glass card fill |
| `--np-stroke` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--np-accent` | `#6366F1` (indigo-500) | Primary CTA, active nav, focus |
| `--np-accent-strong` | `#4F46E1` | CTA hover |
| `--np-accent-2` | `#A78BFA` (violet-400) | Gradient partner, display accents |
| `--np-accent-3` | `#22D3EE` (cyan-400) | Tertiary highlight, data-viz, "live" states |
| `--np-brand-gradient` | `linear-gradient(120°, #6366F1, #A78BFA 55%, #22D3EE)` | Display text, primary hero elements |
| `--np-success` | `#34D399` | Verified/completed |
| `--np-warning` | `#FBBF24` | Pending |
| `--np-danger` | `#FB7185` | Destructive/rejected |
| `--np-text-hi` | `#F4F6FF` | Headings |
| `--np-text-body` | `#C7CCE8` | Body |
| `--np-text-mute` | `#8A90B8` | Secondary/meta |

Rules: shadows are accent-tinted (`0 18px 44px -14px rgba(99,102,241,0.45)`), never pure black. Never introduce a color outside this table; game-title tinting (e.g. Valorant=rose, BGMI=amber) is allowed only as *card media gradients*, defined once in a `gameTheme()` util.

### 5.2 Typography

| Role | Font | Spec |
|---|---|---|
| Display (h1/hero, stat numerals) | Clash Display | `clamp(2.5rem, 7vw, 6.5rem)`, leading 0.95–1.05, tracking −0.02em |
| Section headings | Clash Display 600 | `clamp(1.75rem, 4vw, 3rem)` |
| Body | Outfit 400/500 | 14–16px, leading 1.6, max 65ch |
| Eyebrow / HUD label | Outfit 700 uppercase | 10–12px, tracking 0.2em, `--np-accent-2` or muted |

The uppercase eyebrow label is a signature motif — every section opens with one. Numerals in stats use Clash Display with `font-variant-numeric: tabular-nums`.

### 5.3 Layout, radius, elevation

- 4px spacing grid; content `max-w-7xl`; cards `rounded-2xl` (16px); chips/pills `rounded-full`.
- Elevation levels: **flat card** (bg-2 + stroke) → **glass card** (`--np-glass` + blur) → **elevated** (glass + accent glow shadow). Pick one per surface; do not mix on the same element.
- Iconography: `lucide-react` only. **No emoji as UI icons.** Existing emoji (landing footer socials, participant search 🔍) get replaced with lucide equivalents.

### 5.4 Anti-slop checklist (apply in every PR)

- [ ] Hover = **one** motion response per element (tilt **or** lift **or** glow — never stacked)
- [ ] No lorem/placeholder copy; real strings or real empty states
- [ ] No emoji icons; no new colors outside §5.1; no one-off font sizes outside §5.2
- [ ] Every animated component has a `prefers-reduced-motion` fallback
- [ ] Focus-visible rings preserved on all interactive elements
- [ ] Empty/loading/error states designed, not blank

---

## 6. Motion grammar (shared across the whole app)

### 6.1 Tokens (defined once in `index.css`)

- Durations: `--dur-1: 120ms` (press) · `--dur-2: 180ms` (hover) · `--dur-3: 300ms` (enter/exit) · `--dur-4: 600ms` (scene) · `--dur-5: 900ms` (hero/cinematic)
- Easings: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)` (UI) · `--ease-cinematic: cubic-bezier(0.32,0.72,0,1)` (scene/scrub) · `--ease-spring: cubic-bezier(0.34,1.56,0.64,1)` (interactive pop)
- GSAP side: shared `timeline defaults { ease: "power3.out" }`; stagger cap 0.04s/element; reveal start `top 88%`.

### 6.2 Rules

1. **Reduced motion**: `prefers-reduced-motion: reduce` ⇒ no Lenis, no pinning, no transforms; opacity-only or static. Enforced in JS (skip gsap/lenis init) and CSS (existing global kill-switch).
2. **Route change = scene change**: `PageTransition` upgraded to a two-beat choreography (exit fade/scale 150ms → enter "boot-up" 450ms) with scroll reset via Lenis.
3. **Scroll = story on landing only.** Dashboard pages use enter choreography + reveals, no pinning (productivity surfaces stay fast).
4. **Cleanup discipline**: every GSAP effect lives in `gsap.context()` scoped to a ref, reverted on unmount. Every R3F canvas pauses rendering when offscreen/framed-out.

### 6.3 Pattern catalog (build once in `components/motion/`, reuse everywhere)

| Pattern | Implementation | Used by |
|---|---|---|
| Tactile press | `usePressFeedback()` hook — scale 0.96 + radial ripple from click point | All buttons, nav items, cards-as-links |
| Tilt card | `useTilt()` hook — pointer-tracked rotateX/Y (max 8°) + moving specular glare; static on touch | Stat cards, tournament cards, auth card |
| Reveal | Existing `Reveal.jsx` (ScrollTrigger `.from`) — keep API | All sections |
| Count-up | `useCountUp()` — IntersectionObserver + GSAP tween, tabular numerals | Dashboards, landing stats (replaces hardcoded "10K+" with live API counts where an endpoint exists) |
| Scene transition | Upgraded `PageTransition.jsx` | Router root |
| 3D marquee ring | CSS 3D cylinder (games logos on a rotating ring, drag-inertial) | **Restored in Phase 7 P3-rev (owner approval)** as GamesRing 2.0: GameArt banner plates on the ring, drag inertia, hover pauses the ring and drives a center glass hub with live per-game stats from the landing API; static captioned row under reduced motion |
| Parallax layers | Existing hero ScrollTrigger pin — extend to new sections | Landing |
| Toast | Sonner restyled to tokens (glass, accent border-left, HUD eyebrow) | Global |

---

## 7. 3D spec (Decision D1: procedural + real models)

### 7.1 Tech

- Deps: `three`, `@react-three/fiber`, `@react-three/drei` (runtime); `@gltf-transform/cli` (devDependency, model optimization only).
- All 3D in a `components/three/` folder. Each scene: lazy `React.lazy` chunk, `<Canvas dpr={[1, 1.75]}>`, `frameloop="demand"` where possible, pause when tab hidden.
- **WebGL detect**: if unavailable → render the static fallback (pre-rendered gradient poster or CSS scene). Never block content on 3D.

### 7.2 Procedural elements (no assets needed)

- Hero backdrop: instanced particle field + floating wireframe icosahedrons, slow rotation, pointer parallax, scroll-linked camera drift.
- Glass shard accents behind CTA sections.
- Grid floor plane with fog fade (hero bottom).

### 7.3 Real model pipeline

| Step | Rule |
|---|---|
| Sourcing | CC0/CC-BY sources (Kenney, Poly Haven, Sketchfab CC) **or models provided by the owner**. License + source recorded per file in `docs/ASSETS.md` (created in the model phase). |
| Formats | `.glb` only, Y-up, real-world scale, Draco or Meshopt compressed |
| Optimization | `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp` ; textures ≤ 1024px |
| Budgets | Per model ≤ 500 KB; total 3D payload ≤ 2 MB; ≤ 100k triangles per scene; hero 3D chunk lazy-loaded after LCP |
| Placement map | **Landing hero**: 1 centerpiece model (floating trophy) + procedural backdrop · **FinalCTA**: portal ring model · **Auth side panel**: low-poly arena diorama, idle loop · **Dashboards: no WebGL** (tilt cards only) |
| Fallbacks | Every model scene has a poster/gradient fallback; models load with `<Suspense>` placeholder that matches layout |

**Premium rendering layer (D7, Phase 7).** Scenes upgrade their look without new assets: a shared `three/premium.jsx` provides (1) `StudioEnv` — a procedural environment map built from drei `Lightformer` strips in brand colors (indigo/violet/cyan), so PBR materials get real reflections with zero network payload; (2) a PBR material factory (`goldMaterial`, `physicalFrom` clearcoat overrides) applied to the trophy (polished gold) and the Kenney kit pieces (clearcoat physical); (3) `ContactShadows` grounding; (4) selective `Bloom` via `@react-three/postprocessing` — the postprocessing runtime lives **only** in the lazy 3D chunks, never the initial bundle. Lazy3D gating and fallback behavior are unchanged.

---

## 8. Page-by-page scope & acceptance criteria

### 8.1 Landing (public)
Kinetic type hero over 3D scene; scroll storytelling (pinned hero → bento features → 3D games ring → how-it-works → FinalCTA with portal); live tournament bento with tilt cards + countdowns; footer socials → lucide icons.
**Accept**: Lighthouse motion doesn't block LCP; all anchors smooth-scroll correctly; empty/offline states designed; 60fps scroll on desktop.

### 8.2 Auth (login, register hub, role forms, forgot/reset)
Split-screen cinematic; left panel = 3D diorama + parallax; form card = tilt + focus-glow inputs; boot-up entrance; button ripple on submit; error shake (respects reduced motion).
**Accept**: all flows still work E2E (login → role redirect; register → dashboard); keyboard-only completable.

### 8.3 Shared dashboard shell (all roles)
Sidebar: active rail glow, hover slide-glow, collapsible with animated width; header: glass on scroll, search overlay animation; page enter choreography; stat cards = tilt + count-up; tables/lists get row-stagger reveal; toasts restyled.
**Accept**: nav toggles work at all breakpoints (mobile drawer starts closed); sidebar collapse persists per session.

### 8.4 Role pages (organizer / participant / sponsor / superadmin)
Restyle existing functionality in the new system — **no functional changes**. Tournament cards, modals (Register/Sponsor/Confirm), and status badges move to tokens; modals get scale+fade entrance and backdrop blur.
**Accept**: every existing page renders with zero console errors; every button visibly responds to press; theme toggle still persists correctly across reload.

### 8.5 Global
404 + Unauthorized pages in-system; `index.css` reorganized into token → base → utilities sections; assets compressed (hero PNG ~2.2MB → WebP ≤ 400KB).

---

## 9. Backend guardrails

**No backend changes.** API, schemas, routes, and controllers stay as-is. Single allowlisted exception if profiling demands it: a compound MongoDB index supporting `GET /tournaments?scope=landing` (`{ status: 1, startDate: 1 }`) — added in the final phase only, with a measured before/after.

---

## 10. Library decisions (verified against `frontend/package.json`)

| Library | Status | Role |
|---|---|---|
| gsap + ScrollTrigger | ✅ installed, active | All DOM animation, pinning, scene transitions |
| lenis | ✅ installed, active | Smooth scroll (drives ScrollTrigger) |
| lucide-react | ✅ installed, active | Icon system |
| sonner | ✅ installed | Toasts (restyled only) |
| motion (Framer) | ⚪ installed, unused | **Not adopted** (single motion system). May be removed in Phase 6 |
| three + @react-three/fiber + drei | ➕ add Phase 0 | WebGL scenes (§7) |
| @gltf-transform/cli | ➕ add Phase 0 (devDep) | Model optimization only |

Explicitly out: UI kit libraries, CSS-in-JS, router replacement, state library, audio libs (D3).

---

## 11. Phased build order (each phase = shippable, reviewable state)

### Phase 0 — Foundations (design system + motion core) ✅ DONE (2026-09-25)
Install 3D deps. Rewrite `index.css` token sections (§5.1–5.3). Build `components/motion/` primitives: `usePressFeedback`, `useTilt`, `useCountUp`; upgrade `PageTransition`; restyle Sonner. Migrate `ui/Button.jsx` and `ui/Badge.jsx` to tokens.
**Exit criteria**: build green; landing looks unchanged except token colors; every primitive has reduced-motion fallback; zero console errors on `/`.
**Shipped**: `--np-*` token system (light+dark) with legacy aliases re-pointed; `.np-eyebrow`, `.np-display`, `.np-glass`, `.np-elevated`, `.np-badge-*`, `.np-toast`, scene-wipe CSS; `motion/usePressFeedback.js`, `motion/useTilt.js`, `motion/useCountUp.js`; `PageTransition` two-beat wipe (reduced-motion = instant swap); tokenized `ui/Button.jsx` (ripple, loading, 5 variants) + `ui/Badge.jsx` (tone-driven); Sonner on `np-toast` class; deps `three @react-three/fiber @react-three/drei @gltf-transform/cli` installed. Verified: build green, landing/auth render under tokens, wipe + ripple + glare + toast + light/dark tokens confirmed in-browser.

### Phase 1 — Landing showcase ✅ DONE (2026-09-25)
Compress assets; build `components/three/HeroScene` (procedural first); kinetic type already exists — add count-up real stats if API exposes them; 3D games ring; FinalCTA portal (procedural); replace emoji socials.
**Exit criteria**: §8.1 accepted; 3D lazy chunk < 1 MB gz; fallback verified by disabling WebGL.
**Shipped**: assets 15.12 MB → 619 KB WebP (sharp script at `frontend/scripts/optimize-assets.mjs`, originals gitignored); `three/supportsWebGL.js` + `three/Lazy3D.jsx` (viewport-gated, fail-open after 1.2s, WebGL-off → fallback); `three/HeroScene.jsx` (seeded instanced particles, Float wireframe shards, gridHelper floor, pointer-parallax rig, scroll camera drift, dpr cap, low-power mode); `three/PortalScene.jsx` (counter-rotating rings + pulsing core); `landing/GamesRing.jsx` CSS 3D cylinder with drag inertia replacing the flat marquee; hero stats on `useCountUp`; emoji socials → lucide (v1.33 dropped brand icons — used MessageCircle/Camera/AtSign/MonitorPlay); chunk split verified: HeroScene 1.5 KB gz + PortalScene 0.6 KB gz + three runtime 243 KB gz lazy, initial bundle unchanged. Fixed during verification: gridHelper-as-geometry frustum crash, IO-less environments (fail-open), seeded PRNG purity, GamesRing lazy state init.

### Phase 2 — Auth suite ✅ DONE (2026-09-25)
Apply §8.2 to all six auth screens; keep all flows working.
**Exit criteria**: register/login/forgot/reset E2E pass; visual QA at 375px, 768px, 1440px.
**Shipped**: `auth/AuthShell.jsx` (split-screen: parallax backdrop + lazy diorama left, tilt glass form card right, boot-up stagger, shake-on-error via shakeKey, mobile single-column); `auth/AuthInput.jsx` (token inputs, focus glow, error state, password reveal); `three/DioramaScene.jsx` (procedural low-poly arena: faceted core, crowd ring, pylons, motes — 1.35 KB gz lazy chunk); CSS `.np-input` focus glow, `.np-shake`, `.np-boot` (reduced-motion opt-outs). All 8 auth screens rewired (login, register hub with tilt role cards, player/organizer/sponsor register, organizer profile incl. select+textarea on tokens, forgot, reset). E2E verified: login → superadmin dashboard; every route renders with correct input counts. Fixed en route: Button `{...press}` classname clobber (buttons rendered unstyled — ripple class now merged), organizerRegisterPage file-case duplication (git mv to `OrganizerRegisterPage.jsx` matching the App.jsx import), np-boot/np-shake cascade conflict (mutually exclusive now), stale Vite watcher (dev server restart).

### Phase 3 — Dashboard shell (shared) ✅ DONE (2026-09-26)
Sidebar + header + page choreography + stat cards + toasts (§8.3), applied to `OrganizerLayout`, `ParticipantLayout`, `SponsorLayout`, `SuperAdminLayout` via shared components (dedupe the four layouts' duplicated header/search/notification code into `components/layout/shell/`).
**Exit criteria**: all four roles navigate identically; drawer behavior correct on mobile; no regressions in role-guarded routing.
**Shipped**: `layout/shell/DashboardShell.jsx` (collapsible rail 288↔76px w/ active glow + `np-tooltip` on the icon rail, desktop state persisted per session via `sessionStorage["np_sidebar"]`, mobile overlay drawer closed by default with body-scroll lock + backdrop, glass sticky header `np-header-glass`, notifications popover + theme toggle + profile pill, `np-boot` page-enter re-keyed per route, tokenized footer); `shell/sidebarConfig.js` (nav data schema); `shell/StatCard.jsx` (tilt + count-up + boot stagger, adopted by all four role dashboards); `.np-stagger` opt-in row-stagger utility (40ms/row, cap 12, reduced-motion static) for Phase 5 lists. All four layouts are now thin config wrappers; old `OrganizerSidebar/Navbar`, `SponsorSidebar`, `SuperAdminSidebar` deleted. Verified live: login→redirect for all 4 roles (created qa.player/qa.organizer/qa.sponsor @nexusplay.gg), drawer open→navigate→auto-close at 656px, light/dark toggle persists across reload, role guard redirects cross-role nav to `/unauthorized`, build green. Known non-regressions: 403 from `TournamentContext` on non-organizer roles (pre-existing graceful fallback), 404 `tournaments/me` for unverified organizer (correct backend behavior, page shows verification banner).

### Phase 4 — Real 3D models ✅ DONE (2026-09-26)
Source/license models → `docs/ASSETS.md`; optimize via gltf-transform; integrate hero trophy, portal ring, auth diorama (§7.3).
**Exit criteria**: budgets met (≤500 KB/model, ≤2 MB total); fallbacks verified; licenses documented.
**Shipped**: 6 optimized GLBs in `frontend/src/assets/models/` (total **47.5 KB**, biggest 13 KB): Kenney Mini Arena kit (CC0) — trophy 8.3 KB (hero centerpiece, float+spin over the grid), statue/column/banner/wall-gate (auth diorama on a new turntable plinth); Poly by Google "Halo" ring (CC-BY 3.0, attributed in landing footer + docs/ASSETS.md) — 3 KB, doubled into two material-cloned tinted instances with gyroscope precession in PortalScene. Pipeline: `gltf-transform optimize --compress meshopt --texture-compress webp`; imports use `.glb?url` (rolldown-vite otherwise tries to UTF-8-parse them); `<Gltf>`/`useGLTF` wire the MeshoptDecoder; `ring.glb` inlines as data URI (<4 KB limit). Verified live: hero trophy + portal stargate + grounded diorama all render, GLB fetches 200, console clean (only pre-existing 403/404 data-layer notes), build green, Lazy3D fallbacks intact (models only load inside the gated scenes).

### Phase 5 — Role pages rollout ✅ DONE (2026-09-26)
Restyle all role pages + modals per §8.4, one role per PR-sized chunk in order: participant → organizer → sponsor → superadmin.
**Exit criteria**: per-role page inventory passes anti-slop checklist; full manual E2E of each role.
**Participant chunk shipped (2026-09-26)**: `ParticipantDashboard` (eyebrow motif, `Button`/`Badge` components, `np-stagger` registration list, token icon boxes), `ParticipantTournaments` (extracted `TournamentCard` with tilt+glare, lucide `Search` replacing 🔍, "Live Now 🔴"→"Live Now", ripple filter tabs, `Badge status=` everywhere, tabular-nums money), `ParticipantHistory` (eyebrow, token `Badge`, `np-stagger` rows, token icon boxes), participant `ProfilePage` (eyebrow, gradient avatar tile, token status banners, `Button` with loading spinner), `ParticipantRegistrationModal` (`.np-modal` scale+fade entrance + `.np-modal-backdrop` blur utility added to index.css, token header with Badge, all rose-500/amber/indigo raw colors → tokens, submit button with ripple + spinner). Verified live as qa.player: all 4 pages + modal render correct in dark & light, edit-mode toggle works, console clean (only pre-existing 403 fallback note), build green.
**Organizer chunk shipped (2026-09-26)**: all 9 organizer surfaces tokenized (DashboardPage, TournamentsPage, CreateTournamentPage, TournamentDetailPage, RegisteredTeamPage, SponsorPage, ProfilePage, SettingsPage, HistoryPage). Batch migration: every raw `indigo-/emerald-/rose-/amber-/zinc-/slate-*` Tailwind color → `--np-*` tokens via `color-mix()` tints; 19 inline `style={{borderColor}}` hacks → `theme-border` class; Settings theme cards on tokens + `accent-[var(--np-accent)]` checkbox. Structural: eyebrow+display headers, `Button`/`Badge` primitives (incl. success/danger Approve/Reject overrides), `np-stagger` on dashboard/tournament/team lists, ripple on Create page submit buttons, gradient avatar tiles, `tabular-nums` money. HistoryPage bare stub → designed tokenized empty state (anti-slop). Verified live as qa.organizer: dashboard/sponsors/settings/history/profile/create-gate render correct, profile form validation + loading flow works (save 404s only because unverified organizer has no profile document — correct backend behavior, not a restyle regression), create page correctly gates on verification, console clean (pre-existing 404 notes only), build green, zero emoji, zero off-token colors.
**Sponsor chunk shipped (2026-09-26)**: all 7 sponsor surfaces tokenized (SponsorDashboard, SponsorTournaments, MySponsorshipsPage, SponsorAnalyticsPage, SponsorProfilePage, SponsorTournamentDetails) + shared `SponsorModal` moved to `.np-modal`/`.np-modal-backdrop` entrance, `Button` primitives, token inputs, `accent-[var(--np-accent)]` terms checkbox. Structural: eyebrow+display headers, token hero panels with accent gradient wash (dashboard + superadmin share the treatment), press-filter game tabs, `Badge` component with tone map (pending→warning, approved→accent, active/completed→success, rejected→danger), `np-stagger` card grid, gradient fallback banners (`--np-accent`→`--np-accent-2`→bg-0) replacing raw indigo/slate, token capacity/participation progress bars, `tabular-nums` money, gradient avatar tiles in profile, dead `MapPin` orphan block removed from profile. Verified live as a freshly registered sponsor: register→dashboard redirect, browse (5 seeded tournaments), SponsorModal open+validate, profile/status banners, analytics, sponsorships empty state, details page + gradient fallback banner, light/dark toggle persists across reload, role guard bounces sponsor from `/superadmin/*` to `/unauthorized`, build green. Known non-regression: proposal submit returns 403 "Only verified sponsors can submit sponsorship requests" — correct backend gate (unverified sponsor), same class as the unverified-organizer note in the organizer chunk.
**Superadmin chunk shipped (2026-09-26)**: all 9 superadmin surfaces tokenized (SuperAdminDashboard, UsersManagementPage, OrganizersManagementPage, SponsorsManagementPage, TournamentsModerationPage, SponsorshipsPage, PaymentsManagementPage, ReportsPage, PlatformSettingsPage). Structural: eyebrow headers, hero gradient wash, `StatCard` row retained, press filter-count tiles (KYC/status/tournament/payment filters), `Badge` with payment-ledger tone map (`payment_pending`→warning, `paid`→success, `refunded`→accent, `failed`→danger), `np-stagger` table bodies, gradient avatar tiles for players, `.np-modal` detail sheets, semantic action Buttons (`!bg-[var(--np-success)]` verify, `variant=danger` reject, `!bg-[var(--np-warning)] !text-black` suspend — same overrides as organizer chunk). **Two real data-layer gaps fixed frontend-only**: (1) `adminService` was missing `getPayments`/`getPayment`/`getReports` methods that two pages already called — payments pages were dead; added methods wired to existing `/superadmin/payments` routes and `/admin/reports` (reports endpoint lives on the admin router; no `/superadmin/reports` route exists). (2) ReportsPage hardcoded placeholder metrics ("$56,400", "3,820 players") — anti-slop violation; now binds the real `gameBreakdown`/`userGrowth`/`totalCommissionEarned` payload with designed empty/error states; hardcoded `monthlyRevenue` trend block dropped (no meaningful binding). PlatformSettingsPage has no backend endpoint at all — renders a designed "Settings Service Not Connected" state instead of a dead form (PRD §9 forbids adding the endpoint); the toggle UI stays intact and activates when the API ships. Verified live as admin@nexusplay.gg: dashboard, players (mobile card layout + detail modal), organizers KYC (tiles + table + Badge), tournaments moderation, sponsorships, payments (now live), reports (real data + gradient charts), settings (unavailable state), theme toggle round-trip persists, build green, zero emoji, zero off-token palette colors.

### Phase 6 — Hardening & cleanup ✅ DONE (2026-09-26)
Perf pass (bundle audit, code-split routes, `React.memo` hot paths); a11y pass (focus, contrast, reduced-motion sweep); remove `motion` dep; optional landing index (§9); update README run docs.
**Route code splitting shipped (2026-09-26)**: every page in `App.jsx` converted from static imports to `React.lazy` named-export mappers (`.then((m) => ({ default: m.X }))` — the pages export named, not default); single `Suspense` boundary wrapping `Routes` with a token-styled `RouteFallback` spinner (§5.4 anti-slop: no blank flash, reserved height). The four role layouts + `DashboardShell` + providers stay in the initial bundle as persistent chrome. Result: **initial bundle 855 KB / 224 KB gz → 422 KB / 139 KB gz** (under the 500 KB target), each page now a 2–9 KB gz chunk; three.js runtime chunk (987 KB / 264 KB gz) unchanged and already lazy, loading only inside gated 3D scenes. Chunk fetches normally resolve under the PageTransition wipe; `RouteFallback` shows only on cold first paint of a route. Verified live: landing (hero 3D + trophy.glb async chain), login → superadmin dashboard, cold navigation to reports (real data renders), role guard redirect — console shows only the pre-existing TournamentContext 403/500 fallback notes. Name collision en route: auth `OrganizerProfilePage` vs organizer dashboard `ProfilePage` both lazy-mapped — organizer one aliased `OrganizerDashboardProfilePage` in App.jsx (routes unchanged).
**A11y + cleanup shipped (2026-09-26)**: (1) **Reduced-motion sweep** — all three motion primitives already honor `prefers-reduced-motion` in JS (`useTilt` no-ops, `useCountUp` renders final value statically, ripples are CSS-driven under the global kill-switch); the index.css kill-switch covers `.np-boot`, `.np-shake`, `.np-stagger`, `.tilt-card`, orbs, shimmer, and all transitions (0.01ms) — no gaps found. (2) **Focus-visible fix** — dashboard/auth inputs carry Tailwind's `outline-none`, which defeated the global `:focus-visible` ring on keyboard nav (found live); added `.np-input:focus-visible` + `.np-input-error:focus-visible` outline indicators (accent-3 / danger, 2px, offset 1) so keyboard focus is always visible even where the glow shadow is clipped. (3) **Light-mode contrast** — computed WCAG ratios for every token pair in both themes (body 10.4–11.5:1, mute 4.4–6.5:1, accents 3.7–10.1:1); the only sub-AA small-text pair was light-theme `--np-warning` (3.19:1) — darkened `#d97706 → #b45309` (5.02:1, amber-700); dark theme unchanged (`#FBBF24` = 10.94:1). (4) **Dep cleanup** — removed `motion` (D5: never adopted) AND `react-hot-toast` (superseded by sonner; zero imports); `npm uninstall` clean, build green, bundle byte-identical. (5) **Mobile drawer re-check** at 390px — closed by default, body scroll locked while open, closes on Escape, backdrop click, and navigation; overlays cleaned up after route change. (6) **`React.memo` decision: skipped** — with route splitting the dashboard tables render small lists (≤12 stagger cap) and profiling showed no hot re-render path worth the memo noise; revisit only if real data scales 10x. (7) **README updated** with the §12 run stack (portable `mongod` via `npm run db -w backend`, three-terminal startup, superadmin demo login table, landing seed command, GLB `?url` gotcha). (8) **Landing index (§9): not added** — landing query serves the seeded 5-tournament dataset without measurable latency; the allowlisted compound index stays unapplied per the "only if profiling demands it" rule. Final state: build green, zero emoji, zero off-token colors, no stray console statements in role-page code.
**Exit criteria**: §12 full checklist green; PRD marked "implemented v1" in the header.

### Phase 7 — Landing polish & premium 3D (v2.1) — from product-owner review 2026-09-26
Five user-reported gaps, fixed in this order (P1–P5 map to the numbered complaints):
1. **P1 — Per-game 3D-style card art.** Tournament cards carry only a flat gradient wash, so they look empty and generic. Create `utils/gameTheme.js` — the single per-game source §5.1 requires (accent colors + gradient + genre, for all 8 seeded games) — and `landing/GameArt.jsx`, a procedural 3D-style media plate: per-game geometric emblem (neon line-art SVG, no emoji), accent-tinted deep-space gradient, perspective grid floor, floating specular sheen. `FeaturedTournaments` cards render GameArt instead of bare gradients.
2. **P2 — dead band after the hero/bento.** Two causes: the hero pin holds `+=120%` with content already faded (a long bare-backdrop scroll), and the slim games band below the bento is mostly padding around a 240px chip stage. Shorten the pin window, tighten FeaturedTournaments' bottom rhythm, and merge the games band into the new showcase section so no orphan background remains.
3. **P3 — GamesRing → GamesShowcase.** The chip-ring section shows only tiny floating labels — reads empty. Replace with a full section: signature eyebrow + display heading, a responsive grid of 8 GameArt game cards (emblem, name, genre chip, hover response), token backgrounds matching the landing rhythm. The §6.3 marquee-ring pattern is retired (see catalog note).
4. **P4 — Premium 3D pass (D7).** Models currently render with flat/basic materials and plain lights — they read as low-poly toys. Apply the §7.3 premium layer to all three scenes: HeroScene (gold PBR trophy, StudioEnv, bloom, grounded shards), PortalScene (env-lit emissive rings + bloom), DioramaScene (clearcoat physical kit pieces, StudioEnv, contact shadows, subtle bloom).
5. **P5 — Token cohesion.** The landing page violates §5.1/§5.4: raw hexes (`#050A18`/`#07101F`/`#091122`/`#030711`), `border-indigo-500/25`, and emoji icons in aboutCards/features. Migrate every landing surface to `--np-*` tokens + lucide icons; adopt `gameTheme()` tints in the participant TournamentCard fallback media so landing and dashboard cards read as one system.
**Exit criteria**: build green; main bundle stays ≤ 430 KB gz and all 3D additions (postprocessing, env rig) stay inside the lazy chunks; zero raw palette hexes and zero emoji on landing; games section content-rich; no dead scroll stretch after the hero; trophy/diorama/portal visibly premium (PBR reflections, bloom); reduced-motion fallbacks intact; live QA screenshots at desktop + mobile; this §11 entry gets ship notes.
**Phase 7 shipped (2026-09-26)**: **P1** — `utils/gameTheme.js` (§5.1 single source: accent/gradient/genre for all 8 games) + `landing/GameArt.jsx`, procedural per-game media plates (neon line-art SVG emblem — V/helmet/crosshair/flame/ball/chevron/dog-tag/sigil — over an accent perspective grid floor + horizon glow + sheen hover, zero image payload); every FeaturedTournaments card renders its game's plate. **P2** — hero pin `+=120% → +=65%` with content fade starting at 0.35 (floor 0.15 opacity, no full-vanish dead band); the slim py-6 GamesRing band is gone (merged into the showcase), so featured→games transition is continuous. **Owner re-test (same day): band persisted** — root cause was the pin window itself holding the hero while its copy was already invisible. Final fix: pin `+=40%`, hero copy stays on stage for the whole pin (small −6% lift, one late dim to 0.55 in the last 28% of the scrub), FeaturedTournaments top padding 20/28 → 14/20 — verified frame-by-frame that the bento header enters the viewport the moment the hero releases. **Round 3 (owner-reported lag at the handoff)**: two causes fixed — (1) hero timeline `scrub: 0.8 → true`: smoothed scrub keeps easing toward the scroll position after the pin releases, which read as lag exactly at the handoff; with Lenis already smoothing the wheel, 1:1 scrub is in sync (SmoothScroll is the canonical Lenis→GSAP-ticker integration); (2) HeroScene canvas now pauses its frameloop via IntersectionObserver when the hero leaves the viewport (±80px margin) — the bloom composer + particle field previously kept burning GPU while the bento/cards animated in. **P3** — `GamesRing.jsx` deleted (component + `.np-ring-*` CSS); new `GamesShowcase.jsx`: eyebrow + "Pick your battleground." display heading + supporting copy, 2/3/4-col responsive grid of 8 showcase GameArt plates (emblem + name + genre caption), "more games every season" footer strip with CTA; §6.3 catalog row updated. **P4 (D7)** — `three/premium.jsx`: `StudioEnv` (procedural Lightformer studio env, frames=1, zero network), PBR finish factory (gold/goldSatin/obsidian/marble) + `applyFinish`, `PremiumLighting`, `PremiumBloom` (@react-three/postprocessing, mipmapBlur, SCREEN blend). HeroScene: trophy re-skinned polished gold + obsidian base, env-lit, bloom ≥0.7 threshold. PortalScene: metallic env-lit rings with emissive halos + bloom 0.75 — reads as a glowing stargate. DioramaScene: gate/statues marble, columns obsidian (mirror-gold picked up the cyan rim as a green cast — documented in-code), **no ContactShadows**: its depth plane composites as a light disc under EffectComposer; plinth grounds the diorama. Dep added: `@react-three/postprocessing`. **P5** — every landing surface on `--np-*` tokens (FeaturedTournaments, HeroSection, FinalCTA, Preloader, LandingPage hexes + indigo-500 raws → tokens/accent utilities); emoji aboutCards/features → lucide (Gamepad2/Trophy/Handshake + Search/ClipboardList/ShieldCheck/Zap); participant TournamentCard got a gameTheme gradient top edge so dashboard cards match the landing system; `.np-dark-surface` root class pins the dark §5.1 values on the landing in both themes (landing is cinematic-dark by design). **QA**: build green — main 423.98 KB / **139.86 KB gz** (+0.65 KB), postprocessing+three vendor merged into the lazy `premium` chunk (305 KB gz, loads only inside gated scenes); landing/login verified live at 1440px + 390px — 8 unique emblems, gold trophy, stargate portal, no dead band, zero emoji/hexes; console shows only pre-existing 403 context notes. Reduced-motion: GameArt float + sheen static; premium scenes unchanged (Lazy3D gates).
**Amendment (same day, product-owner feedback)**: the owner wants photographic game-art thumbnails on tournament cards (like the pre-redesign cards), not line-art emblems. All 8 games now ship banner art: the four Phase 1 banners (valorant/bgmi/cs2/free-fire) plus four owner-supplied key-art images (rocket-league, apex-legends, call-of-duty, dota) saved to gitignored `originals/` and compressed to 1024w WebP q70 (21–53 KB each) via the same sharp pipeline. Card-variant GameArt renders the banner full-bleed under the accent scrim + sheen; the procedural plate remains the fallback for unknown games. Showcase variant keeps emblems (approved look). An interim procedural-art generator explored for these four was discarded (files deleted) in favor of the owner's art.
**P3-rev (owner feedback + approval, same day)**: the showcase grid lost the section's signature ring interaction (§6.3 originally specced a 3D marquee ring). Owner approved rebuilding it as **GamesRing 2.0**: the 8 GameArt banner plates mounted on a CSS 3D cylinder (auto-spin, drag inertia, hover-pause), with a center glass **info hub** (owner chose hub over on-plate reveal) showing the front-most/hovered game's name, genre, and live stats — tournament count, total prize pool, teams registered — aggregated from the landing API (real data, anti-slop); games without tournaments show a designed empty line. Ring on all screen sizes (owner choice); drag on touch; reduced motion renders the static captioned plate row. **Built as `GamesRing2.jsx` + `.np-ring2-*` CSS**: plates use the card variant (pure banner art — hub carries name/genre, no double text), hub glass raised to 88% bg opacity for legibility, pluralization fixed; verified live (spin, drag, hub stats from the landing API). **Owner revision (same day)**: center glass hub removed as not useful — name/genre captions live on the plates themselves (showcase variant), and the ring was resized to fill its section (plates 300×188 desktop / 200×130 mobile via resize listener; radius `plate.w/2 + 24` polygon formula so the ring reads dense, stage 320/220px). Banner art now renders on all GameArt variants (ring plates + cards share the real key art). **Banner swap (owner-supplied)**: valorant/bgmi/cs2/free-fire `.webp`s replaced with the owner's new key art (originals archived; 26–65 KB compressed).
**P4-rev (owner feedback, same day)**: the auth-side Kenney diorama still reads low-poly/off-brand — **removed** (DioramaScene deleted along with the now-unused Kenney GLBs: statue/column/banner/wall-gate; trophy + ring models stay — owner explicitly kept them). Auth screens get a **downloaded live-wallpaper video backdrop covering the FULL page** (owner chose their own "Omen Valorant" wallpaper file over stock candidates): transcoded 77 MB → 5.4 MB 720p H.264 loop (audio stripped, faststart, ffmpeg; poster frame grabbed) served from `/public/wallpapers/` via `<video autoplay muted loop playsinline>` under uniform dim + gradient scrims, with a subtle **cursor parallax + spotlight** on the video layer (disabled under reduced motion; poster shows instead of autoplay). One `LiveWallpaper` component mounted once in `AuthShell` as a fixed full-viewport layer — all 8 auth screens inherit it. License/source recorded in docs/ASSETS.md. HeroScene/PortalScene unchanged.
**Hardening pass (owner: full scan + test, 2026-09-27)**: (1) **Random dev reloads fixed** — root cause: lazy 3D chunks discovering deps on first visit triggered optimizeDeps re-runs ("optimized dependencies changed, reloading"); `vite.config.js` now pre-bundles all lazy-chunk deps (`optimizeDeps.include`) + `server.warmup` for entry/3D routes. (2) **Orphan scan** (scripted, verify-before-delete): removed 7 dead components (participant TournamentRegisterModal/TournamentSearch, sponsor SponsorCard/SponsorTierBadge, admin AdminTable/ConfirmModal/StatusBadge), dead `participant/PublicTournamentDetails` page, dead `utils/payment.js` (UPI util never imported), orphaned `login-bg.webp`, and 4 loose PNG originals already shipped as WebP; manifest trimmed. Lazy-imported pages verified live before keeping. (3) **Hero trophy repositioned (owner: keep it centered)** — final placement x=0 (horizontal center), y raised to 1.55, scale 1.95 (mobile 1.4) so it clears the left-aligned headline block; note the preview-webview can render the hero canvas at a stale 340×340 (PRD §12 gotcha) — judge trophy placement in a real browser, where it projects viewport-center. (4) **Live QA passed**: landing scroll journey hero→bento→ring→about→how→CTA→footer renders correctly with no dead bands; cards/ring show real game art; auth E2E login→superadmin dashboard works; mobile 390px ring 200px plates, no horizontal overflow; console clean (pre-existing 403 context note + benign Three shader precision warning only). Build green: main 423.94 KB / 139.87 KB gz.
**Playtest & fix pass (owner: full first-user playtest, 2026-09-28)**: drove the real app end-to-end as a first user — landing → auth → participant E2E → careless inputs → rapid double-clicks → reload mid-action → error pages → logout. Found + fixed 3 substantiated defects:
1. **Phantom "accept all agreements" error** — `ParticipantRegistrationModal` cleared agreement errors by setting them to `null`, but `hasAgreementErrors` counted key *existence*, so the very first click of the "Accept all" master checkbox manufactured 8 null-valued error keys and showed "Please accept all mandatory agreements before submitting." on a fully-checked form (before any submit). Fix: count truthy messages only (`Boolean(errors[key])`). Verified on both solo and team flows: no phantom banner, submit succeeds.
2. **Double-click fired duplicate POSTs** — the `isSubmitting` React state guard lands one render too late, so two same-tick clicks both passed it (observed 2 POSTs on the wire). Fix: synchronous `submitLockRef` re-entry guard with next-tick release. Verified: double-click on a valid form → exactly 1 POST → 1 registration; double-click on an invalid form → 1 toast instead of 2. (QA note: error toasts auto-dismiss after ~4s — "silent submit" readings that sample later are harness artifacts, the feedback does fire.)
3. **Register dead end on non-published tournaments** — a tournament card in ONGOING state still offered a live "Register Now" that opened the full 27-field form, and only the backend rejected the submit ("Registration is not available for this tournament"). Fix: the card renders a locked "Registration Closed" state when `status !== "published"`, and the modal submit path mirrors the backend rule (defense-in-depth). Backend already guards correctly: only `published` accepts registrations, plus deadline, duplicate-captain, linked-player, and capacity checks.
Also verified green: registration E2E solo (Free Fire) and team-of-4 (BGMI, CS2) with slots incrementing and "Already Registered" states; My Registrations tab; profile edit validation (invalid phone rejected inline, valid save persists); 404 and 403 error pages with role-aware recovery links; mobile drawer (nav + logout); reload mid-action (modal discarded, session survives); logout clears token and returns to /login. Console stays clean except the pre-existing 403 context-fallback note. Build green: main 423.94 KB / **139.83 KB gz**, premium chunk 305.01 KB gz (lazy).

**Motion audit + exit choreography + tournament detail rebuild (2026-09-29)**: ran the full design-motion-principles audit (Emil primary / Jakub secondary / Jhey selective) across the shipped UI. Verdict: disciplined tokenized system, comprehensive reduced-motion kill-switch; report at `motion-audits/frontend-2026-09-28.html` with looping demo cards. Findings shipped:
1. **[Critical] Overlays had no exit animations** — modals ended in a hard cut. Added `[data-closing]` exit choreography: `npBackdropOut` 0.2s ease + `npModalOut` 0.2s expo-out (panel recedes translateY(-6px) scale(0.99)) driven by `requestClose()` in `ParticipantRegistrationModal` (guards: isSubmitting, no double-timer; Escape/backdrop-click/X/Cancel all animate; success path stays instant). Live-verified: computed `npModalOut` on exit, backdrop unmounted by ~250ms.
2. **[Critical] Mobile drawer snapped shut** — added `.np-drawer-backdrop` / `.np-drawer` enter (0.3s expo-out) + exit (0.22s expo-out) with the same `[data-closing]` contract in `DashboardShell`. Scroll lock releases at request time; re-open mid-exit cancels the timer, restores the panel, and re-asserts the scroll lock (race fixed + verified at 390px).
3. **[Deepen] `/participant/tournaments/:id` rebuilt on the real API** — the old page was a mock-era fossil reading localStorage (`nexus_tournaments`/`my_registrations`) and could never show a live tournament. New page: `GET /tournaments/:id` + `GET /tournaments/:id/registration`, gameTheme art, status-aware CTA (Register Now / Slots Filled / Registration Closed / You're Registered with a two-phase inline Withdraw confirm → `DELETE /tournaments/:id/registration` → toast + slot decrement). E2E verified in-browser (register Rocket League team-of-4 → withdraw → card flips back; backend register→cancel cycle verified with the modal's exact payload) and via API (201 → `registered` → 200 cancel → 404, slots 9/24→8/24).
4. **[Wiring] Tournament card titles now navigate to the detail page** (hover accent on title only, per the one-motion-response-per-element rule); detail is also reachable from dashboard "View" links.
Left open (audit Opportunities): unused `--ease-spring` token removal, drawer rail ease-in-out→expo-out, route-wipe A/B on dashboards, animated Moon↔Sun icon swap.
Build green: main 424.42 KB / **139.99 KB gz**, premium chunk 305.01 KB gz (lazy).

**Audit opportunities applied (2026-09-29)**: all four remaining motion-audit Opportunities shipped and live-verified:
1. **`--ease-spring` deleted** — zero consumers confirmed; token removed from the §6.1 motion block.
2. **Drawer rail easing** — desktop rail width transition moved from `ease-in-out` to `var(--ease-out-expo)` (the system's signature decel; verified computed `cubic-bezier(0.16, 1, 0.3, 1)` on the aside).
3. **Route-wipe A/B on dashboards** — `PageTransition` now selects `np-wipe--fast` for `/participant|organizer|sponsor|superadmin` trees: a single translucent scrim fades over the swap (180ms `--dur-2`, both beats) instead of the 300ms+620ms cinematic panel wipe; landing/auth keep the cinematic wipe and dashboards still replay `pageIn` on arrival. Verified mid-cover scrim opacity 0.76 during dashboard navigation.
4. **Animated Moon↔Sun swap** — theme toggle in the dashboard shell now orbit-crossfades both icons (both stay mounted; active icon upright, idle one orbits ±90°/scale 0.6 while fading, 180ms opacity + 300ms cinematic transform). Round-trip toggling verified with mid-flight samples; replaces the old hard-swap. `aria-label` added (Switch to light/dark theme).
Build green: main 424.75 KB / **140.10 KB gz**, premium chunk 305.01 KB gz (lazy).

---

## 12. QA checklist & how to run

**Run stack** (Windows, portable Mongo): start `backend/mongodb-portable/mongod.exe --dbpath backend/data-db --port 27017`, `npm run dev` in `backend/` (:5000), `npm run dev` in `frontend/` (:5173). Demo login: `admin@nexusplay.gg` / `admin123` (superadmin; also owns seeded demo tournaments). Landing seed: `node backend/src/seeder/seedDemoTournaments.js` (idempotent).

> **Gotcha (2026-09-26):** a stale orphaned Vite process can squat :5173 serving an old module graph — if a page looks stale or CSS misbehaves, check the dev-server port printed by the *fresh* process (e.g. :5174) and QA against that; kill the stale process rather than debugging phantom CSS.

**Per-phase checklist**: `npx vite build` green · zero console errors on every touched route · reduced-motion mode static · keyboard-only nav works · theme toggle persists across reload · mobile drawer closed by default · no new colors/fonts outside tokens · anchors smooth-scroll.

**Perf budgets**: LCP < 2.5s on landing; 3D chunk lazy; FPS 60 desktop / 30+ mobile mid-range; total 3D ≤ 2 MB (§7.3).

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| 3D payload hurts landing perf | Lazy chunk after LCP, strict budgets, poster fallback, frameloop pauses |
| Four role layouts drift apart again | Phase 3 dedupes into shared shell components first |
| GSAP + React 19 StrictMode double-invoke | All effects via `gsap.context()` + revert cleanup (pattern already proven in repo) |
| Session boundaries mid-phase | Phases are self-contained; PRD + §11 let a fresh session resume; commits should reference phase number |
| Model licensing | Only CC0/CC-BY or owner-provided; log in `docs/ASSETS.md` before integration |

---

## 14. Skills & disciplines used in this project

- **Design systems** — token architecture, type scales, dark-theme contrast budget
- **GSAP / ScrollTrigger choreography** — timelines, pinning, scrub storytelling, reduced-motion discipline
- **Tailwind 4** — `@theme`/CSS-variable tokens, utility conventions, `color-mix()` accent arithmetic
- **React 19** — refs + `gsap.context` cleanup, lazy/Suspense chunking, hook design (`useTilt`, `usePressFeedback`, `useCountUp`)
- **Three.js / React Three Fiber** — procedural geometry, dpr caps, frameloop control, WebGL detection + fallbacks
- **Asset pipeline** — gltf-transform optimization, texture compression, payload budgeting
- **Accessibility for motion** — `prefers-reduced-motion` parity, focus rings, keyboard operability
- **PRD & documentation** — this artifact; cross-session handoff discipline

---

*End of PRD v2.1 — all phases implemented. New scope requires a PRD edit per §0.*
