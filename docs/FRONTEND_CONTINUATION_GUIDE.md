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

**LAST COMPLETED FRONTEND STEP:** Step 24 — Responsive + Accessibility. A hardening pass, not new product functionality. Audited horizontal-overflow behavior across all 17 live routes at all 7 required viewports (1440×900 down to 375×812) plus Modal/Drawer/CommandPalette/SearchOverlay geometry, touch-target sizing, keyboard activation patterns, and reduced-motion coverage — the large majority was already solid (zero horizontal overflow anywhere; Drawer/CommandPalette/SearchOverlay already height-bound with internal scroll; every interactive card already uses real `role="button"` + `tabIndex={0}` + Enter/Space `onKeyDown`, no non-semantic clickable `div`s; a global `prefers-reduced-motion` CSS rule already covers every CSS-driven animation/transition app-wide). Three genuine gaps were found and fixed: (1) `ModalContent` had no max-height/scroll, so a tall `size="lg"` form (Automations/Calendar/Tasks/Notes/Device-pairing) could render taller than the viewport with its Save/Cancel buttons entirely unreachable — confirmed live at 375×812; fixed with `max-h-[85vh] overflow-y-auto` on the shared primitive. (2) `Toast` was the one Framer Motion consumer that didn't check `useReducedMotion` (VoiceOrb, Waveform, ActivityTimeline, ChatPage already did); fixed via an extracted `toastMotionProps(reduced)` helper. (3) Added a standard skip-to-main-content link in `AppShell` (WCAG 2.4.1) — no skip link existed before. Icon-button/Switch/Modal-close touch targets (36px/38×22px/32px) were reviewed and left as-is: all exceed the WCAG 2.5.8 AA minimum (24×24px), and the topbar has zero pixel headroom at 375px width to grow them further without reintroducing overflow. No feature behavior, mock data, or service seam changed.

**NEXT FRONTEND STEP:** Performance Engineering (`docs/FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 11, item 25 — the next unstarted item now that item 24 Responsive + Accessibility is complete — re-read the architecture docs and verify scope before implementing.).

Do not start Performance Engineering automatically when merely reading this document — wait for explicit approval/instruction, and re-read `docs/FRONTEND_PROGRESS.md` first.

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
16. Developer Mode — frontend done (one new real `SettingsService`-backed preference, `developerModeEnabled`; a real Command Palette discoverability gate over the pre-existing, previously-unused `developerModules` selector; a Settings → Developer tab summarizing the Step 20 `DiagnosticsService` registry rather than duplicating it), no Core dependency for what was built — see `docs/CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md` for what a future, deeper Core-connected version would need
17. Global Command Center — frontend done (two new Command Palette groups — `app/commandCenter.ts`'s `buildSearchGroup`/`buildSceneControlGroup` — composing the existing Universal Search overlay and the existing `SmartHomeService.triggerScene()` seam; no new page, no second search index, no second execution engine; existing "Go to"/"Coming soon"/"Actions" groups and the Developer Mode gate untouched), no Core dependency for what was built
18. JARVIS Visual Identity — frontend done (a visual-system consistency audit — logo clear-space, glow discipline, popup centering/geometry, typography, spacing — found everything already consistent except one real defect: `Waveform`, relocated into `design-system/patterns/Waveform/` alongside `VoiceOrb`, now reacts to the orb's real `VoiceState` via the newly-exported `stateColor` map instead of a fixed color + fully random motion; `VoiceOverlay.tsx` now flanks the real orb with the same reactive waves, closing the gap with Home's hero treatment), no Core dependency, no feature behavior changed
19. Responsive + Accessibility — frontend done (a hardening pass across desktop/tablet/mobile viewports, keyboard/focus, semantics, touch targets, and reduced motion — zero horizontal overflow found across all 17 routes × 7 required viewports; the majority of the app was already solid — Drawer/CommandPalette/SearchOverlay already height-bound, every interactive card already keyboard-accessible, a global `prefers-reduced-motion` CSS rule already covers CSS animations app-wide; three real gaps fixed: `ModalContent` now caps at `max-h-[85vh] overflow-y-auto` — was a confirmed live bug where tall forms could push their footer actions entirely off-screen and unreachable on mobile; `Toast` now respects `prefers-reduced-motion` like every other Framer Motion consumer; added a skip-to-main-content link to `AppShell`), no Core dependency, no feature behavior changed ← just completed (Step 24); next up is Performance Engineering (Phase 11, item 25)

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
