# Project JARVIS — PRD

**Last updated:** 2026-08-06

## Vision
JARVIS is an **AI Operating Companion** — a complete AI Operating System (not a chatbot). Futuristic
yet professional; a fusion of Iron Man JARVIS, iOS 26 Liquid Glass, visionOS, Windows 11 Fluent, Arc,
Linear, Notion, Raycast.

## Product principle — the abstraction rule

> **Users interact with features. Developers interact with infrastructure.**

A user should never need to know what a vector database is, what an embedding is, what a knowledge
graph is, how memory is stored, or how prompts are managed. JARVIS simply works.

```
User:    "Remember my passport expires next year."
Jarvis:  "Done. I'll remember that."
```

Every technical system is real, and every technical system is hidden behind **Developer Mode**, which
is off and invisible by default.

## Source of truth
- **Architecture / navigation / layout:** `docs/architecture/` — start with `UI-ARCHITECTURE.md`
- **Visual language / tokens:** `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md` + `design-tokens.json`
- **Overall project state:** the root `README.md`

## Architecture (current)
- **Frontend:** Vite 6 + React 18 + TypeScript 5.6, Tailwind mapped to semantic CSS variables, Radix
  UI, cmdk, Framer Motion, lucide-react. 48-component design system.
- **Backend:** minimal FastAPI — `GET /api/health`, `POST /api/chat/stream` (SSE). Stateless; no
  database, no auth yet.
- **Memory:** `localStorage` store modules only (chat, voice, theme). No vector store yet.
- **Shell:** currently the v1 sidebar layout. **Being replaced** by the single workspace architecture
  (Phase 7).

## UI architecture — v2 (adopted 2026-08-06)

```
Top Bar  →  Adaptive Workspace  →  Status Bar
```

- No sidebars, no drawers, no dock, no hidden navigation panels.
- Flat top bar, **10 user-facing surfaces maximum**: Home · Chat · Voice · Notes · Calendar · Tasks ·
  Files · AI Apps · Automations · Settings.
- The conversation is the primary surface and is never more than one interaction away.
- Widgets expand **in place**; the same widget renders inline in a conversation.
- Named for outcomes, never for systems (`Notes`, not `Document Store`).

See `docs/architecture/adr/0001-single-workspace-architecture.md` for the rationale.

## Status

### ✅ Phase 1 — Master Design Specification
40-section spec + machine-readable tokens.

### ✅ Phase 2 — UI Foundation & Liquid Glass
Token pipeline, theme engine (dark/light/system, density, contrast, adaptive glass), Liquid Glass
foundation, 48-component library, motion system, WCAG AA baseline.

### ✅ Phase 3 — Application Shell & Navigation *(superseded by Phase 7-A)*
Router, persistent shell, module registry, command palette, hotkey manager. Built around a sidebar —
the composition is being replaced.

### ✅ Phase 4 — Home / Command Center
Hero orb, ask bar, vitals, activity timeline, widgets. **All data is mocked.**

### ✅ Phase 5 — AI Chat
SSE streaming, markdown, composer, abort/retry, `localStorage` persistence.

### 🟡 Phase 6 — Voice Assistant
Overlay + Web Speech STT + transcript + chat handoff done. Wake word, TTS, barge-in, intent chips
pending.

### 🔜 Phase 7 — Single Workspace Architecture *(next)*
7-A shell & navigation · 7-B widget system · 7-C Settings & Developer Mode · 7-D **startup animation**.

> **The frontend is not feature-complete until the startup animation ships.**
> Spec: `docs/architecture/STARTUP-ANIMATION.md`.

## Personas
- **Everyday user** — the default and the one the interface is designed for. Notes, tasks, calendar,
  files, conversation. Never sees infrastructure.
- **Operator (Tony)** — power user; keyboard-first, lives in `⌘K` and voice. Uses Settings → Advanced.
- **Builder** — extends JARVIS via AI Apps, plugins, MCP and agents. The only persona who enables
  Developer Mode.

## Backlog (prioritized)
- **P0 Phase 7:** single workspace refactor — registry, top-bar shell, widgets, Settings + Developer
  Mode, startup animation.
- **P1 Phase 8:** data & identity — decouple from `emergentintegrations`, MongoDB, auth, real user,
  server-side chat persistence, API layer, replace mock data.
- **P1 Phase 9:** memory & knowledge — vector store and recall behind *"Things Jarvis remembers"*;
  raw tools in Developer Mode.
- **P2 Phase 10:** Notes, Tasks, Calendar, Files as real widgets and surfaces.
- **P2 Phase 11–12:** AI Apps, integrations, agents, automations.
- **P3 Phase 13–15:** multimodal, desktop packaging, hardening.

## Known gaps
- All dashboard data is mocked; the user is hardcoded as "Tony Stark"; there is no auth.
- Backend has two endpoints and no database.
- `emergentintegrations` is not on public PyPI — the backend will not install outside Emergent.
- Voice is STT-only, Chrome/Edge only.
- Test coverage is near zero (1 smoke suite); 3 of 48 components have stories.
- Startup animation not implemented.
