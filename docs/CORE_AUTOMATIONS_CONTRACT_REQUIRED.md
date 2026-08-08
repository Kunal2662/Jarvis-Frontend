# Required from JARVIS Core — Automations Contract

**Status:** ⛔ Not available yet. The Automations UI is wired to a pluggable
`AutomationService` seam (`frontend/src/features/automations/automationService.ts`).
The default adapter is an **in-memory frontend mock**
(`adapters/mockAutomationAdapter.ts`) — nothing is persisted server-side and no
automation actually executes on a real schedule. A `core` adapter stub exists
(`adapters/coreAutomationAdapter.ts`) but is intentionally unimplemented —
**no Core automation endpoint has been invented.**

Once Claude Code ships the real Core automation API, implement each method on
`coreAutomationService`, set `ready: true`, and select it with
`VITE_AUTOMATIONS_BACKEND=core`. **No AutomationsPage/UI changes will be
required** — the page renders entirely against the `Automation` /
`AutomationTrigger` / `AutomationCondition` / `AutomationAction` /
`AutomationExecution` types already defined in `automationService.ts`.

## What the frontend adapter needs to map (`AutomationService` interface)

- `getAutomations(signal?) → Automation[]`
- `getAutomation(id, signal?) → Automation`
- `createAutomation(input: AutomationInput, signal?) → Automation`
- `updateAutomation(id, input: AutomationInput, signal?) → Automation`
- `deleteAutomation(id, signal?) → void`
- `setEnabled(id, enabled: boolean, signal?) → Automation`
- `pauseResume(id, action: 'pause' | 'resume', signal?) → Automation`
- `getExecutionHistory(id, signal?) → AutomationExecution[]`

Each `Automation` carries: `status` (`active | paused | failed | disabled`),
`trigger` (`schedule | event`), `conditions[]`, `actions[]`, `nextRun`/`lastRun`
timestamps, `lastResult`, and an `executionHistory[]` of
`{ timestamp, status, durationMs, result | error }`.

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST paths (or other transport) for list/get/create/update/
   delete/enable/pause/resume/history — e.g. `GET/POST /api/v1/automations`,
   `POST /api/v1/automations/{id}/pause`? Sync request/response or does
   creation/update return a pending job?
2. **Trigger model**: how are `schedule` (cron-like) and `event` triggers
   actually registered and evaluated by Core? What event names/topics exist for
   event-based triggers, and can the frontend enumerate them (for the create/edit
   form) rather than free-typing?
3. **Condition/action schema**: are conditions/actions structured (typed
   parameters per action kind) or free-text summaries as currently modeled? If
   structured, what are the concrete action types Core supports (notify,
   run-agent, device control, integration call, etc.) and their parameters?
4. **Execution semantics**: does Core execute automations itself on schedule,
   or does it only expose CRUD and expect something else to trigger runs? How is
   `nextRun` computed and surfaced?
5. **Execution history**: pagination/retention for `getExecutionHistory` — is
   history bounded, streamed, or fetched by time range?
6. **Real-time updates**: should the frontend poll, or does Core push
   automation/execution state changes (SSE/WebSocket) so the list can update
   live without a manual reload?
7. **Ownership/multi-user**: are automations scoped per user/session, and what
   auth is required?
8. **Error taxonomy**: structured error codes vs. free-text, and which are
   user-safe to display (e.g. a failed action's error message shown in
   execution history).
9. **Enable/disable vs. pause/resume**: does Core model these as the same
   underlying state, or distinct concepts (the frontend currently treats
   `disabled` as user-toggled-off and `paused` as pause/resume, both driving the
   same `enabled` flag)?

Until these are provided, the in-memory mock adapter remains the only verified
frontend behavior and stays the default. Do not present it as production Core
automation execution — nothing created or enabled through this UI today
actually runs on a schedule or has real-world side effects.
