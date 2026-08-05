# Project JARVIS — PRD

## Vision
JARVIS is an **AI Operating Companion** — a complete AI Operating System (not a chatbot). Futuristic yet professional; a fusion of Iron Man JARVIS, iOS 26 Liquid Glass, visionOS, Windows 11 Fluent, Arc, Linear, Notion, Raycast.

## Source of truth
- Design spec: `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md` (40 sections)
- Tokens: `docs/jarvis-design-system/design-tokens.json`

## Architecture (current)
- Frontend: **Vite + React 18 + TypeScript**, Tailwind + CSS-variable semantic tokens, Radix UI, cmdk, Framer Motion, lucide-react.
- Dev server supervised on `0.0.0.0:3000` via `yarn start` (Vite).
- No backend in scope yet (design foundation phase).

## Status
### ✅ Phase 1 — Master Design Specification
40-section spec + machine-readable tokens.

### ✅ Phase 2 — UI Foundation & Liquid Glass (2026-06-05)
- Vite/TS migration; token pipeline (dark/light/high-contrast/density) via CSS variables.
- Theme engine: `ThemeProvider` + `useTheme` (theme, density, contrast, adaptive glass; persisted).
- Liquid Glass foundation: adaptive real-blur vs solid fallback; `.glass` layer + `Glass` primitive.
- Core UI library (~40 components): primitives, composites, data (readability-first), overlays.
- Window shell: Sidebar, TopBar, StatusBar, CommandPalette (⌘K), SearchOverlay, NotificationCenter, WorkspaceContainer/PageHeader, Dock, WindowFrame, QuickSettings, VoiceOrb, AppShell.
- Motion system + a11y (WCAG AA tokens, focus rings, keyboard nav, reduced-motion).
- Design System Showcase route for validation. lint / typecheck / build all green.

## Personas
- **Operator (Tony)** — power user running many modules/agents; keyboard-first.
- **Builder** — extends JARVIS via plugins/MCP/agents.
- **Everyday user** — notes/tasks/calendar productivity.

## Backlog (prioritized)
- **P0 Phase 3:** App shell routing + navigation architecture + module registry + responsive shell.
- **P1 Phase 4:** Dashboard "Command Center".
- **P1 Phase 5:** AI Chat (streaming thread + composer).
- **P2 Phase 6:** Voice Assistant overlay (VoiceOrb ready).
- **P2 Phase 7+:** Memory, Knowledge Graph, Universal Search, Workspaces, Projects, Notes, Tasks, Calendar, Files, AI Workspace, Google Workspace, Plugins, MCP, Agents, Automation, Diagnostics, Settings, Performance Monitoring.
- **Cross-cutting:** backend/API + auth, component tests + Storybook, perf budgets, i18n.

## Notes
- No feature pages built in Phase 2 (intentionally deferred).
- No authentication or test credentials created yet.
