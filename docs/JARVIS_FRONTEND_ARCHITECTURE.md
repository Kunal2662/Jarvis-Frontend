# JARVIS Frontend Architecture

**Snapshot:** 2026-08-08  
**Frontend artifact:** `Jarvis-Frontend-main`  
**Role:** New JARVIS frontend / presentation layer for the JARVIS Core.

## 1. Architectural boundary

The frontend is a presentation and interaction layer.

```text
JARVIS FRONTEND
      |
      | HTTP / SSE / WebSocket
      v
JARVIS CORE
      |
      +-- AgentOrchestrator
      +-- Intent
      +-- Context
      +-- Planning
      +-- Tools
      +-- Permissions
      +-- Smart Home
      +-- Search / Knowledge
      +-- Integrations
      +-- Productivity
```

### Non-negotiable rule

**Frontend must not duplicate Core intelligence.**

Do not implement a second:

- Agent orchestrator
- planner
- tool executor
- permission engine
- model router
- memory engine
- smart-home protocol engine
- integration framework

The frontend consumes Core capabilities through real contracts.

## 2. Current frontend technology

The uploaded frontend checkpoint is:

- Vite 6
- React 18
- TypeScript
- Tailwind CSS 3
- React Router v6
- Framer Motion
- Radix UI
- Vitest
- Storybook
- Yarn

The ZIP also contains an Emergent-compatible FastAPI development backend.

## 3. Existing frontend architecture

Existing real areas include:

- `src/design-system/`
- primitives
- patterns
- composites
- data components
- `layouts/AppShell`
- theme provider
- `features/home/`
- `features/chat/`
- `features/voice/`
- module registry
- routing
- streaming chat client

Existing design-system patterns include:

- TopBar
- StatusBar
- Sidebar
- Dock
- CommandPalette
- VoiceOrb
- WindowFrame
- WorkspaceContainer

**Reuse these. Do not create competing primitives without a concrete reason.**

## 4. Target workspace model

The target JARVIS experience is a **Single Workspace / No-Sidebar-first** architecture.

The current ZIP still contains sidebar-centric navigation. Refactor incrementally rather than rewriting the entire shell.

Conceptually:

```text
+----------------------------------------------------+
| Top Bar / JARVIS status / global command           |
+----------------------------------------------------+
|                                                    |
|                 WORKSPACE                          |
|                                                    |
|       Current module / widgets / conversation     |
|                                                    |
+----------------------------------------------------+
| Status / Dock / contextual controls                |
+----------------------------------------------------+
```

The workspace should allow JARVIS capabilities to feel like one assistant, not disconnected applications.

## 5. Frontend layers

Recommended dependency direction:

```text
UI pages / widgets
        |
feature hooks / state
        |
frontend services / API clients
        |
HTTP / SSE / WebSocket
        |
JARVIS Core
```

Do not let UI components contain complex backend orchestration logic.

## 6. API and streaming rules

- Use a centralized API/service layer.
- Preserve SSE streaming behavior where it is already working.
- Use WebSocket/event contracts when the Core exposes them.
- Handle loading, empty, error, timeout, reconnect and cancellation states.
- Do not invent endpoints.
- Do not silently change backend semantics to make a UI work.

The ZIP's `/api/chat/stream` is a development checkpoint. The final Chat/Voice experience should integrate with the real JARVIS Core contracts.

## 7. State management

Keep server state, UI state and transient interaction state separate.

Avoid creating global state for data that belongs in a feature.

Prefer:

- feature-local state for UI interaction
- query/cache mechanisms for server data
- shared context only for truly global concerns
- event-driven updates for Core/WebSocket events

## 8. Widget architecture

JARVIS should use reusable widgets rather than hard-coded dashboards.

Potential widget categories:

- AI status
- tasks
- calendar
- activity
- system health
- smart home
- files
- knowledge
- automation
- notifications

Widgets must consume real data contracts.

## 9. Error and state model

Every meaningful Core-backed surface should support:

- loading
- ready
- empty
- error
- unavailable
- reconnecting
- permission denied
- partial data

Do not hide backend failures behind fake successful UI.

## 10. Performance principles

Performance is a release-quality feature.

Prioritize:

- fast startup
- lazy loading
- code splitting
- minimal React re-renders
- asynchronous operations
- efficient streaming rendering
- stable animations
- low CPU/RAM usage
- responsive navigation
- 60 FPS target for interactive UI where practical

Do not perform global optimization prematurely. Optimize feature boundaries as they are built, then perform a dedicated final performance pass.

## 11. Desktop/web distinction

The frontend ZIP is an Emergent-compatible web checkpoint. The main JARVIS Core project also has a Tauri desktop architecture.

Do not assume Emergent Preview represents the final desktop runtime.

Desktop-specific behavior must remain compatible with the actual JARVIS desktop architecture.

## 12. Implementation discipline

Use:

```text
READ
  ↓
VERIFY CORE CONTRACT
  ↓
PLAN ONE SMALL TASK
  ↓
IMPLEMENT
  ↓
TEST / BUILD
  ↓
REVIEW
  ↓
STOP
```

No broad rewrites. No unrelated refactoring. No invented backend functionality.
