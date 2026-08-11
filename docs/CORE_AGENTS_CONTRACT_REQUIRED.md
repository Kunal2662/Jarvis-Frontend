# Required from JARVIS Core — Agents Contract

**Status:** ⛔ Not available yet. The Agents UI is wired to a pluggable
`AgentService` seam (`frontend/src/features/agents/agentService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockAgentAdapter.ts`) — every agent's status and activity
history lives only in this browser tab's memory and is reset on reload.
**No real Core AgentOrchestrator is ever contacted anywhere in this
frontend.** A `core` adapter stub exists (`adapters/coreAgentAdapter.ts`)
but is intentionally unimplemented — **no Core Agents endpoint has been
invented.**

Once Claude Code ships the real Core Agents API, implement its methods on
`coreAgentService`, set `ready: true`, and select it with
`VITE_AGENTS_BACKEND=core`. **No `AgentsPage`/UI changes should be
required** — the page renders entirely against the `Agent` / `AgentRun`
types already defined in `agentService.ts`.

## Scope of this frontend surface — a critical architectural constraint

Per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Agents:

> `| Agents | M10 | 🟡 Active | 🔴/placeholder | Expose existing
> orchestration; no second agent framework. |`

This is the single most load-bearing sentence for this step's scope, and
it changes what "Agents" means here in an important way. Every other
mention of "agent" in this checkpoint's docs
(`JARVIS_CORE_MILESTONES.md`'s M10 "AI Orchestrator", `CLAUDE.md`'s "do
not create a second AgentOrchestrator", `JARVIS_FRONTEND_ARCHITECTURE.md`'s
"do not implement a second... agent orchestrator") ties "agent" to the
**single, existing `AgentOrchestrator`** that already powers Chat and
Voice (Steps 4-5) — not to a catalog of independent, user-invokable
autonomous services. Corroborating evidence:

- The old v1 frontend's `/agents` route already redirects to `/chat`
  (`app/modules.tsx`'s Chat entry, `redirectFrom: ['/agents']`, prior to
  this step) — Agents and Chat were already treated as views onto the same
  underlying orchestrator.
- `Automation.actions` (`features/automations/automationService.ts`)
  already includes a `'run-agent'` action type — i.e. "running an agent"
  is a Core-owned consequence an *Automation* can trigger, not something
  this Agents surface hands the user a button to fire directly.
- The Home dashboard's existing "Active agents" stat
  (`features/home/adapters/mockHomeAdapter.ts`) and its "AI Timeline"
  entries (e.g. "Research Agent completed a market brief") are flavor-text
  mock data illustrating named *roles/labels* the orchestrator uses when
  reporting what it did — not a registry of independently-executable
  services.

**Given this, this frontend pass implements Agents as an observability +
lightweight state-management surface, never an execution surface:**

- Browsing a small set of named agent *roles* the orchestrator exposes —
  status (active/idle/disabled), description, capabilities — and each
  one's recent activity history.
- A detail view per agent showing the same information plus its full
  activity/run history.
- Enabling/disabling an agent role — a simple state toggle, mirroring
  Automations' `setEnabled`, not an execution action.

Specifically **out of scope** for this frontend pass, by design:

- **A manual "Run agent" / execute action.** Per the mapping doc's "no
  second agent framework" rule, this frontend never simulates an LLM
  planning/execution loop, and never lets a user directly fire an
  autonomous run the way `Automation.actions` already models as a
  Core-owned consequence. Activity history here is always already-resolved
  past activity (`completed` / `failed`), never a live `queued` /
  `running` state this UI itself initiated.
- **A second chat interface.** Agents are not Chat — no message
  composer, no streaming response, no conversation thread. That
  surface already exists (Steps 4-5) and is not rebuilt here.
- **Agent creation/configuration.** The seeded agent roles are a fixed
  set (mirrors how Steps 13-15 kept Smart Home's rooms/devices fixed) —
  there is no "add a new agent" flow, since defining new orchestrator
  capabilities is a Core-side concern, not a frontend one.
- **Real permission enforcement.** No second permission system is built;
  the eventual production flow remains User → Agents UI → Core →
  Permission Engine → Execution Engine → Agent runtime, exactly as for
  every other Core-owned capability in this frontend.

## What the frontend adapter needs to map (`AgentService` interface)

- `getAgents(signal?) → Agent[]` — `{ id, name, description, status,
  capabilities, lastRunAt? }`
- `getAgent(id, signal?) → Agent`
- `getRuns(agentId, signal?) → AgentRun[]` — `{ id, agentId, status,
  startedAt, completedAt, summary }`, newest first
- `setEnabled(id, enabled, signal?) → Agent` — a local state toggle in the
  mock, never a real Core call

## Open questions for JARVIS Core (unanswered — do not guess)

1. **Agent identity**: does Core actually expose a stable, named registry
   of "agent roles" the orchestrator can adopt (as this mock assumes), or
   is "agent" purely an internal planning-stage label with no
   frontend-stable identity at all? If the latter, this entire surface's
   premise needs revisiting once a real contract exists.
2. **Relationship to Chat/Voice**: is Agents activity actually a filtered
   view of the same conversation/task history Chat already has access to,
   or a genuinely separate data source? Should selecting an agent's
   activity entry deep-link into the originating Chat conversation?
3. **Relationship to Automations**: given `Automation.actions` already
   includes a `'run-agent'` type, does triggering that automation action
   produce an entry in this surface's run history? If so, what's the
   correlation id between an `AutomationExecution` and an `AgentRun`?
4. **Enable/disable semantics**: does disabling an agent role actually
   prevent the orchestrator from adopting that role/label, or is it purely
   informational? What happens to an in-flight task if its agent role is
   disabled mid-run?
5. **Endpoint(s)**: REST/WebSocket path(s) for list-agents/get-agent/
   list-agent-runs/set-enabled — and whether agent activity is ever
   pushed in realtime (mirroring `SmartHomeService.subscribeToDeviceState`)
   or only polled.
6. **Permissions**: does enabling/disabling an agent role require the same
   Permission Engine gate as a real device command, or is it a lower-risk
   preference-level toggle?
7. **Errors**: structured error codes vs. free-text, and which are safe to
   surface directly.

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as a
real, live view into Core's orchestrator, and do not build a real agent
execution/planning system against it — nothing this UI does today reaches
Core, and no activity shown here reflects a real conversation or task.
