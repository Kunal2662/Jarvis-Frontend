# Project JARVIS — Roadmap

JARVIS is an **AI Operating Companion** — a complete AI Operating System, not a chatbot.

## ✅ Phase 1 — Master Design Specification (complete)
- 40-section design system spec + machine-readable `design-tokens.json`.
- Location: `docs/jarvis-design-system/`.

## ✅ Phase 2 — UI Foundation & Liquid Glass (complete)
- Vite + React + TypeScript migration, Tailwind + CSS-variable token pipeline.
- Theme engine (dark/light/system, density, contrast, adaptive glass).
- Liquid Glass foundation (adaptive blur + solid fallback).
- Core UI library (~40 components across primitives / composites / data).
- Window shell (Sidebar, TopBar, StatusBar, CommandPalette, SearchOverlay, NotificationCenter, Dock, WindowFrame, WorkspaceContainer, QuickSettings, VoiceOrb, AppShell).
- Design System Showcase route; lint/typecheck/build green.

## 🔜 Phase 3 — Application Shell & Navigation (next)
- Router + persistent app shell wiring (React Router).
- Module registry & navigation architecture (module → workspace → view → item).
- Global command/search state, keyboard-shortcut manager, theming persistence across routes.
- Right-panel/context system + responsive shell (rail → drawer breakpoints).

## Phase 4 — Home / Command Center
- Dashboard "Command Center" with vitals, focus, "Jarvis Suggests", module grid.

## Phase 5 — AI Chat
- Document-style intelligence thread, streaming, composer, tools, citations, memory.

## Phase 6 — Voice Assistant
- Full voice overlay, wake word, live transcript, intent chips (VoiceOrb already built).

## Phase 7+ — Feature Modules
- Memory System, Knowledge Graph, Universal Search, Workspaces, Projects, Notes, Tasks,
  Calendar, File Management, AI Workspace, Google Workspace, Plugin & MCP platforms,
  AI Agents, System Automation, Diagnostics, Settings, Performance Monitoring.

## Cross-cutting (ongoing)
- Backend/API integration, auth, real data.
- Component tests + Storybook, visual regression.
- Performance budgets (code-splitting the current single chunk), i18n, telemetry.
