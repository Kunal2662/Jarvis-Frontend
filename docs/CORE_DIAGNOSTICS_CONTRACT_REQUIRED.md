# Required from JARVIS Core — Diagnostics Contract

**Status:** ⛔ Not available yet — and further behind than every other
`CORE_*_CONTRACT_REQUIRED.md` in this checkpoint. Per
`docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Diagnostics:

> `| Diagnostics | M13B/future observability | 🔴/future | 🔴/placeholder |
> Do not pretend future Core exists. |`

and `docs/JARVIS_CORE_MILESTONES.md`:

> `| M13B — Self-Healing & Observability | 🔴 Not Started | Future
> capability. |`

Every other frontend surface in this checkpoint (Search, Memory, Agents,
Settings, Smart Home, …) maps to a Core milestone that is at least
partially active or "verify" status — the Core capability exists in some
form, only the concrete API contract is unverified. **Diagnostics is
different: the underlying Core milestone (M13B) has not started at all.**
There is no self-healing engine, no health-reporting pipeline, and no
observability API anywhere in JARVIS Core to integrate against yet.

## What this frontend pass actually built

Because there is no Core capability to consume, the Diagnostics UI
(`frontend/src/features/diagnostics/`) does **not** simulate one. It is
wired to a pluggable `DiagnosticsService` seam
(`diagnosticsService.ts`) with two methods:

- `getSystemStatus()` — **not fabricated data.** The default
  (`adapters/mockDiagnosticsAdapter.ts`) adapter introspects this
  frontend's own, already-real adapter registry: it calls every other
  feature's own `getXService()` accessor (Chat, Voice, Automations,
  Knowledge, Intelligence, AI Apps, Notes, Tasks, Calendar, Files, Smart
  Home, Home Assistant, MQTT, Memory, Agents, Settings, Search, Home) and
  reads each one's real `id`/`label`/`ready` fields — the same fields
  `features/settings/sections/AboutSection.tsx` already surfaces for a
  curated subset. This is honest: it reports which backend each feature
  is actually running on right now, never a fabricated CPU/memory/uptime
  number.
- `getCoreHealth()` — always returns `{ available: false, milestone:
  'M13B', message: '...' }`. This is not a stub waiting to be filled in
  with fake data; it is the honest, permanent answer until Core ships
  M13B.

A `core` adapter stub exists (`adapters/coreDiagnosticsAdapter.ts`) but is
intentionally unimplemented — both methods reject with
`CoreDiagnosticsContractUnavailableError`.

**Frontend-only performance metrics** (`performanceMetrics.ts`) are
deliberately **not** part of this adapter seam at all. They read directly
from this browser tab's own `Performance` API (navigation timing, resource
count, and Chromium's non-standard `performance.memory` where available).
This is real, live data with no Core dependency — the same way
`AboutSection` reads `pkg.version` directly rather than through a service —
and it will never come from Core; see
`docs/JARVIS_FRONTEND_ARCHITECTURE.md` §10, which frames performance as a
frontend engineering discipline, not a Core-delivered dataset.

## What the frontend adapter needs to map (`DiagnosticsService` interface)

- `getSystemStatus(signal?) → SystemComponentStatus[]` — `{ key, name,
  backendId, backendLabel, ready }` per feature seam
- `getCoreHealth(signal?) → CoreHealthSnapshot` — `{ available, milestone,
  message }`

Once Claude Code ships JARVIS Core's Self-Healing & Observability
milestone (M13B), implement `getCoreHealth` (and, if Core also wants to
report on its own view of each subsystem's health, `getSystemStatus`) on
`coreDiagnosticsService`, set `ready: true`, and select it with
`VITE_DIAGNOSTICS_BACKEND=core`. No `DiagnosticsPage` UI changes should be
required for `getSystemStatus` (it already renders generically over
`SystemComponentStatus[]`), but the Core Health card's copy is written
specifically for the "unavailable" case and will need a real "available"
rendering path added once real data exists.

## Open questions for JARVIS Core (unanswered — do not guess)

1. **Scope of M13B**: what does "Self-Healing & Observability" actually
   report — process-level CPU/memory/uptime for the Core process itself,
   per-subsystem health (AgentOrchestrator, Search, Smart Home connectors,
   etc.), self-healing/recovery events, or some combination?
2. **Transport**: REST polling, WebSocket push, or Server-Sent Events for
   live health updates? Does it mirror
   `SmartHomeService.subscribeToDeviceState`'s realtime pattern?
3. **Relationship to per-feature `ready` flags**: once Core exists, should
   `getSystemStatus` still report each frontend feature's own adapter
   state (as it honestly does today), or should it be replaced/augmented
   by Core's own view of which of its subsystems are healthy? These are
   not necessarily the same thing — a feature's frontend adapter can be
   `ready` (its mock/local surface works) while the Core capability behind
   it is still not integrated.
4. **Self-healing actions**: does Core expose any user-visible self-healing
   *events* (e.g. "restarted the search index", "recovered from a
   connector timeout") this UI should list as a timeline, or is
   self-healing entirely internal/invisible to the frontend?
5. **Errors and thresholds**: does Core define health thresholds/alert
   levels (e.g. "degraded" vs "down"), or is health binary
   (available/unavailable)?
6. **Permissions**: is diagnostics data visible to every user, or gated
   behind Developer Mode / an advanced audience tier (see
   `app/modules.tsx`'s `Audience` type)?

Until these are answered, `getSystemStatus`'s local adapter-registry
introspection and `getCoreHealth`'s explicit "unavailable" response remain
the only verified frontend behavior. Do not build a real self-healing or
observability engine against this seam — nothing in JARVIS Core is
contacted anywhere in this frontend, and no number shown on this page is a
live view into Core's health.
