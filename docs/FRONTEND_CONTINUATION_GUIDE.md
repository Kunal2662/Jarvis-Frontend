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

**LAST COMPLETED FRONTEND STEP:** Step 15 — Home Assistant + MQTT (`/smart-home/integrations`, extending the Smart Home area with a new `ConnectorService` seam — `smartHomeIntegrationService.ts`, one independent mock/Core-stub adapter pair per connector). Connector status/configuration/diagnostics only: connect/disconnect/reconnect, a masked `CredentialState` (never a raw credential), and a `syncEntities()` preview normalized into the existing `DeviceType`/`DeviceCapability` vocabulary that is deliberately never merged into the Smart Home Command Center's live device list. No real Home Assistant/MQTT handshake happens anywhere in this frontend. Reached via a new "Integrations" action on the Command Center header, alongside "Manage devices". No verified Core contract was found in this repository — see `docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md`. This completes roadmap Phase 6 / M12 Smart Home & IoT (items 13-15) as a frontend surface.

**NEXT FRONTEND STEP:** Step 16 — Memory (`docs/FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 7, item 16 — the next unstarted item after M12 Smart Home & IoT completed. Item 16's own status note flags it "contract verification required" — verify the real Core Memory contract before implementing, per the roadmap's standing rule.).

Do not start Step 16 automatically when merely reading this document — wait for explicit approval/instruction, and re-read `docs/FRONTEND_PROGRESS.md` first.

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
11. M12 Smart Home — Smart Home Command Center (Step 13) + Device Management (Step 14) + Home Assistant + MQTT (Step 15) — frontend done in full (in-memory mock adapters, normalized room/device/scene entities, additive `updateDevice`/`removeDevice`/`pairDevice` + health/diagnostics on the `SmartHomeService` seam, plus a new `ConnectorService` seam for connector status/config/diagnostics), Core/Home Assistant/MQTT integration pending ← just completed (Step 15); M12 is now fully built as a frontend surface, next up is Step 16 (Memory)

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
