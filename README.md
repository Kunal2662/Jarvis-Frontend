# JARVIS — AI Operating Companion

> **⚠️ THIS PROJECT IS STILL UNDER ACTIVE DEVELOPMENT.**
> **This repository is a development checkpoint, NOT the final version.**
> Roughly **one third** of the planned system is built. The design system, application shell,
> Command Center, AI Chat and Voice overlay are real and working. **Eighteen feature modules are
> intentional placeholders.** Read [Current Project Status](#current-project-status) before
> assuming anything is missing by accident.

> ## 🏛️ ARCHITECTURE CHANGE — read this before writing any UI code
>
> **As of 2026-08-06, JARVIS follows a [single workspace architecture](./docs/architecture/UI-ARCHITECTURE.md).**
> The sidebar-based shell currently running in `src/app/` is **superseded** and is being replaced.
>
> ```
> Top Bar  →  Adaptive Workspace  →  Status Bar
> ```
>
> - **No sidebars. No drawers. No dock. No hidden nav panels.**
> - **Ten user-facing surfaces, maximum** — named for outcomes, not systems.
> - **The conversation is the primary surface**, never more than one interaction away.
> - **Widgets expand in place**; the same widget also renders inline in a chat thread.
> - **Every technical concept** (memory internals, knowledge graph, vector store, embeddings, prompts,
>   MCP, tool registry, providers, API keys, logs, diagnostics) lives behind **Developer Mode** —
>   off and invisible by default.
>
> **No application code has changed yet.** The refactor is fully specified in
> **[`docs/architecture/`](./docs/architecture/)** — read [that index](./docs/architecture/README.md)
> first, then [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md) for the staged execution path.

This README is the **single source of truth** for the project. It is written so that a human or an
AI agent can pick the project up cold and continue development **without re-reading the whole
codebase**. If you are an AI assistant, read [AI Handover Notes](#ai-handover-notes) and
[Development Rules](#development-rules) before writing a single line.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Project Status](#current-project-status)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Tech Stack](#tech-stack)
6. [Completed Features](#completed-features)
7. [Pending Features](#pending-features)
8. [Future Roadmap](#future-roadmap)
9. [AI Handover Notes](#ai-handover-notes)
10. [Development Rules](#development-rules)
11. [Setup Instructions](#setup-instructions)
12. [Git Information](#git-information)

---

## Project Overview

### What JARVIS is

JARVIS is an **AI Operating Companion** — an AI *operating system*, not a chatbot with a sidebar.
The product goal is a single surface where a user runs their whole digital life: conversation,
voice, memory, knowledge, projects, tasks, calendar, files, browser automation, integrations and
autonomous agents — all sharing one design language, one command layer and one memory.

The interface is deliberately cinematic but professional: a fusion of Iron Man's JARVIS,
iOS 26 "Liquid Glass", visionOS depth, Windows 11 Fluent materials, and the information density of
Arc / Linear / Notion / Raycast.

### Vision

- **One shell, many modules.** Every capability is a module mounted into the same `AppShell`.
  Modules never invent their own chrome.
- **Keyboard-first and voice-first.** `⌘K` command palette and `⌘J` voice session reach anything.
- **AI presence is a first-class design signal.** The cyan "AI aura" and the `VoiceOrb` exist to
  show that an intelligence is present, thinking, or listening.
- **Design tokens are law.** Every colour, radius, blur, motion curve and z-index resolves to a CSS
  variable generated from `design-tokens.json`. No hardcoded values anywhere in components.
- **Eventually a desktop OS layer** — packaged as a native app with real window management,
  system-level automation, and local model support.

### Current development phase

| | |
|---|---|
| **Phase 1 — Master Design Specification** | ✅ Complete |
| **Phase 2 — UI Foundation & Liquid Glass** | ✅ Complete |
| **Phase 3 — Application Shell & Navigation** | ✅ Complete |
| **Phase 4 — Home / Command Center** | ✅ Complete |
| **Phase 5 — AI Chat** | ✅ Complete (streaming MVP) |
| **Phase 6 — Voice Assistant** | 🟡 **In progress** — overlay + STT done, wake word / TTS pending |
| **Phase 7 — Single Workspace Architecture** | 📐 **Specified, not implemented** — 7-A shell · 7-B widgets · 7-C Developer Mode · 7-D **startup animation** |
| **Phase 8+ — Data, Memory, Feature Modules** | ⬜ Not started (18 placeholder routes exist) |

> **Phase 7 is an architecture refactor and is the next work.** It replaces the sidebar shell with the
> single workspace model. It is a **composition change** — no design tokens change, no backend changes,
> and **no components are deleted**. See [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md).

> Note: `ROADMAP.md`, `CHANGELOG.md` and `memory/PRD.md` were stale (Phase-2 era) and were
> **refreshed on 2026-08-06** alongside the architecture change. They are now consistent with this
> file. If they ever disagree again, this README wins and the others should be corrected.

### Long-term roadmap (summary)

Web app → integrated AI workspace → plugin/MCP platform → autonomous agent runtime →
packaged desktop application with local LLM support and mobile companion.
Full milestone breakdown in [Future Roadmap](#future-roadmap).

---

## Current Project Status

### What is genuinely complete and working

| Area | State | Where |
|---|---|---|
| Design token pipeline (dark / light / high-contrast / density) | ✅ Working | `frontend/src/styles/tokens.css` |
| Theme engine + persistence + adaptive glass detection | ✅ Working | `frontend/src/design-system/theme/ThemeProvider.tsx` |
| Liquid Glass foundation with solid fallback | ✅ Working | `frontend/src/index.css` (`.glass` layer) |
| Core UI library — **48 component modules** | ✅ Working | `frontend/src/design-system/` |
| Window shell (Sidebar, TopBar, StatusBar, Dock, palettes, overlays) | ✅ Working | `frontend/src/design-system/patterns/` |
| Router + persistent app shell + module registry | ✅ Working | `frontend/src/App.tsx`, `src/app/` |
| Home "Command Center" page | ✅ Working | `frontend/src/pages/Home.tsx` |
| AI Chat with SSE token streaming + markdown | ✅ Working | `frontend/src/features/chat/` |
| Voice overlay with live transcript (Web Speech API) | ✅ Working | `frontend/src/features/voice/` |
| Backend chat streaming endpoint | ✅ Working | `backend/server.py` |
| Storybook (3 stories) + Vitest smoke suite (5 tests) | 🟡 Scaffolded only | `frontend/.storybook/`, `src/design-system/__tests__/` |

### What is deliberately NOT built yet

**18 sidebar modules render a shared `ModulePlaceholder` "coming soon" screen.** They are wired into
the router and the command palette but have **no implementation**:

`Memory` · `Knowledge` · `Agents` · `Automation` · `Projects` · `Tasks` · `Calendar` · `Files` ·
`Browser` · `Google Workspace` · `Microsoft 365` · `Plugins` · `Diagnostics` · `Performance` ·
`Settings`

Plus, not yet present at all: authentication, database persistence, real notification backend,
email module, vision/OCR, mobile companion, installer/packaging.

**Do not delete these placeholder routes.** They are the module registry contract that future
phases fill in.

### Known gaps and rough edges (read before you "fix" them)

1. **All Home / dashboard data is hardcoded mock data.** `Active agents: 12`, `Memory items: 1.2k`,
   the notification list in `AppLayout.tsx`, the activity timeline — all placeholders awaiting
   real APIs. This is intentional, not a bug.
2. **Chat history lives in `localStorage` only** (`jarvis.chat.messages`, capped at 100 messages).
   There is no server-side persistence and no database. `motor`/`pymongo` are in
   `backend/requirements.txt` but **MongoDB is not wired up**.
3. **The backend has exactly two endpoints**: `GET /api/health` and `POST /api/chat/stream`.
4. **Conversation history is re-sent by the client on every turn** and flattened into the system
   prompt server-side. There is no server-held session state despite the `session_id` field.
5. **Voice is speech-to-text only.** No wake word, no text-to-speech, no barge-in. It depends on the
   browser `webkitSpeechRecognition` API, so it works in Chrome/Edge and fails gracefully elsewhere.
6. **The user is hardcoded as "Tony Stark" / "TS"** across `AppLayout.tsx` and `Home.tsx`. There is
   no auth and no user model.
7. **The running shell is the v1 sidebar layout**, which the adopted architecture supersedes. Code
   and architecture docs will disagree until Phase 7 lands — **the docs are the target**, the code is
   the current state. `ROADMAP.md`, `CHANGELOG.md` and `memory/PRD.md` were refreshed 2026-08-06 and
   are current.
8. **The backend depends on `emergentintegrations`**, a platform-specific package that is **not on
   PyPI**. See [Setup Instructions](#setup-instructions) for how to run without it.
9. **`.emergent/` contains Emergent platform cron scaffolding**, not application code. It is
   preserved for platform compatibility and can be ignored during development.

### Completion estimate

**≈ 32% of the planned system.**

| Layer | Done |
|---|---|
| Design system & UI foundation | ~95% |
| Application shell & navigation | ~90% |
| Home / Command Center | ~70% (UI done, data mocked) |
| AI Chat | ~55% (streaming done; no tools, citations, memory, attachments) |
| Voice | ~40% (STT + overlay; no wake word, TTS, intents) |
| Backend / API | ~10% (2 endpoints, no DB, no auth) |
| Feature modules (18) | ~0% |
| Testing / CI / packaging | ~5% |

---

## Architecture

JARVIS is a **two-tier web application** today, designed so a desktop shell can wrap it later
without rewriting anything.

### Target architecture (v2 — single workspace)

**This is what you should build toward.** Full specification in
[`docs/architecture/`](./docs/architecture/).

```
┌───────────────────────────────────────────────────────────────────────┐
│  TOP BAR — the ONLY navigation surface                                │
│  ◆ Jarvis   Home  Chat  Voice  Notes  Calendar  Tasks  Files          │
│                    AI Apps  Automations              ⌘K   ◐  ⚙  (TS)  │
├───────────────────────────────────────────────────────────────────────┤
│                       ADAPTIVE WORKSPACE                              │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │       CONVERSATION / PRIMARY SURFACE (always present)       │    │
│   └─────────────────────────────────────────────────────────────┘    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐   ← widgets expand IN PLACE │
│   │  Widget  │ │  Widget  │ │  Widget  │     (peek → open → focused) │
│   └──────────┘ └──────────┘ └──────────┘                             │
├───────────────────────────────────────────────────────────────────────┤
│  STATUS BAR                                                           │
└───────────────────────────────────────────────────────────────────────┘

        Everything technical  →  Settings → Developer Mode (hidden by default)
```

### Current architecture (v1 — sidebar shell, superseded)

This is what the code does **today**. It still runs; it is being replaced in Phase 7.

```
┌──────────────────────────────────────────────────────────────────────┐
│  BROWSER (future: Electron/Tauri window)                             │
│                                                                      │
│  main.tsx                                                            │
│    └─ ThemeProvider → TooltipProvider → ToastProvider → BrowserRouter│
│         └─ App.tsx  (route table, generated from module registry)    │
│              └─ AppLayout  (the persistent shell — never unmounts)   │
│                   ├─ Sidebar (grouped module nav)                    │
│                   ├─ TopBar (greeting / breadcrumb / status / actions)│
│                   ├─ StatusBar                                       │
│                   ├─ Overlays: CommandPalette ⌘K, NotificationCenter,│
│                   │            VoiceOverlay ⌘J, Dock, VoiceOrb       │
│                   └─ <Outlet/>  ← the active module page             │
│                        ├─ Home            (built)                    │
│                        ├─ ChatPage        (built)                    │
│                        ├─ DesignShowcase  (built)                    │
│                        └─ ModulePlaceholder × 18  (stubs)            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  fetch + SSE  (POST /api/chat/stream)
┌───────────────────────────────▼──────────────────────────────────────┐
│  FastAPI  (backend/server.py)                                        │
│    GET  /api/health          → liveness                              │
│    POST /api/chat/stream     → SSE: meta → data(delta)* → done|error │
│         └─ emergentintegrations.LlmChat → Anthropic claude-sonnet-4-6│
└──────────────────────────────────────────────────────────────────────┘
```

### Frontend

**Vite 6 + React 18 + TypeScript 5.6**, strict mode. Three-layer separation, and this separation is
the most important architectural rule in the project:

| Layer | Path | Rule |
|---|---|---|
| **Design system** | `src/design-system/` | Generic, product-agnostic, **zero business logic**. Exported through one barrel: `src/design-system/index.ts`. |
| **Features** | `src/features/<domain>/` | Domain logic + domain-specific components. May import the design system. Must not be imported *by* it. |
| **Pages / App** | `src/pages/`, `src/app/` | Route entry points and shell composition. Thin — they compose, they don't implement. |

The design system itself is tiered: `primitives` (atoms) → `composites` (molecules) →
`data` (tables/lists) → **`widgets`** → `patterns` (shell organisms) → `layouts` (AppShell).
**Lower tiers never import higher tiers.**

> **`widgets/` is new in v2 and does not exist yet.** It sits between `data` and `patterns`: widgets
> compose composites and data components, and are composed by the workspace. A widget has three
> states (`peek` / `open` / `focused`), expands in place, and renders both in the workspace grid and
> inline in a conversation. Contract: [WIDGET-SYSTEM.md](./docs/architecture/WIDGET-SYSTEM.md).
> The prototype already exists as a local helper in `features/home/HomeWidgets.tsx` — **promote it,
> don't rewrite it.**

### Backend

A deliberately minimal **FastAPI** service (`backend/server.py`, ~87 lines). It exists to keep the
LLM API key off the client and to stream tokens. It is stateless: no database, no sessions, no auth.
Everything about it is meant to be replaced/expanded — treat it as scaffolding, not a finished API.

Streaming uses **Server-Sent Events** with a small custom protocol:

```
event: meta   data: {"session_id": "..."}     ← once, first
              data: {"delta": "token text"}   ← repeated
event: error  data: {"error": "..."}          ← on failure
event: done   data: {}                        ← always last
```

The client parser lives in `frontend/src/lib/chatClient.ts`. **If you change one side, change both.**

### Memory System

**Current implementation is `localStorage`.** There is no vector store, no embeddings, no server
memory. Three namespaced keys, each behind a tiny module — never touch `localStorage` directly:

| Key | Module | Contents |
|---|---|---|
| `jarvis.chat.messages` | `src/features/chat/chatStore.ts` | Last 100 chat messages |
| `jarvis.voice.history` | `src/features/voice/voiceHistory.ts` | Last 20 voice transcripts, deduped |
| `jarvis.theme` | `src/design-system/theme/ThemeProvider.tsx` | theme / density / contrast / glass |

The `memory/` directory at the repo root is **product documentation** (`PRD.md`), not runtime memory.
The `/memory` route is a placeholder for the real memory module (planned: vector store + knowledge
graph + recall UI).

**Design intent for the real memory system:** these store modules are the seam. Replacing
`localStorage` with an API-backed store should require changing only `chatStore.ts` and
`voiceHistory.ts`, because no component reads storage directly.

### Voice Module

Three files, cleanly layered:

1. `src/lib/useSpeechRecognition.ts` — a **framework-agnostic hook** wrapping the browser
   `SpeechRecognition` / `webkitSpeechRecognition` API. Hand-written minimal typings (these APIs are
   not in TypeScript's DOM lib). Returns `{supported, listening, transcript, interim, error, start,
   stop, reset}`. Continuous mode with interim results.
2. `src/features/voice/VoiceOverlay.tsx` — full-screen Radix Dialog. Auto-starts listening 300ms
   after open, renders the live transcript (final text solid, interim text dimmed), shows recent
   history, and hands the final transcript to `/chat` via router state.
3. `src/design-system/patterns/VoiceOrb/VoiceOrb.tsx` — the pure visual orb. Six states:
   `idle | listening | thinking | speaking | processing | offline`. It is presentational only and is
   reused in three places (overlay, chat avatar, floating shell button).

**Voice → Chat handoff pattern:** `navigate('/chat', { state: { prompt: text } })`. `ChatPage`
consumes it once via a `consumedPrompt` ref and clears history state. The command palette's
"Ask Jarvis" uses the identical pattern. **Reuse this pattern for any new "send text to chat" entry
point.**

### AI Chat

`src/features/chat/` — three files:

- `ChatPage.tsx` — thread rendering, auto-growing composer (`⌘↵` to send), streaming with
  `AbortController` stop, retry-last-turn, copy, clear, empty-state suggestion chips.
- `chatStore.ts` — `localStorage` persistence.
- `Markdown.tsx` — `react-markdown` + `remark-gfm` rendering for assistant messages.

Chat state is **local component state** (`useState` in `ChatPage`), not a global store. This is
intentional at current scale — see [State management](#state-management).

### API Layer

There is **no API client abstraction yet** — one function, `streamChat()`, in
`src/lib/chatClient.ts`. The backend base URL comes from `import.meta.env.VITE_BACKEND_URL` with a
legacy `REACT_APP_BACKEND_URL` fallback (CRA-migration leftover) and an empty-string default
(same-origin).

**When you add the second endpoint, create `src/lib/api/` and put a shared fetch wrapper there** —
base URL resolution, error normalisation, and auth headers belong in one place. Do not scatter
`fetch()` calls through feature code.

### Design System

Documented in full in `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md` (**422 lines, 40
sections**) with machine-readable tokens in `design-tokens.json` (18 top-level groups: `color`,
`typography`, `spacing`, `radius`, `elevation`, `shadow`, `blur`, `opacity`, `border`, `motion`,
`zIndex`, `breakpoints`, `grid`, `layout`, `size`, `iconography`, …).

Pipeline: `design-tokens.json` → `src/styles/tokens.css` (CSS variables) → `tailwind.config.js`
(semantic Tailwind class names) → components use only class names like `bg-surface-base`,
`text-content`, `border-line`, `text-ai-aura`.

Theme switching works by setting attributes on `<html>`: `data-theme`, `data-density`,
`data-contrast`, `data-glass`. CSS variables re-resolve; **no component re-renders for theming.**

The `/design` route renders every component in every state — use it to verify visual changes.

### Future Desktop Integration

The app is architected for a native shell but **is not packaged yet**:

- `WindowFrame` pattern component exists for custom title bars.
- `AppLayout` already renders minimize / maximize / close buttons (**currently non-functional** —
  they are visual only, awaiting an Electron/Tauri IPC bridge).
- `Dock` pattern is built for an OS-like bottom dock.
- All state persists to `localStorage`, which survives a webview wrapper unchanged.

**Planned approach:** wrap the built Vite output in Electron or Tauri, replace the window-control
buttons' no-op handlers with IPC calls, and bundle the FastAPI backend as a sidecar process.

---

## Folder Structure

```
Jarvis-Frontend/
├── README.md                       ← you are here (source of truth)
├── ROADMAP.md                      ← ⚠️ stale (Phase-2 era)
├── CHANGELOG.md                    ← ⚠️ stale (Phase-2 era)
├── .gitignore
│
├── .emergent/                      ← Emergent platform scaffolding (NOT app code)
│   ├── emergent.yml
│   ├── system_deps.txt
│   └── cron/                       ← pod-local webhook cron dispatcher
│
├── memory/
│   └── PRD.md                      ← product requirements (⚠️ stale)
│
├── docs/
│   ├── architecture/               ← ★ THE ARCHITECTURE AUTHORITY (read first)
│   │   ├── README.md               ← index + one-minute summary
│   │   ├── UI-ARCHITECTURE.md      ← single workspace philosophy & layout
│   │   ├── NAVIGATION.md           ← taxonomy, v1→v2 map, new module registry
│   │   ├── WIDGET-SYSTEM.md        ← widget contract & states
│   │   ├── DEVELOPER-MODE.md       ← what gets hidden, and how
│   │   ├── COMPONENT-PLAN.md       ← disposition of all 48 components
│   │   ├── MIGRATION-PLAN.md       ← staged execution path
│   │   ├── STARTUP-ANIMATION.md    ← ⬜ pending required milestone
│   │   └── adr/0001-single-workspace-architecture.md
│   └── jarvis-design-system/
│       ├── JARVIS-DESIGN-SYSTEM.md ← 40-section spec (VISUAL language authority)
│       └── design-tokens.json      ← machine-readable tokens
│
├── backend/
│   ├── server.py                   ← FastAPI: /api/health, /api/chat/stream
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── package.json
    ├── vite.config.ts              ← port 3000, @ alias, manual chunks
    ├── vitest.config.ts
    ├── tailwind.config.js          ← maps Tailwind → CSS variables
    ├── postcss.config.js
    ├── eslint.config.js            ← ESLint 9 flat config
    ├── tsconfig{,.app,.node}.json
    ├── index.html
    ├── .env.example
    ├── .storybook/
    │   ├── main.ts
    │   └── preview.tsx
    └── src/
        ├── main.tsx                ← provider tree + router mount
        ├── App.tsx                 ← route table (generated from module registry)
        ├── index.css               ← Tailwind layers + .glass foundation
        ├── vite-env.d.ts
        │
        ├── styles/
        │   └── tokens.css          ← ALL semantic CSS variables
        │
        ├── app/
        │   ├── AppLayout.tsx       ← the persistent shell
        │   └── modules.tsx         ← ★ MODULE REGISTRY — add new modules HERE
        │
        ├── pages/
        │   ├── Home.tsx            ← Command Center
        │   ├── DesignShowcase.tsx  ← every component, every state
        │   └── ModulePlaceholder.tsx ← shared "coming soon" screen
        │
        ├── features/
        │   ├── chat/     ChatPage.tsx · chatStore.ts · Markdown.tsx
        │   ├── home/     HeroOrb.tsx · ActivityTimeline.tsx · HomeWidgets.tsx · Waveform.tsx
        │   ├── voice/    VoiceOverlay.tsx · voiceHistory.ts
        │   ├── startup/  ⬜ v2 — StartupSequence, EnergyWave, ParticleField (NOT BUILT)
        │   └── developer/⬜ v2 — DeveloperShell, useDeveloperMode (NOT BUILT)
        │
        ├── lib/
        │   ├── chatClient.ts       ← SSE streaming client
        │   └── useSpeechRecognition.ts
        │
        ├── showcase/
        │   └── sections.tsx
        │
        ├── test/
        │   └── setup.ts
        │
        └── design-system/          ← ★ 48 component modules
            ├── index.ts            ← ★ PUBLIC BARREL — always import from here
            ├── lib/cn.ts           ← clsx + tailwind-merge
            ├── foundations/motion.ts
            ├── theme/ThemeProvider.tsx
            ├── hooks/              useMediaQuery · useReducedMotion · useHotkey
            ├── primitives/         24 atoms
            ├── composites/         8 molecules
            ├── data/               Table · DataGrid · List · TreeView
            ├── widgets/            ⬜ v2 — Widget · WidgetGrid · useWidgetState (NOT BUILT)
            ├── patterns/           11 shell organisms (5 demoted in v2)
            ├── layouts/AppShell/
            └── __tests__/smoke.test.tsx
```

---

## Tech Stack

### Frontend — runtime

| Technology | Version | Role |
|---|---|---|
| **React** | 18.3 | UI library |
| **TypeScript** | 5.6 | Types, strict mode |
| **Vite** | 6.0 | Build tool + dev server |
| **React Router DOM** | 6 | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility styling, mapped to CSS variables |
| **Radix UI** | 1.x / 2.x | Accessible headless primitives (15 packages: dialog, dropdown-menu, popover, select, tooltip, tabs, switch, checkbox, radio-group, avatar, label, progress, scroll-area, separator, slot) |
| **Framer Motion** | 11.15 | Spring/ambient animation |
| **lucide-react** | 0.468 | Icon set (the ONLY icon source) |
| **cmdk** | 1.0 | Command palette engine |
| **react-markdown** + **remark-gfm** | 9 / 4 | Assistant message rendering |
| **class-variance-authority** | 0.7 | Component variant definitions |
| **clsx** + **tailwind-merge** | 2.1 / 2.6 | Class composition (via `cn()`) |

### Frontend — tooling

| Technology | Version | Role |
|---|---|---|
| **Storybook** | 8 | Component workshop (`@storybook/react-vite`) |
| **@storybook/addon-a11y** | 8 | Accessibility checks |
| **Vitest** | 2 | Unit test runner |
| **@testing-library/react** | 16 | Component testing |
| **@testing-library/jest-dom** | 6.6.3 | DOM matchers |
| **@testing-library/user-event** | 14 | Interaction simulation |
| **jsdom** | 25 | Test DOM environment |
| **ESLint** | 9 (flat config) | Linting |
| **typescript-eslint** | 8.19 | TS lint rules |
| **eslint-plugin-react-hooks** | 5.1 | Hook rules |
| **PostCSS** + **Autoprefixer** | 8.4 / 10.4 | CSS pipeline |
| **Yarn** | — | Package manager (`yarn.lock` is committed; **do not switch to npm**) |

### Backend

| Technology | Version | Role |
|---|---|---|
| **Python** | 3.11 | Runtime |
| **FastAPI** | 0.110.1 | Web framework |
| **Uvicorn** | 0.25.0 | ASGI server |
| **Pydantic** | 2.13 | Request/response models |
| **Starlette** | 0.37.2 | SSE `StreamingResponse` |
| **python-dotenv** | 1.2.2 | Env loading |
| **emergentintegrations** | 0.2.0 | LLM gateway — ⚠️ **not on public PyPI** |

**Present in `requirements.txt` but NOT yet used in code** (pre-installed for future phases):
`motor` / `pymongo` (MongoDB), `passlib` / `bcrypt` / `python-jose` / `PyJWT` (auth),
`openai`, `google-generativeai` / `google-genai`, `litellm`, `boto3`, `stripe`,
`google-api-python-client` (Workspace), `pandas` / `numpy`, `pillow`,
`pytest` / `pytest-xdist`, `black` / `flake8` / `isort` / `mypy`.

### Platform

- **Emergent** — the workspace this project was scaffolded in (`.emergent/`). Dev server is
  supervised on `0.0.0.0:3000` behind an HTTPS proxy (hence the `hmr: { clientPort: 443,
  protocol: 'wss' }` block in `vite.config.ts`).

---

## Completed Features

### Design & Foundation
- ✅ **Master Design Specification** — 40 sections, 422 lines (`docs/jarvis-design-system/`)
- ✅ **Design Tokens** — machine-readable `design-tokens.json`, 18 token groups
- ✅ **Semantic CSS variable pipeline** — `tokens.css` → `tailwind.config.js` → components
- ✅ **Theme Engine** — dark / light / system, persisted to `localStorage`
- ✅ **Density modes** — comfortable / compact
- ✅ **Contrast modes** — normal / high (WCAG AA)
- ✅ **Liquid Glass foundation** — adaptive `backdrop-filter` with solid fallback
- ✅ **Glass capability detection** — device memory, CPU cores, `prefers-reduced-motion`
- ✅ **Motion system** — shared Framer Motion spring/smooth variants
- ✅ **Reduced-motion support** — global CSS reset
- ✅ **Accessibility baseline** — focus rings, keyboard operability, Radix a11y

### Component Library (48 modules)
- ✅ **Primitives (24)** — Button, IconButton, SplitButton, Input, TextArea, Select, Combobox,
  Checkbox, Radio, Switch, Badge, Spinner, Skeleton, Progress, Divider, Kbd, Avatar, Label,
  Tooltip, Popover, Dropdown, Modal, Drawer, Glass
- ✅ **Composites (8)** — Card, StatCard, EmptyState, FormField, Tabs, Breadcrumb, Pagination, Toast
- ✅ **Data (4)** — Table, DataGrid (sortable), List, TreeView *(readability-first, no glass)*
- ✅ **Patterns (11)** — Sidebar, TopBar, StatusBar, CommandPalette, SearchOverlay,
  NotificationCenter, WorkspaceContainer/PageHeader, Dock, QuickSettings, WindowFrame, VoiceOrb
- ✅ **Layouts (1)** — AppShell
- ✅ **Hooks (3)** — useMediaQuery, useReducedMotion, useHotkey
- ✅ **Public API barrel** — single import surface (`design-system/index.ts`)

### Application Shell
- ✅ **React Router integration** with a persistent, never-unmounting shell
- ✅ **Module registry** (`src/app/modules.tsx`) — routes, sidebar and command palette all
  generated from one array
- ✅ **Grouped sidebar navigation** — Overview / Intelligence / Workspace / Integrations / System
- ✅ **Collapsible sidebar rail** with tooltips
- ✅ **Command Palette** — `⌘K`, fuzzy search, "Ask Jarvis" branch
- ✅ **Global hotkey manager** — `⌘K` palette, `⌘J` voice
- ✅ **Notification Center** — grouped panel *(mock data)*
- ✅ **Quick Settings** — theme / density / contrast / glass controls
- ✅ **Status bar**, **Dock**, **floating VoiceOrb**
- ✅ **Breadcrumb + time-aware greeting** in the top bar
- ✅ **Toast system** — provider + `useToast()`

### Pages
- ✅ **Home / Command Center** — hero orb, ask bar, suggestion chips, vitals stat cards,
  activity timeline, right-panel widgets *(all data mocked)*
- ✅ **AI Chat** — streaming thread, markdown + code, auto-growing composer, `⌘↵` send,
  stop/abort, retry, copy, clear, suggestion chips, `localStorage` persistence
- ✅ **Design System Showcase** — every component in every state
- ✅ **Module Placeholder** — shared "coming soon" screen for 18 unbuilt modules

### Voice
- ✅ **Voice Overlay** — full-screen session, auto-start listening
- ✅ **Web Speech API integration** — continuous recognition with interim results
- ✅ **Live transcript** — final text solid, interim dimmed
- ✅ **Voice history** — last 20 transcripts, deduped, persisted
- ✅ **Voice → Chat handoff** via router state
- ✅ **VoiceOrb** — 6 animated states
- ✅ **Graceful unsupported-browser fallback**

### Backend & API
- ✅ **FastAPI service** with CORS middleware
- ✅ **`GET /api/health`** — liveness probe
- ✅ **`POST /api/chat/stream`** — SSE token streaming
- ✅ **SSE protocol** — `meta` / `delta` / `error` / `done`
- ✅ **Client-side SSE parser** with `AbortController` cancellation
- ✅ **JARVIS system prompt** (persona)
- ✅ **Server-side API key handling** (key never reaches the browser)

### Memory
- ✅ **Namespaced `localStorage` store modules** — chat, voice, theme
- ✅ **Bounded retention** — 100 messages / 20 transcripts
- ✅ **Corruption-safe reads** — every read is try/catch guarded

### Tooling
- ✅ **Vite build** with manual chunk splitting (motion, radix)
- ✅ **TypeScript project references** (app + node configs)
- ✅ **ESLint 9 flat config**
- ✅ **Storybook 8** configured *(only 3 stories written)*
- ✅ **Vitest + Testing Library** configured *(only 1 smoke suite)*
- ✅ **`@` path alias** → `src/`

---

## Pending Features

### 🏛️ Architecture — Single Workspace (Phase 7, **next**)
- ⬜ **Module registry rewrite** — `surface` / `audience`, 10-item cap, flat (no groups)
- ⬜ **Registry invariant test** — enforces ≤10 items, audience rule, forbidden-vocabulary ban
- ⬜ **Permanent redirects** for all v1 routes
- ⬜ **`TopNav`** — the flat top-bar navigation strip
- ⬜ **`AppShell` rework** — `sidebar` prop optional + deprecated
- ⬜ **`AppLayout` rewrite** — remove Sidebar, Dock, Breadcrumb from the composition
- ⬜ **`NotificationCenter`** — Drawer → Popover
- ⬜ **`WorkspaceContainer`** — remove the right context panel
- ⬜ **Widget system** — `Widget`, `WidgetGrid`, `useWidgetState`, peek/open/focused
- ⬜ **Conversation-placed widgets** — same component renders inline in a thread
- ⬜ **Domain widgets** — Recent Chats, Notes, Tasks, Calendar, Files, Automations, AI Apps,
  System Status, AI Suggestions
- ⬜ **Notes surface** (`/notes`) — currently a dead link in `Dock`
- ⬜ **Real sectioned Settings** — General · Jarvis · Connections · Advanced · About
- ⬜ **Developer Mode** — gating, `DeveloperShell`, lazy-loaded tool chunk
- ⬜ **User-facing counterparts** — "Things Jarvis remembers", "Response style", Connections, Activity

### 🎬 Startup Animation (Phase 7-D) — **REQUIRED MILESTONE**
- ⬜ **Cinematic boot sequence** — 10 beats, 2–4s, continuous, no perceptible stage boundaries
- ⬜ **Beats:** black → ambient glow → logo fade → soft pulse → energy wave → particles →
  glass materialises → widgets cascade → Voice Orb activates → seamless handoff to Home
- ⬜ **Non-blocking** — app initializes underneath; the animation is a curtain, never a gate
- ⬜ **60 FPS**, transform/opacity only, ≤20KB gzipped lazy chunk
- ⬜ **Reduced-motion variant** honouring the OS setting (≤600ms, cross-fade only)
- ⬜ **Optional audio** — ambient hum, activation tone, interface chime; **silent by default**
- ⬜ **Once per session**, fast-forward on any keypress or click

> **The frontend is NOT feature-complete until this ships.** No splash text, no "Loading…", no
> progress bars, no fake percentages, no branding flourish. Full spec and definition of done:
> [STARTUP-ANIMATION.md](./docs/architecture/STARTUP-ANIMATION.md).

### AI & Intelligence
- ⬜ **AI Agent Integration** — agent runtime, task delegation, multi-step execution
- ⬜ **Agent monitoring UI** (`/agents` route is a placeholder)
- ⬜ **Local LLM Support** (Ollama / llama.cpp)
- ⬜ **Direct OpenAI Integration** (bypassing the Emergent gateway)
- ⬜ **Direct Claude / Anthropic Integration**
- ⬜ **Google Gemini Integration**
- ⬜ **Model picker UI** (backend accepts `provider`/`model`; the UI hardcodes the badge)
- ⬜ **MCP (Model Context Protocol) Integration**
- ⬜ **Tool calling / function calling**
- ⬜ **Citations & source attribution**
- ⬜ **Streaming tool-use indicators**
- ⬜ **Prompt/context management & token budgeting**

### Memory & Knowledge
- ⬜ **Real Memory System** — vector store, embeddings, semantic recall (`/memory`)
- ⬜ **Knowledge Graph** — entity extraction, graph UI (`/knowledge`)
- ⬜ **Universal Search** — cross-module search (`SearchOverlay` shell exists, no backend)
- ⬜ **Server-side conversation persistence**
- ⬜ **Long-term / episodic memory separation**

### Feature Modules
- ⬜ **Automation Engine** — workflow builder, triggers, actions (`/automation`)
- ⬜ **Projects** module (`/projects`)
- ⬜ **Tasks** module (`/tasks`)
- ⬜ **Notes** module *(dock links to `/notes` — route does not exist yet)*
- ⬜ **Calendar Module** (`/calendar`)
- ⬜ **File Manager** (`/files`)
- ⬜ **Browser Automation** (`/browser`)
- ⬜ **Workspaces** — multi-workspace switching
- ⬜ **Diagnostics** (`/diagnostics`)
- ⬜ **Performance Monitoring** (`/performance`)
- ⬜ **Settings** — full settings surface (`/settings`; only QuickSettings exists)

### Integrations
- ⬜ **Email Module**
- ⬜ **Google Workspace** — Gmail, Drive, Calendar (`/google`)
- ⬜ **Microsoft 365** (`/microsoft`)
- ⬜ **Plugin System** — plugin registry, sandboxing, lifecycle (`/plugins`)
- ⬜ **Webhook / third-party integration layer**

### Voice & Multimodal
- ⬜ **Wake word detection** ("Hey Jarvis")
- ⬜ **Text-to-Speech** — JARVIS voice output
- ⬜ **Barge-in / interruption handling**
- ⬜ **Intent chips & voice command parsing**
- ⬜ **Server-side STT** (Whisper) for non-Chrome browsers
- ⬜ **Vision Module** — image understanding
- ⬜ **OCR**
- ⬜ **Screen capture / screen understanding**
- ⬜ **File & image attachments in chat** *(paperclip button exists, does nothing)*

### Platform & Infrastructure
- ⬜ **Authentication** — login, sessions, JWT (deps installed, unused)
- ⬜ **User model & profile** *(currently hardcoded "Tony Stark")*
- ⬜ **Database layer** — MongoDB wiring (`motor`/`pymongo` installed, unused)
- ⬜ **Real Notification Center backend** *(currently mock data)*
- ⬜ **Real dashboard data APIs** *(all vitals are mocked)*
- ⬜ **API client abstraction layer** (`src/lib/api/`)
- ⬜ **Error boundaries & global error handling**
- ⬜ **Rate limiting & request quotas**
- ⬜ **Telemetry / analytics**
- ⬜ **i18n / localisation**

### Desktop & Mobile
- ⬜ **Desktop shell** — Electron or Tauri wrapper
- ⬜ **Functional window controls** *(buttons are visual only)*
- ⬜ **System tray / global hotkeys**
- ⬜ **OS-level automation**
- ⬜ **Installer**
- ⬜ **Packaging & code signing**
- ⬜ **Update System** — auto-update channel
- ⬜ **Mobile Companion** app

### Quality
- ⬜ **Comprehensive Testing** *(1 smoke suite, 5 tests — near-zero coverage)*
- ⬜ **Storybook coverage** *(3 of 48 components have stories)*
- ⬜ **E2E tests** (Playwright) — `data-testid` attributes are already in place
- ⬜ **Visual regression testing**
- ⬜ **Backend tests** (`pytest` installed, no tests written)
- ⬜ **CI/CD pipeline** — no workflows exist
- ⬜ **Performance Optimization** — route-level code splitting, budgets
- ⬜ **Production Build** hardening — CSP, security headers, env validation
- ⬜ **Architecture conformance test** — the registry invariant suite (Phase 7-A)

---

## Future Roadmap

### ✅ Phase 1 — Master Design Specification *(complete)*
40-section spec, machine-readable tokens.

### ✅ Phase 2 — UI Foundation & Liquid Glass *(complete)*
Vite/TS migration, token pipeline, theme engine, glass foundation, 48-component library, window shell.

### ✅ Phase 3 — Application Shell & Navigation *(complete)*
Router, persistent shell, module registry, command/search state, hotkey manager, theme persistence.

### ✅ Phase 4 — Home / Command Center *(complete, mocked data)*
Dashboard with vitals, hero orb, ask bar, activity timeline, widgets.

### ✅ Phase 5 — AI Chat *(complete, MVP)*
Streaming thread, markdown, composer, abort/retry, local persistence.

### 🟡 Phase 6 — Voice Assistant *(in progress)*
**Done:** overlay, Web Speech STT, live transcript, history, chat handoff.
**Remaining:** wake word, TTS output, barge-in, intent chips, server-side STT fallback.

### 📐 Phase 7 — Single Workspace Architecture *(specified, next — see [next milestone](#suggested-next-milestone))*
The architecture refactor. Composition change only: no token changes, no backend changes, no deleted
components. Staged path in [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md).

- **7-A — Shell & navigation:** registry rewrite + invariant test, redirects, `TopNav`,
  `AppShell`/`AppLayout` rework, NotificationCenter → Popover, drop the right panel, add `/notes`.
- **7-B — Widget system:** `Widget` / `WidgetGrid` / `useWidgetState`, core + remaining domain
  widgets, conversation placement, Home converted to conversation + grid.
- **7-C — Settings & Developer Mode:** sectioned Settings, user-facing counterparts, `useDeveloperMode`,
  `DeveloperShell`, demoted surfaces re-homed, lazy-loaded developer chunk.
- **7-D — Startup animation:** ⬜ **required milestone** — cinematic boot sequence, reduced-motion
  variant, optional audio, seamless handoff. [Spec](./docs/architecture/STARTUP-ANIMATION.md).

### ⬜ Phase 8 — Data & Identity Foundation
Decouple the backend from `emergentintegrations`, database layer, authentication, real user model,
server-side chat persistence, API client abstraction, replace mock dashboard data with real endpoints.

### ⬜ Phase 9 — Memory & Knowledge
Vector store, embeddings, semantic recall — surfaced to users only as **"Things Jarvis remembers"**.
Knowledge graph and raw inspection tools stay in **Developer Mode**. Universal search behind `⌘K`.

### ⬜ Phase 10 — Productivity Surfaces
Notes, Tasks, Calendar, Files as real widgets and focused surfaces. Projects becomes a grouping
*inside* them — not a navigation destination.

### ⬜ Phase 11 — AI Apps & Integrations
Google Workspace, Microsoft 365, Email → **Settings → Connections**. Plugin system and MCP →
user-facing as **AI Apps**, raw registries in Developer Mode.

### ⬜ Phase 12 — Agents & Automations
Agent runtime, tool calling, automation engine, multi-step execution. Surfaced as **AI Apps** and
**Automations**; the tool registry stays in Developer Mode.

### ⬜ Phase 13 — Multimodal
TTS, wake word, vision, OCR, screen understanding, chat attachments.

### ⬜ Phase 14 — Desktop Application
Electron/Tauri shell (where `WindowFrame` and `Dock` find their real home), functional window
controls, system tray, OS automation, local LLM support.

### ⬜ Phase 15 — Hardening
Full test coverage, E2E, CI/CD, route-level code splitting, performance budgets, i18n, telemetry,
security review.

### ⬜ Final Release — v1.0
Installer, packaging, code signing, auto-update, mobile companion, production deployment.

---

## AI Handover Notes

> **This section exists so you do not have to read the codebase to be productive.**
> Read it fully before making changes. It encodes decisions that are not obvious from the code.

### Start here — read these before touching anything

**Architecture first. The code you are about to read reflects the OLD shell.**

| # | Read this | To understand |
|---|---|---|
| 1 | **`docs/architecture/README.md`** | ★ The current architecture in one minute. **Non-negotiable first read.** |
| 2 | **`docs/architecture/UI-ARCHITECTURE.md`** | The single-workspace philosophy, the ten principles, the abstraction rule |
| 3 | **`docs/architecture/NAVIGATION.md`** | What is user-facing vs. internal; the v1→v2 map; the new registry |
| 4 | **`docs/architecture/COMPONENT-PLAN.md`** | What to keep, modify, demote, and build |
| 5 | `frontend/src/design-system/index.ts` | The complete public component API in one file (48 components) |
| 6 | `frontend/src/app/modules.tsx` | The module registry — **currently v1 shape**, rewritten in Phase 7-A |
| 7 | `frontend/src/app/AppLayout.tsx` | The persistent shell — **currently the v1 sidebar composition** |
| 8 | `frontend/src/styles/tokens.css` | Every colour/space/radius/motion value in the system |
| 9 | `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md` | Why the design looks the way it does (**visual** authority) |

> **Which document wins?** `docs/architecture/` governs **layout, navigation and information
> architecture**. `docs/jarvis-design-system/` governs **visual language** — color, type, motion,
> spacing, tokens. Where they disagree on structure, architecture wins.

### The new philosophy in ten lines

1. AI-first interface — the conversation is the centre of gravity.
2. Single workspace — one frame; content changes inside it, the frame does not.
3. Minimal navigation — a thin top strip, not a structural element.
4. **No sidebars, no drawers, no dock, no hidden nav panels.**
5. No hidden complexity — if a user has to find it, it is badly placed.
6. Technical concepts live in Developer Mode, off and invisible by default.
7. End users interact with features, not infrastructure.
8. Widgets expand **in place** instead of opening panels.
9. It should feel like an operating system, not a website with a menu.
10. Simplicity beats completeness.

### Why certain decisions were made

**Why a module registry instead of hand-written routes?**
Navigation, routing and the command palette must never drift apart. One array in `modules.tsx`
drives all three. `App.tsx` filters out the three built pages and maps everything else to
`ModulePlaceholder`. When you build a real module, you add its route to `App.tsx` and set
`ready: true` on the registry entry — the sidebar and palette update themselves.

**Why CSS variables instead of Tailwind's colour palette?**
Theme switching must be instant and must not re-render the React tree. Setting `data-theme` on
`<html>` re-resolves every variable at once. It also means dark/light/high-contrast/density are
four independent axes rather than a combinatorial explosion of class names.

**Why Radix UI under our own components?**
Accessibility (focus trapping, ARIA, keyboard nav, portalling) is genuinely hard. Radix supplies
unstyled correct behaviour; our layer supplies the JARVIS look. **Never replace a Radix primitive
with a hand-rolled one.**

**Why is glass adaptive rather than always on?**
`backdrop-filter` is expensive. `detectGlassCapability()` in `ThemeProvider.tsx` checks
`CSS.supports`, `navigator.deviceMemory`, `hardwareConcurrency` and `prefers-reduced-motion`, and
falls back to opaque surfaces. Users can force it on/off in Quick Settings.

**Why do data components (Table, DataGrid, List, TreeView) never use glass?**
Deliberate design rule from the spec: **readability beats spectacle on data-dense surfaces.** Glass
is for floating/overlay chrome only. Do not "improve" tables by adding glass.

**Why SSE instead of WebSockets?**
Chat streaming is unidirectional. SSE over `fetch` gives cancellation via `AbortController` for
free, needs no connection lifecycle management, and survives proxies. Revisit only when
bidirectional features (live agent status, collaborative editing) actually arrive.

**Why is history re-sent on every chat turn?**
The backend is stateless by design at this stage. The client owns the conversation. This is a known
temporary shortcut — Phase 7 moves it server-side.

**Why `localStorage` for memory?**
There is no database yet. The store modules (`chatStore.ts`, `voiceHistory.ts`) are deliberately
tiny seams so swapping to an API is a two-file change.

**Why is Home data hardcoded?**
The UI contract was built before the APIs. The numbers are placeholders that make the layout real.
**Do not delete the widgets — wire them up.**

**Why does the code contradict `docs/architecture/`?**
Because the architecture was decided before it was implemented — deliberately. The docs are the
**target state**; `src/app/` is the **current state**. Phase 7 closes the gap. When they disagree,
build toward the docs and follow [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md); do not
"fix" the docs to match the old code.

**Why refactor the shell before wiring real data (Phase 7 before Phase 8)?**
Phase 8 integrates APIs into surfaces. Rebuilding those surfaces afterwards means doing the
integration twice. Move the walls while the rooms are still empty.

**Why is the sidebar being removed when it works?**
It works, and it is conventional — that is the problem. A nav rail reads as "web dashboard", and it
was exposing our architecture (Memory, Knowledge, Plugins, Diagnostics) to end users as peers of
Tasks and Calendar. Full reasoning, including the alternatives rejected, in
[ADR-0001](./docs/architecture/adr/0001-single-workspace-architecture.md).

### Existing coding conventions

- **TypeScript everywhere.** `.tsx` for components, `.ts` for logic. No `.js` source files.
- **Named exports only** — no default exports anywhere in `src/`.
- **`export function Component()`**, not `const Component = () =>`.
- **Props interfaces are exported** and named `<Component>Props`.
- **Single quotes**, semicolons, trailing commas, 2-space indent.
- **`import type { X }`** for type-only imports.
- **Comments explain *why*, never *what*.** The codebase is deliberately sparse in comments — match
  that density. Do not add narrating comments.
- **`data-testid`** on interactive elements that tests will target (already used consistently:
  `chat-send`, `chat-input`, `voice-send`, `open-voice`, `home-ask-input`, …). Keep this up.
- **Ordered imports:** React → third-party → design system → features/lib → relative.

### File organization

- One component per file; the file is named after the component.
- Component folders group related components:
  `primitives/Button/{Button,IconButton,SplitButton}.tsx`,
  `primitives/Selection/{Checkbox,Radio,Switch}.tsx`.
- Stories live next to the component: `Button.stories.tsx`.
- Tests live in `__tests__/` folders.
- **Every new design-system component must be re-exported from `design-system/index.ts`.**

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `VoiceOrb`, `CommandPalette` |
| Hooks | `use` + camelCase | `useSpeechRecognition`, `useHotkey` |
| Types/interfaces | PascalCase | `ModuleDef`, `VoiceState`, `ChatTurn` |
| Props interfaces | `<Component>Props` | `VoiceOverlayProps` |
| Files | match the export | `ThemeProvider.tsx`, `chatStore.ts` |
| Routes | lowercase, singular-ish | `/chat`, `/memory`, `/knowledge` |
| localStorage keys | `jarvis.<domain>.<thing>` | `jarvis.chat.messages` |
| Tailwind semantics | `<role>-<variant>` | `bg-surface-base`, `text-content-secondary` |
| Test ids | kebab-case, `<area>-<action>` | `chat-send`, `voice-close` |

### Component structure

Components follow a consistent shape:

1. Exported props interface
2. `cva()` variant definitions where a component has variants
3. `export function Component({ ...props })`
4. `cn()` to merge class names (never raw template strings for classes)
5. Radix primitives for anything with overlay/focus/ARIA behaviour
6. Framer Motion for animation, respecting `useReducedMotion()`

Compound components are exported as siblings, not as `Component.Sub` namespaces
(e.g. `Sidebar`, `SidebarGroup`, `SidebarItem`).

### State management

**There is no global state library — and that is deliberate.** Current strategy:

| Scope | Mechanism |
|---|---|
| Theme | React Context (`ThemeProvider`) — the only true global |
| Toasts | React Context (`ToastProvider` + `useToast()`) |
| Shell UI state | `useState` in `AppLayout` (palette/notifications/voice open, sidebar collapsed) |
| Page state | `useState` in the page component (e.g. chat messages in `ChatPage`) |
| Cross-route data | React Router location `state` (the voice→chat prompt handoff) |
| Persistence | Namespaced `localStorage` modules |

**Guidance:** do **not** add Redux/Zustand/Jotai for a single feature. When server data arrives in
Phase 7, add **TanStack Query** for server state and keep local UI state local. Introduce a client
state library only if genuinely global client state emerges that Context cannot serve.

### Styling approach

1. **Tailwind utility classes only.** No CSS modules, no styled-components, no inline `style` for
   anything themeable.
2. **Every class must resolve to a token.** `bg-surface-base`, `text-content`, `border-line`,
   `text-ai-aura`, `bg-accent`. **Never** `bg-[#0a0a0a]`, `text-gray-400`, or a raw hex.
3. **New visual value needed?** Add a token to `tokens.css` (and `design-tokens.json`) and expose it
   in `tailwind.config.js`. Do not inline it.
4. **`cn()` from `design-system/lib/cn.ts`** for all conditional classes.
5. **`cva()`** for multi-variant components.
6. **Glass** via the `.glass` class or `<Glass>` — floating surfaces only.
7. **Accent blue and cyan AI aura are signals.** Spend them on primary actions and AI presence only.
   Overusing them destroys the visual hierarchy.

### Existing APIs

| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/api/health` | GET | — | `{"status":"ok","service":"jarvis-api"}` |
| `/api/chat/stream` | POST | `{messages: [{role, content}], session_id?, model?, provider?}` | SSE stream |

SSE event sequence: `event: meta` (session_id) → repeated `data: {"delta": "..."}` →
`event: error` (on failure) → `event: done`.
Defaults: `provider: "anthropic"`, `model: "claude-sonnet-4-6"`.
Client: `streamChat()` in `frontend/src/lib/chatClient.ts`.

### Pending APIs (design these next)

```
POST   /api/auth/login | /api/auth/logout | GET /api/auth/me
GET    /api/user/profile
GET    /api/dashboard/vitals            ← replaces hardcoded Home stat cards
GET    /api/notifications               ← replaces mock NotificationCenter data
GET    /api/activity                    ← replaces mock ActivityTimeline
GET    /api/chat/sessions
GET    /api/chat/sessions/{id}
DELETE /api/chat/sessions/{id}
POST   /api/memory/search               ← semantic recall
POST   /api/memory/ingest
GET    /api/knowledge/graph
POST   /api/search                      ← universal search (SearchOverlay backend)
POST   /api/voice/transcribe            ← server-side STT fallback
POST   /api/voice/speak                 ← TTS
CRUD   /api/projects | /tasks | /notes | /calendar | /files
GET    /api/agents  · POST /api/agents/{id}/run
GET    /api/plugins · POST /api/plugins/install
GET    /api/settings · PUT /api/settings
GET    /api/diagnostics · /api/performance
```

**Convention to preserve:** every backend route is prefixed `/api/`. Keep it — the proxy and CORS
config depend on it.

### Memory implementation (current + intended)

**Current:** three `localStorage` modules with bounded retention and try/catch-guarded reads.
No component reads `localStorage` directly — always go through the store module.

**Intended:** replace the store internals with API calls; add a vector store (embeddings) behind
`POST /api/memory/search`; layer a knowledge graph for entities/relations; surface recall in a
`/memory` module UI. **Because components only ever call `loadMessages()` / `saveMessages()`, this
migration should not touch a single component.** Preserve that property.

### Voice implementation (current + intended)

**Current:** browser-only STT via `useSpeechRecognition` → `VoiceOverlay` → hand off to `/chat`.
Chrome/Edge only; degrades with a clear message elsewhere.

**Intended:** add wake-word detection (Porcupine or similar) running alongside the hook; add TTS so
JARVIS speaks replies (drive `VoiceOrb`'s `speaking` state from playback); add server-side Whisper
transcription for browsers without the Web Speech API; parse intents into chips before sending.
**Keep `useSpeechRecognition` as the abstraction boundary** — a server-STT implementation should
satisfy the same `UseSpeechRecognition` interface so `VoiceOverlay` never changes.

### Future expansion strategy

**To add a new feature — the v2 recipe:**

0. **Decide the audience first.** Is this a *feature* (a user would ask for it by name) or
   *infrastructure* (it only exists because of how we built things)? Infrastructure goes to
   Developer Mode and stops here.
1. **Build the widget, not the page.** Create `frontend/src/features/<domain>/<Domain>Widget.tsx` on
   top of the `Widget` shell. It must work in `peek`, `open` and `focused`, and with
   `placement="conversation"`.
2. Add the registry entry in `frontend/src/app/modules.tsx` with the correct `surface` and
   `audience`. **If it is `surface: 'topbar'`, check the ≤10 cap first** — something may need to move.
3. Name it for the outcome, not the system. Check the
   [vocabulary table](./docs/architecture/UI-ARCHITECTURE.md#vocabulary-rules).
4. Add the route in `frontend/src/App.tsx` for the focused state (deep-linkable), wrapping content in
   `<WorkspaceContainer header={<PageHeader …/>}>` — **without a `rightPanel`.**
5. Build **only** from `design-system` exports. If a needed primitive doesn't exist, add it to the
   design system — never inline a bespoke one in the feature.
6. `EmptyState` when empty, `Skeleton` when loading. Never an empty box, never a spinner in the grid.
7. Add `data-testid` to interactive elements.
8. Add a Storybook story covering all three widget states.
9. Update this README's status tables and the checklists.

Full checklist: [WIDGET-SYSTEM.md §8](./docs/architecture/WIDGET-SYSTEM.md#8-widget-authoring-checklist).

**To add a design-system component:**
Pick the right tier (primitive → composite → data → **widget** → pattern → layout), create
`design-system/<tier>/<Name>/<Name>.tsx`, use `cva()` + `cn()` + tokens, wrap Radix if it has
overlay/focus behaviour, export it from `index.ts`, add a story, add it to `DesignShowcase`.
Then run the review checklist in
[COMPONENT-PLAN.md §9](./docs/architecture/COMPONENT-PLAN.md#9-review-checklist-for-any-new-component).

**Before you write any new component, check `design-system/index.ts`.** 48 components already exist.
The most common mistake an agent makes on this codebase is rebuilding something that is already there.

### ⚠️ Explicit instructions for AI assistants

**Architecture conformance — these are absolute:**

- **NEVER add a sidebar, nav rail, right context panel, sliding drawer, bottom dock, or hidden
  navigation panel** to the primary user experience. Not "just for this module". Not "because
  there's space at 1440px". If you think you need one, you need a widget that expands in place.
- **NEVER exceed 10 items in the top bar.** An eleventh means something else is not user-facing.
- **NEVER expose technical vocabulary to users** — no *vector database*, *embedding*, *knowledge
  graph*, *prompt*, *MCP*, *tool registry*, *context window*, *provider*, *API key*, *plugin*. Those
  words belong in Developer Mode only. Check
  [the vocabulary table](./docs/architecture/UI-ARCHITECTURE.md#vocabulary-rules) before naming
  anything.
- **NEVER open a modal, drawer or side panel for a routine action.** Expand in place. Modals are for
  destructive confirmations only.
- **NEVER surface a Developer Mode tool to a user who has not enabled it** — not even greyed out,
  not even as a teaser.
- **ALWAYS ask "what does the ordinary user see instead?"** when building anything technical.
  "Nothing" is a valid and common answer.
- **DO NOT delete `Sidebar`, `Dock`, `Drawer`, `Breadcrumb`, `SearchOverlay` or `WindowFrame`.**
  They are demoted, not removed — they have real homes in Developer Mode, mobile and the desktop shell.

**General:**

- **DO NOT rewrite the existing architecture unless absolutely necessary.** The three-layer
  separation, the module-registry pattern, and the token pipeline are load-bearing.
  *(The one sanctioned exception is the shell **composition** change specified in
  [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md) — follow that plan, don't improvise
  your own.)*
- **ALWAYS extend existing components before creating new ones.** Add a variant or a prop rather
  than a near-duplicate component.
- **REUSE design tokens.** Never introduce a hardcoded colour, spacing value, radius, shadow or
  z-index. If a token is missing, add it to `tokens.css` **and** `design-tokens.json`.
- **REUSE existing UI components.** Import from `@/design-system` — never re-implement a Button,
  Modal, Table, Tooltip or Toast.
- **FOLLOW existing naming conventions** (see the table above) exactly.
- **AVOID duplicate components.** Search `design-system/index.ts` before creating anything.
- **DO NOT remove placeholder modules.** The 18 `ModulePlaceholder` routes are the roadmap made
  executable. Replace them with real implementations; never delete the entries.
- **PRESERVE backward compatibility.** Do not change existing component props, the SSE protocol,
  `localStorage` key names, or route paths without updating every call site and noting it here.
- **DO NOT switch package managers.** `yarn.lock` is committed; use `yarn`.
- **DO NOT replace Radix primitives** with hand-rolled implementations.
- **DO NOT add a global state library** for a single feature (see [State management](#state-management)).
- **DO NOT add glass to data-dense surfaces.**
- **DO NOT delete mock data** without replacing it with a real data source.
- **UPDATE this README** whenever you complete a feature — move it from Pending to Completed and
  adjust the completion percentage. This file is the handover contract.

---

## Development Rules

**Rule 0 — Architecture conformance.** Every UI change must satisfy all of these, or it does not
merge:

- [ ] No sidebar, drawer, dock, or second navigation surface in the primary UX
- [ ] Top bar still has ≤ 10 items, all `audience: 'everyone'`
- [ ] No technical vocabulary in any user-visible string
- [ ] Nothing opens a panel where it could expand in place
- [ ] No Developer Mode surface is visible when Developer Mode is off
- [ ] The conversation is still reachable in one interaction

*The registry invariant test (Phase 7-A) enforces items 2 and 3 automatically. The rest are review
items. If you find yourself arguing for an exception, re-read
[ADR-0001](./docs/architecture/adr/0001-single-workspace-architecture.md) — the alternatives were
already considered and rejected.*

1. **Keep code modular.** One component, one responsibility, one file.
2. **Keep components reusable.** Anything generic belongs in `design-system/`; anything
   domain-specific belongs in `features/`.
3. **Never break existing APIs.** Component props, the SSE protocol, `localStorage` keys and route
   paths are contracts.
4. **Maintain TypeScript types.** No `any`. No `@ts-ignore`. Export props interfaces. `yarn typecheck`
   must pass.
5. **Follow the existing folder structure.** Do not reorganise directories.
6. **Document major changes.** Update this README and `CHANGELOG.md` in the same commit as the change.
7. **Write meaningful commits.** Conventional-commit style: `feat(chat): add message attachments`,
   `fix(voice): handle mic permission denial`, `docs(readme): update phase status`.
8. **Tokens only.** No hardcoded visual values, ever.
9. **Accessibility is not optional.** Keyboard operable, labelled controls, visible focus rings,
   `prefers-reduced-motion` respected.
10. **Test what you add.** At minimum a smoke test for new design-system components and a story in
    Storybook.
11. **Lint and typecheck before committing.** `yarn lint && yarn typecheck && yarn build`.
12. **Keep the backend `/api/` prefix** on every route.
13. **Never commit secrets.** `.env` files are gitignored; use the `.env.example` files.
14. **Prefer additive change.** Extend, don't replace.

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **Yarn** (`corepack enable` or `npm i -g yarn`)
- **Python** 3.11+
- An LLM API key (see the backend note below)

### Installation

```bash
git clone https://github.com/Kunal2662/Jarvis-Frontend.git
cd Jarvis-Frontend
```

### Frontend

```bash
cd frontend
yarn install
```

Create `frontend/.env` (copy from `frontend/.env.example`):

```env
# Backend base URL. Leave empty for same-origin, or point at the local API.
VITE_BACKEND_URL=http://localhost:8000
```

Run it:

```bash
yarn dev          # dev server on http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

> **⚠️ Important:** `requirements.txt` pins `emergentintegrations==0.2.0` and a `litellm` wheel
> hosted on Emergent's CDN. **Neither is available on public PyPI.** Outside the Emergent workspace
> the install will fail.
>
> **To run locally without Emergent**, install the essentials only and swap the LLM call:
> ```bash
> pip install fastapi uvicorn pydantic python-dotenv anthropic
> ```
> Then replace the `LlmChat` usage in `backend/server.py` with a direct Anthropic streaming call.
> This is the **recommended first task** if you are moving the project off Emergent.

Create `backend/.env` (copy from `backend/.env.example`):

```env
EMERGENT_LLM_KEY=your_key_here
CORS_ORIGINS=http://localhost:3000
```

Run it:

```bash
uvicorn server:app --reload --port 8000
```

Verify: `curl http://localhost:8000/api/health` → `{"status":"ok","service":"jarvis-api"}`

### Environment variables reference

| Variable | Side | Required | Default | Purpose |
|---|---|---|---|---|
| `VITE_BACKEND_URL` | Frontend | No | `''` (same origin) | Backend base URL |
| `REACT_APP_BACKEND_URL` | Frontend | No | — | Legacy CRA fallback; prefer `VITE_BACKEND_URL` |
| `EMERGENT_LLM_KEY` | Backend | **Yes** | — | LLM gateway API key |
| `CORS_ORIGINS` | Backend | No | `*` | Comma-separated allowed origins |

### All frontend commands

```bash
yarn dev              # Vite dev server (0.0.0.0:3000)
yarn start            # alias for dev
yarn build            # tsc -b && vite build  → frontend/dist/
yarn preview          # serve the production build on :3000
yarn typecheck        # tsc --noEmit (app + node configs)
yarn lint             # ESLint 9 flat config
yarn test             # vitest run
yarn test:watch       # vitest watch mode
yarn storybook        # Storybook on :6006
yarn build-storybook  # static Storybook build
```

### Build process

```bash
cd frontend
yarn typecheck && yarn lint && yarn test && yarn build
```

`yarn build` runs `tsc -b` (project references, type errors fail the build) then `vite build`,
emitting to `frontend/dist/` with `motion` and `radix` split into separate chunks.

The backend needs no build step — deploy `server.py` with uvicorn (or gunicorn + uvicorn workers)
and serve `frontend/dist/` from any static host or reverse proxy.

### Verifying your setup works

1. `http://localhost:3000` → Command Center with the hero orb and stat cards.
2. Press `⌘K` / `Ctrl+K` → command palette opens.
3. Press `⌘J` / `Ctrl+J` → voice overlay opens (Chrome/Edge for mic support).
4. Go to `/design` → the full component showcase renders.
5. Go to `/chat`, send a message → tokens stream in (requires the backend + a valid key).
6. Click any other sidebar item → the "coming soon" placeholder. **This is expected.**

---

## Git Information

**Repository:** https://github.com/Kunal2662/Jarvis-Frontend
**Default branch:** `main`

### Branching

```bash
git checkout -b feat/<module-name>     # new feature module
git checkout -b fix/<short-desc>       # bug fix
git checkout -b docs/<short-desc>      # documentation
```

### Commit style

Conventional commits — `feat`, `fix`, `docs`, `refactor`, `test`, `chore`:

```
feat(memory): add vector store backed recall
fix(chat): prevent duplicate prompt send on remount
docs(readme): update phase 6 completion status
```

### What is not tracked

`.gitignore` excludes: `node_modules/`, build output (`dist/`, `build/`), Python bytecode
(`__pycache__/`, `*.pyc`), TypeScript incremental caches (`*.tsbuildinfo`), all `.env` files,
credentials, and OS/editor cruft.

**Never commit** `.env`, API keys, or credentials. Use the `.env.example` files as templates.

---

## Suggested Next Milestone

**Phase 7 — Single Workspace Architecture.**

The architecture refactor comes before the data work, and the ordering matters: Phase 8 wires real
APIs into surfaces, and rebuilding those surfaces afterwards would mean doing the integration twice.
Refactor the shell while the data is still mock and cheap to move.

Execute [MIGRATION-PLAN.md](./docs/architecture/MIGRATION-PLAN.md) stage by stage — each stage is
independently shippable and ends green on `yarn lint && yarn typecheck && yarn test && yarn build`:

1. **Stage 1 — Registry & routing.** Rewrite `modules.tsx` with `surface`/`audience`, add the
   invariant test, add redirects. No visual change; ships safely on its own.
   *(Write the invariant test in this stage — it is what stops the architecture drifting back.)*
2. **Stage 2 — The new shell.** `TopNav`, `AppShell`/`AppLayout` rework, NotificationCenter →
   Popover, drop the right panel. The only stage with a large visual diff.
3. **Stage 3 — Widget system.** Promote the `Widget` prototype, build `WidgetGrid`, convert Home,
   enable conversation placement.
4. **Stage 4 — Settings & Developer Mode.** Sectioned Settings, user-facing counterparts, gating,
   re-home the demoted surfaces.
5. **Stage 5 — Startup animation.** Last, so it animates the real shell geometry.

**Then Phase 8 — Data & Identity Foundation**, in this order: decouple the backend from
`emergentintegrations` (smallest task, biggest portability win) → MongoDB via `motor` → JWT auth and
a real user model → server-side chat persistence → `src/lib/api/` + TanStack Query → replace mock
data. After that, **Notes** or **Tasks** as the first fully real widget validates the whole stack
end to end.

---

*Last updated: 2026-08-06 · JARVIS is under active development.*
*`ROADMAP.md`, `CHANGELOG.md` and `memory/PRD.md` are current as of this date and consistent with
this file. `docs/architecture/` is the authority on layout, navigation and information architecture;
`docs/jarvis-design-system/` is the authority on visual language.*
