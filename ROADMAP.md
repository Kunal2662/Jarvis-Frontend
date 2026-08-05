# Project JARVIS — Roadmap

JARVIS is an **AI Operating Companion** — a complete AI Operating System, not a chatbot.

> **Architecture note (2026-08-06):** JARVIS has adopted a **single workspace architecture**.
> No sidebars, no drawers, no dock — one adaptive workspace with a flat top bar, widgets that expand
> in place, and all technical concepts hidden behind Developer Mode.
> **All future UI work follows [`docs/architecture/`](./docs/architecture/).** Start with
> [UI-ARCHITECTURE.md](./docs/architecture/UI-ARCHITECTURE.md).

---

## ✅ Phase 1 — Master Design Specification (complete)
- 40-section design system spec + machine-readable `design-tokens.json`.
- Location: `docs/jarvis-design-system/`.

## ✅ Phase 2 — UI Foundation & Liquid Glass (complete)
- Vite + React + TypeScript migration, Tailwind + CSS-variable token pipeline.
- Theme engine (dark/light/system, density, contrast, adaptive glass).
- Liquid Glass foundation (adaptive blur + solid fallback).
- Core UI library (48 component modules across primitives / composites / data / patterns / layouts).
- Window shell components (Sidebar, TopBar, StatusBar, CommandPalette, SearchOverlay,
  NotificationCenter, Dock, WindowFrame, WorkspaceContainer, QuickSettings, VoiceOrb, AppShell).
- Design System Showcase route; lint/typecheck/build green.

## ✅ Phase 3 — Application Shell & Navigation (complete — **superseded by Phase 7-A**)
- React Router + persistent app shell.
- Module registry driving routes, sidebar and command palette from one source.
- Global command/search state, keyboard-shortcut manager, theme persistence.
- ⚠️ Built around a left sidebar. **The single-workspace refactor replaces this composition.**

## ✅ Phase 4 — Home / Command Center (complete, mocked data)
- Dashboard with hero orb, ask bar, suggestion chips, vitals stat cards, activity timeline, widgets.
- All data is hardcoded mock data pending real APIs.

## ✅ Phase 5 — AI Chat (complete — streaming MVP)
- SSE token streaming, markdown + code rendering, auto-growing composer, abort, retry, copy, clear.
- `localStorage` persistence (100 messages).
- Pending: tools, citations, memory, attachments.

## 🟡 Phase 6 — Voice Assistant (in progress)
- **Done:** full-screen overlay, Web Speech STT, live transcript, voice history, chat handoff, VoiceOrb.
- **Remaining:** wake word, text-to-speech, barge-in, intent chips, server-side STT fallback.

---

## 🔜 Phase 7 — Single Workspace Architecture (**next — architecture refactor**)

Replaces the sidebar shell with the single-workspace model. **Composition change only** — no design
tokens, no backend, no deleted components. Full path: [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md).

### Phase 7-A — Shell & navigation
- [ ] Rewrite the module registry with `surface` / `audience` (10 user-facing items, capped)
- [ ] Registry invariant test (≤10 items, audience rule, forbidden-vocabulary ban) — **the drift guard**
- [ ] Permanent redirects for every v1 route
- [ ] `AppShell`: `sidebar` prop → optional + deprecated
- [ ] New `TopNav`; `TopBar` becomes the only navigation surface
- [ ] Rewrite `AppLayout` — remove Sidebar, Dock, Breadcrumb from the composition
- [ ] `NotificationCenter`: Drawer → Popover
- [ ] `WorkspaceContainer`: remove `rightPanel`
- [ ] Add the missing **Notes** surface (fixes the existing dead `/notes` link)

### Phase 7-B — Widget system
- [ ] Promote the `Widget` shell into `design-system/widgets/` with `peek` / `open` / `focused`
- [ ] `WidgetGrid` + `useWidgetState` + layout persistence
- [ ] Core widgets: Recent Chats, Notes, Tasks, Calendar, AI Suggestions
- [ ] Remaining widgets: Files, Automations, AI Apps, System Status
- [ ] Conversation placement — the same widget renders inline in a thread
- [ ] Convert Home to conversation + `WidgetGrid`

### Phase 7-C — Settings & Developer Mode
- [ ] Real sectioned `/settings`: General · Jarvis · Connections · Advanced · About
- [ ] User-facing counterparts: *Things Jarvis remembers*, *Response style*, *Connections*, *Activity*
- [ ] `useDeveloperMode` + `DeveloperShell` (the one sanctioned use of `Sidebar`)
- [ ] Move Memory, Knowledge, Diagnostics, Performance, Design System behind Developer Mode
- [ ] Developer-Mode gating in the command palette; lazy-load the whole developer chunk

### Phase 7-D — Startup animation ⬜ **REQUIRED MILESTONE**
- [ ] Cinematic boot sequence — 10 beats, 2–4s, non-blocking, 60 FPS
- [ ] Reduced-motion variant honouring the OS setting
- [ ] Optional audio, silent by default
- [ ] Seamless handoff into the Home workspace

> **The frontend is NOT feature-complete until the startup animation ships.**
> Full spec and definition of done: [STARTUP-ANIMATION.md](./docs/architecture/STARTUP-ANIMATION.md).
> This item stays on the roadmap until implemented **and tested**.

---

## Phase 8 — Data & Identity Foundation
- Decouple the backend from `emergentintegrations` (direct provider SDK) — portability unblock.
- MongoDB via `motor`; authentication (JWT); real user model replacing the hardcoded "Tony Stark".
- Server-side chat persistence; API client layer (`src/lib/api/`) + TanStack Query.
- Replace mock data: dashboard vitals, notifications, activity.

## Phase 9 — Memory & Knowledge
- Vector store, embeddings, semantic recall behind the **"Things Jarvis remembers"** feature.
- Knowledge graph and raw inspection tools — **Developer Mode only**.
- Universal search behind `⌘K`.

## Phase 10 — Productivity Surfaces
- Notes, Tasks, Calendar, Files as real widgets and focused surfaces.
- Projects as a grouping *inside* those surfaces — not a navigation destination.

## Phase 11 — AI Apps & Integrations
- Google Workspace, Microsoft 365, Email — surfaced as **Settings → Connections**.
- Plugin system and MCP — user-facing as **AI Apps**, raw registries in Developer Mode.

## Phase 12 — Agents & Automations
- Agent runtime, tool calling, automation engine, multi-step execution.
- Surfaced as **AI Apps** and **Automations**; tool registry stays in Developer Mode.

## Phase 13 — Multimodal
- Text-to-speech, wake word, vision, OCR, screen understanding, chat attachments.

## Phase 14 — Desktop Application
- Electron/Tauri shell (`WindowFrame` and `Dock` find their real home here).
- Functional window controls, system tray, OS automation, local LLM support.

## Phase 15 — Hardening
- Test coverage, E2E (Playwright — `data-testid`s already in place), CI/CD.
- Route-level code splitting, performance budgets, i18n, telemetry, security review.

## Final Release — v1.0
- Installer, packaging, code signing, auto-update, mobile companion, production deployment.

---

## Cross-cutting (ongoing)
- Architecture conformance: no sidebars, no drawers, ≤10 nav items, no technical vocabulary in the
  primary UX. Enforced by the registry invariant test.
- Component tests + Storybook coverage (currently 3 stories / 48 components).
- Accessibility: WCAG AA, keyboard operability, reduced motion.
- Keep `README.md`, this file, `CHANGELOG.md` and `memory/PRD.md` in sync with reality.
