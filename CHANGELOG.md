# Changelog

All notable changes to Project JARVIS are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com); versioning is [SemVer](https://semver.org).

## [Unreleased] — 2026-08-06 — Architecture: Single Workspace

Architecture decision and documentation. **No application code changed** — the v1 sidebar shell still
runs. Implementation is specified stage-by-stage in `docs/architecture/MIGRATION-PLAN.md`.

### Changed — Architecture direction
- Adopted the **single workspace architecture**: Top Bar → Adaptive Workspace → Status Bar.
- **Removed from the primary UX (by decision, not yet by code):** left sidebar, right context panel,
  sliding drawers, bottom dock, breadcrumbs, nested navigation.
- Navigation capped at **10 user-facing surfaces**, named for outcomes rather than systems:
  Home · Chat · Voice · Notes · Calendar · Tasks · Files · AI Apps · Automations · Settings.
- All technical concepts (memory internals, knowledge graph, vector store, embeddings, prompts, MCP,
  tool registry, providers, API keys, context, logs, diagnostics, performance) move behind
  **Developer Mode** — off and completely invisible by default.
- Conversation re-established as the primary surface; widgets expand **in place** rather than opening
  panels, and the same widget renders inline in a chat thread.

### Added — Documentation
- `docs/architecture/README.md` — index and one-minute summary.
- `docs/architecture/UI-ARCHITECTURE.md` — philosophy, three-zone layout, ten principles, the
  abstraction rule and forbidden-vocabulary table.
- `docs/architecture/NAVIGATION.md` — navigation taxonomy, full v1→v2 migration map, new module
  registry shape with `surface` / `audience`.
- `docs/architecture/WIDGET-SYSTEM.md` — widget contract, `peek`/`open`/`focused` states,
  conversation placement, authoring checklist.
- `docs/architecture/DEVELOPER-MODE.md` — gating, tool inventory, user-facing counterparts, security
  rules.
- `docs/architecture/COMPONENT-PLAN.md` — disposition of all 48 existing components (37 keep,
  6 modify, 6 demote) plus ~20 new components required.
- `docs/architecture/MIGRATION-PLAN.md` — five independently shippable stages.
- `docs/architecture/STARTUP-ANIMATION.md` — **pending required milestone**: cinematic 10-beat boot
  sequence, 2–4s, non-blocking, 60 FPS, reduced-motion variant, optional audio.
- `docs/architecture/adr/0001-single-workspace-architecture.md` — decision record with rejected
  alternatives.

### Changed — Existing docs
- `README.md` — architecture, roadmap, pending features and AI handover notes rewritten for v2.
- `ROADMAP.md` — rewritten; Phases 3–6 marked complete (they were stale), Phase 7 added as the
  architecture refactor with sub-phases 7-A…7-D.
- `memory/PRD.md` — refreshed to current reality and the new philosophy.
- `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md` — amendment notice; it remains the authority on
  visual language, while `docs/architecture/` governs layout and information architecture.

### Notes
- **Nothing reusable is deleted.** `Sidebar`, `Dock`, `Drawer`, `Breadcrumb`, `SearchOverlay` and
  `WindowFrame` stay in the library and are re-homed in Developer Mode, mobile, or the desktop shell.
- Design tokens, the theme engine, the Liquid Glass foundation, the SSE protocol, all `localStorage`
  keys and the backend are **unchanged**.

## [0.2.0] — 2026-06-05 — Phase 2: UI Foundation & Liquid Glass

### Added — Tooling
- Migrated frontend to **Vite 6 + React 18 + TypeScript 5.6** (from CRA).
- Tailwind CSS 3.4 wired entirely to semantic CSS variables (no hardcoded colors).
- ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh).
- Scripts: `start`, `dev`, `build`, `typecheck`, `lint`, `preview`. Dev server bound to `0.0.0.0:3000`.

### Added — Design Tokens & Theme Engine
- `src/styles/tokens.css` — full semantic token set (surfaces, text, borders, accent, status, AI presence, elevation, glass, radius, layout, density) generated from `design-tokens.json`.
- `ThemeProvider` with **dark / light / system**, **comfortable / compact** density, **normal / high** contrast, and **auto / on / off** Liquid Glass, all persisted to `localStorage` and exposed via `useTheme()`.
- Adaptive glass capability detection (backdrop-filter support + device memory/cores + reduced-motion) — real blur on capable devices, solid-surface fallback otherwise.

### Added — Liquid Glass Foundation
- `.glass` component layer (frosted substrate, luminous top edge, reflection sheen, depth tiers `thin/default/thick`) that degrades to opaque surfaces when glass is off.
- `Glass` primitive + `useReducedMotion`, `useMediaQuery`, `useHotkey` hooks.

### Added — Core UI Library
- **Buttons:** Button, IconButton, SplitButton.
- **Inputs:** Input, Password, Search, TextArea, Select, Combobox.
- **Selection:** Checkbox, Radio, Switch/Toggle.
- **Feedback:** Badge, Toast (provider + `useToast`), Progress, Spinner, Skeleton.
- **Display:** Avatar, Card, StatCard, EmptyState, Divider, Kbd, Label, FormField.
- **Navigation:** Tabs (line + segmented), Breadcrumb, Pagination.
- **Overlays:** Modal, Drawer, Tooltip, Popover, Dropdown.
- **Data (readability-first, no glass):** Table, DataGrid (sortable), List, TreeView.

### Added — Window Shell
- Sidebar (collapsible rail + tooltips), TopBar (search trigger), StatusBar, CommandPalette (⌘K, cmdk + Ask-Jarvis branch), SearchOverlay, NotificationCenter, WorkspaceContainer + PageHeader, Dock, WindowFrame, QuickSettings, VoiceOrb (idle/listening/thinking/speaking), AppShell layout.

### Added — Motion & Accessibility
- Framer Motion spring/smooth variants; global `prefers-reduced-motion` reset.
- WCAG AA tokens, always-visible focus rings, keyboard operability, Radix-backed a11y for overlays.

### Added — Validation
- Internal **Design System Showcase** route (`/`) rendering every component and state.
- ✅ `lint`, ✅ `typecheck`, ✅ `build` all pass with zero errors.

### Notes
- No feature pages built in this phase (Dashboard, Chat, Voice, Projects, Notes, Calendar, AI Workspace intentionally deferred).
