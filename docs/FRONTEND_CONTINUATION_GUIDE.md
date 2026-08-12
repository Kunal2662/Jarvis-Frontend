# JARVIS Frontend Continuation Guide

## Purpose

This file exists so a new Emergent workspace, Emergent account, Claude Code session, Cursor session, or another coding agent can continue the JARVIS frontend without rediscovering the project.

## Read these files first

Before making changes, read in this order:

1. `docs/JARVIS_CORE_MILESTONES.md`
2. `docs/JARVIS_FRONTEND_ARCHITECTURE.md`
3. `docs/JARVIS_CORE_FRONTEND_MAPPING.md`
4. `docs/FRONTEND_IMPLEMENTATION_ROADMAP.md`
5. `README.md`

## Project identity

This is the **NEW JARVIS frontend checkpoint**.

It is NOT the old frontend inside the main `Jarvis-OS` repository.

The frontend is intended to become the modern presentation layer for JARVIS Core.

## Current stop point

Per the authoritative continuation state in `docs/FRONTEND_PROGRESS.md` (§11):

**LAST COMPLETED FRONTEND STEP:** Step 21 — Developer Mode. Per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Developer Mode ("Expose real diagnostics/events only"), this step is a presentation/control layer over capabilities that already exist — not a second orchestration/permission/execution system, no invented Core/MCP endpoint, no real hardware access. It owns exactly one new real, `SettingsService`-backed preference — `developerModeEnabled`, additive to the Step 19 seam — with a genuine, verifiable effect: when on, `AppLayout.tsx`'s Command Palette "Go to" group includes `app/modules.tsx`'s `developerModules` (currently just the pre-existing Design System page, `/design`) — a selector that existed, unused, since Step 2. `/design` was always reachable by direct URL either way; the toggle only controls *discoverability* via ⌘K. A new Settings → Developer tab hosts the toggle plus a "System registry" summary card that reads the Step 20 `DiagnosticsService` seam and links to `/diagnostics`, reusing rather than duplicating that data. No verified Core Developer Mode contract exists — see `docs/CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md`.

**NEXT FRONTEND STEP:** Global Command Center (`docs/FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 9, item 22 — the next unstarted item now that item 21 Developer Mode is complete. This begins a new phase — "Make Chat, Voice, Search, Productivity, Smart Home and Integrations behave as one assistant experience" — re-read the architecture docs and verify scope before implementing.).

Do not start the Global Command Center automatically when merely reading this document — wait for explicit approval/instruction, and re-read `docs/FRONTEND_PROGRESS.md` first.

## Golden rules

### 1. Do not rebuild existing work

The project already contains a design system, App Shell, Home, Chat and Voice.

Inspect before replacing.

### 2. Core is the source of truth

If a capability belongs to JARVIS Core, integrate with the real Core contract.

Do not recreate it in React.

### 3. Never invent APIs

If the API/event contract is unknown:

- inspect the Core
- document the dependency
- stop or use a clearly marked placeholder

Never invent an endpoint just to make a UI work.

### 4. One task at a time

Use:

```text
READ → VERIFY → PLAN → IMPLEMENT → TEST → REVIEW → STOP
```

Do not implement multiple roadmap steps in one request unless explicitly approved.

### 5. Preserve architecture

Reuse:

- design-system primitives
- existing patterns
- AppShell
- WorkspaceContainer
- CommandPalette
- existing feature structure
- existing API/client conventions

Avoid duplicate components.

### 6. Don't duplicate AI logic

The Core owns:

- intent
- context
- planning
- tool selection
- permissions
- execution
- orchestration
- provider logic

The frontend owns:

- presentation
- interaction
- local UI state
- streaming display
- navigation
- user controls

### 7. Don't fake backend functionality

If Core is not ready, use:

- placeholder
- disabled state
- unavailable state
- explicit development-only mock

Never present a mock as production Core capability.

## Credit conservation

This project may be developed using limited Emergent credits.

Therefore:

- avoid broad audits when a targeted check is sufficient
- avoid unnecessary dependency changes
- avoid large refactors
- avoid regenerating the whole project
- avoid rebuilding working components
- don't run expensive work without a reason
- make changes in small, reviewable units

## Testing

After meaningful changes, run the smallest relevant validation first.

Then run broader checks when the task warrants them:

- TypeScript
- lint
- Vitest
- production build

For Core integrations, verify the actual contract and failure states.

## Git discipline

Do not commit or push unless explicitly requested.

Before a commit:

- inspect diff
- verify only intended files changed
- verify tests/build
- confirm no secrets
- confirm no generated noise
- confirm no unrelated refactoring

## Core milestone synchronization

The milestone documents are snapshots.

If Core advances, update:

1. `JARVIS_CORE_MILESTONES.md`
2. `JARVIS_CORE_FRONTEND_MAPPING.md`
3. `FRONTEND_IMPLEMENTATION_ROADMAP.md`

Do not silently change milestone status based on assumptions.

## Current priority

The planned order begins:

1. Single Workspace — done
2. Navigation & Routing — done
3. Global UI Infrastructure — done
4. Chat → AgentOrchestrator — frontend seam done, Core integration pending
5. Voice → AgentOrchestrator — frontend seam done, Core integration pending
6. Automations — frontend done (mock adapter), Core integration pending
7. Search — frontend done (mock adapter), Core integration pending
8. Knowledge + Intelligence — frontend done (local/static mock adapters), Core integration pending
9. AI Apps + Integrations — frontend done (in-memory mock adapter, one combined MCP-tool + connector catalog surface), Core integration pending
10. M11 Productivity — Notes, Tasks + Projects, Calendar, Files + Workspace — frontend done (four independent in-memory mock adapters), Core integration pending
11. M12 Smart Home — Smart Home Command Center (Step 13) + Device Management (Step 14) + Home Assistant + MQTT (Step 15) — frontend done in full (in-memory mock adapters, normalized room/device/scene entities, additive `updateDevice`/`removeDevice`/`pairDevice` + health/diagnostics on the `SmartHomeService` seam, plus a new `ConnectorService` seam for connector status/config/diagnostics), Core/Home Assistant/MQTT integration pending
12. Memory — frontend done (in-memory mock adapter, read-only recall list + detail + forget via a new `MemoryService` seam), Core memory integration pending
13. Agents — frontend done (in-memory mock adapter, observability + local enable/disable via a new `AgentService` seam, no run/execute action per "no second agent framework"), Core AgentOrchestrator integration pending (Step 17)
14. Settings — frontend done (one real `SettingsService`-backed preference, `notificationsEnabled`, persisted to `localStorage`; every other tab reads an existing feature's own service directly), Core settings/preferences integration pending
15. Diagnostics + Performance — frontend done (honest local introspection of every other feature's own adapter status via a new `DiagnosticsService` seam; real, live browser-Performance-API metrics; Core health is an explicit permanent "unavailable" state, not a mock, since the underlying Core milestone M13B has not started), Core Self-Healing & Observability (M13B) integration pending
16. Developer Mode — frontend done (one new real `SettingsService`-backed preference, `developerModeEnabled`; a real Command Palette discoverability gate over the pre-existing, previously-unused `developerModules` selector; a Settings → Developer tab summarizing the Step 20 `DiagnosticsService` registry rather than duplicating it), no Core dependency for what was built — see `docs/CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md` for what a future, deeper Core-connected version would need ← just completed (Step 21); next up is the Global Command Center (Phase 9, item 22)

Only proceed to the next item after the previous one has been reviewed.

## Important development-backend note

The uploaded frontend checkpoint includes an Emergent-compatible FastAPI development backend and `/api/chat/stream`.

That backend is useful for frontend development, but it is not the final JARVIS Core.

Do not silently replace it or claim it is the complete Core.

## Completion standard

A frontend feature is not considered complete merely because the UI renders.

For Core-backed features, completion means:

- correct Core mapping
- real contract integration
- loading state
- empty state
- error state
- unavailable/permission state where relevant
- cancellation/reconnect handling where relevant
- tests
- production build compatibility

## If uncertain

Stop and report the uncertainty.

Do not guess.
