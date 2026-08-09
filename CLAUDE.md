# JARVIS Frontend — Agent Instructions

## Project

This is the NEW JARVIS frontend checkpoint.

It is separate from the older frontend inside the main `Jarvis-OS` repository.

The frontend is intended to become the presentation layer for the existing JARVIS Core.

## Mandatory reading

Before implementing anything, read:

- `docs/JARVIS_CORE_MILESTONES.md`
- `docs/JARVIS_FRONTEND_ARCHITECTURE.md`
- `docs/JARVIS_CORE_FRONTEND_MAPPING.md`
- `docs/FRONTEND_IMPLEMENTATION_ROADMAP.md`
- `docs/FRONTEND_CONTINUATION_GUIDE.md`

## Rules

1. Do not invent Core APIs.
2. Do not duplicate backend intelligence.
3. Do not create a second AgentOrchestrator.
4. Do not create a second planner/tool executor/permission engine.
5. Reuse the existing design system.
6. Inspect existing code before creating new components.
7. Implement only the explicitly approved task.
8. Keep changes narrowly scoped.
9. Preserve working Home, Chat and Voice unless the task explicitly changes them.
10. Do not claim future Core milestones are implemented.
11. Use explicit placeholder/unavailable states for unsupported capabilities.
12. Run relevant tests and builds after changes.
13. Do not commit or push unless explicitly requested.

## Architecture boundary

```text
Frontend UI
  ↓
Feature state / services
  ↓
HTTP / SSE / WebSocket
  ↓
JARVIS Core
```

The Core owns intelligence and orchestration.

The frontend owns presentation and interaction.

## Current major Core alignment

- M10: AI Orchestrator — active/partial; real AgentOrchestrator exists.
- M10A: Search & Knowledge — complete.
- M10B: Intelligence Layer — complete.
- M10.5: MCP & Integrations — complete.
- M11: Workspace & Productivity — active.
- M12: Smart Home & IoT — active; Smart Home Core, Connectivity, Home Assistant and MQTT slices are shipped.
- M22: Distribution/Desktop — active; build verification remains relevant.

See the milestone document for the detailed snapshot.

## Credit discipline

Use:

```text
READ → VERIFY → PLAN ONE TASK → IMPLEMENT → TEST → STOP
```

Avoid broad audits, broad refactors and unrelated dependency changes.

## Git

Do not commit or push without explicit approval.

## If the Core contract is unclear

Do not guess. Inspect the Core contract or report the dependency and stop.
