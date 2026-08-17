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

**THE FRONTEND FEATURE ROADMAP IS COMPLETE AND FROZEN.** Step 26 — Final
QA + Frontend Freeze — was the last planned frontend milestone. Read
`docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md` before doing anything else in
this repository — it is the authoritative starting point for the next
phase, not this section.

Per the authoritative continuation state in `docs/FRONTEND_PROGRESS.md` (§11):

**LAST COMPLETED FRONTEND STEP:** Step 26 — Final QA + Frontend Freeze. A production-readiness audit, not new functionality. Complete, repository-verified route inventory (18 routes + Voice's overlay action, all 17 `modules.tsx` entries `live`/`ready`); functional/responsive (all 7 required viewports, zero overflow across 18 routes)/accessibility/visual-identity/performance regression against Steps 23–25's baselines — every one held; a security/privacy audit found no hardcoded secrets anywhere, and the one credential-shaped UI (Home Assistant/MQTT connector secret field) is confirmed write-only and never stored/logged/displayed/searched/diagnosed; a Core-boundary audit enumerated all 19 service/adapter seams against their `CORE_*_CONTRACT_REQUIRED.md` docs. Live QA surfaced and fixed four real defects (three of them user-reported mid-step): an empty "Coming soon" Command Palette heading with zero items underneath (every module reached `live` by Step 16, but the group was never omitted when empty); Modal/CommandPalette/SearchOverlay's shared open animation rendering off-center for its full 220ms because the `scale-in` keyframes silently overrode the dialogs' centering translate (fixed with a new `centered-scale-in` keyframe carrying the translate through every frame, kept separate from the shared `scale-in` keyframe since 4 other components rely on it with Radix's own popper-positioning transform); a missing explicit focus-ring suppression on the Command Palette's search input; a visible native scrollbar on Settings' tab strip (fixed with the project's existing `.scrollbar-none` utility). Two new handoff documents were produced: `docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md` and `docs/FRONTEND_TECHNICAL_DEBT_REGISTER.md` (nothing found at CRITICAL or HIGH severity). Final gates: typecheck clean, 560/560 tests across 76 files, lint clean except the pre-existing unrelated `.storybook/preview.tsx` issue, production build succeeds (main chunk 433.66 kB / 125.34 kB gzip, matching Step 25's baseline).

**NEXT PHASE (not a frontend step):** JARVIS Core completion + ecosystem integration — authentication, sessions, RBAC, Credential Manager, AI Provider Registry, Tool Registry, Permission Engine, Execution Engine, Core contracts, Frontend↔Core/Android↔Core/Home↔Core wiring, Smart Home/device execution, Memory, Knowledge, Agents, Automations, realtime, reliability, security, recovery, M19.11 Administration & Lifecycle, M28 Infrastructure/Cloud Management. Start from `docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md`.

Do not start a new frontend milestone automatically when merely reading this document — the roadmap is frozen; only proceed on explicit user approval to reopen it.

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
19. Responsive + Accessibility — frontend done (a hardening pass across desktop/tablet/mobile viewports, keyboard/focus, semantics, touch targets, and reduced motion — zero horizontal overflow found across all 17 routes × 7 required viewports; the majority of the app was already solid — Drawer/CommandPalette/SearchOverlay already height-bound, every interactive card already keyboard-accessible, a global `prefers-reduced-motion` CSS rule already covers CSS animations app-wide; three real gaps fixed: `ModalContent` now caps at `max-h-[85vh] overflow-y-auto` — was a confirmed live bug where tall forms could push their footer actions entirely off-screen and unreachable on mobile; `Toast` now respects `prefers-reduced-motion` like every other Framer Motion consumer; added a skip-to-main-content link to `AppShell`), no Core dependency, no feature behavior changed
20. Performance Engineering — frontend done (a measurement-first pass — baselined the production build at 624.47 kB main JS chunk / 162.60 kB gzip, every one of the 18 routed pages statically imported into it regardless of which was visited; audited render/timer/listener/search/asset performance and found the large majority already correct — cached service singletons, self-cleaning timers/listeners, subscriber-gated Smart Home polling, `Promise.all` search fan-out; the one measured fix: the 15 non-primary-nav routes are now `React.lazy` + `Suspense`, cutting the main chunk to 433.52 kB / 125.31 kB gzip, −30.6%/−22.9%), no Core dependency, no feature behavior changed
21. Final QA + Frontend Freeze — frontend done (a production-readiness audit — complete route inventory, functional/responsive/accessibility/visual-identity/performance regression against Steps 23–25's baselines all held, a security/privacy audit found no hardcoded secrets, a Core-boundary audit enumerated all 19 service seams; four real defects found and fixed via live QA — an empty Command Palette "Coming soon" group, an off-center popup-open animation, a missing Command Palette focus-ring suppression, a visible Settings tab scrollbar; added `docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md` and `docs/FRONTEND_TECHNICAL_DEBT_REGISTER.md`), no Core dependency, no feature behavior changed ← just completed (Step 26). **This is the last planned frontend roadmap item — the frontend feature roadmap is FROZEN.**

**Do not proceed to a "next item" — there is none.** The next phase is JARVIS Core completion + ecosystem integration (see `docs/FRONTEND_CORE_INTEGRATION_HANDOFF.md`), not a new frontend roadmap entry, unless the user explicitly approves reopening the frontend roadmap.

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
