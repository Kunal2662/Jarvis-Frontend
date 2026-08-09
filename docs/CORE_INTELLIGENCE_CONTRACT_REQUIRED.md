# Required from JARVIS Core — Intelligence Contract

**Status:** ⛔ Not available yet. The Intelligence UI is wired to a pluggable
`IntelligenceService` seam
(`frontend/src/features/intelligence/intelligenceService.ts`). The default
adapter is a **static frontend mock** (`adapters/mockIntelligenceAdapter.ts`)
that returns a fixed, hand-seeded list of pre-computed insight objects — the
exact same list on every call. Nothing is scored, ranked, or otherwise
computed client-side (M10B — Intelligence Layer is a Core capability; the
roadmap explicitly says "do not recreate ... Intelligence logic in React"). A
`core` adapter stub exists (`adapters/coreIntelligenceAdapter.ts`) but is
intentionally unimplemented — **no Core intelligence endpoint has been
invented.**

Once Claude Code ships the real Core Intelligence API, implement `getInsights`
(and any additional methods Core's contract requires — see below) on
`coreIntelligenceService`, set `ready: true`, and select it with
`VITE_INTELLIGENCE_BACKEND=core`. **No IntelligencePage/UI changes should be
required for the display path** — the page renders entirely against the
`Insight` / `InsightCategory` / `InsightTone` types already defined in
`intelligenceService.ts`.

Intelligence is intentionally a **read-only display/consume surface**: the
current `IntelligenceService` interface has only `getInsights` — no
dismiss/acknowledge/create method. Core owns computing and (eventually)
tracking insight state; adding scoring or state-mutation logic here would
mean recreating Core's Intelligence Layer in React.

## What the frontend adapter needs to map (`IntelligenceService` interface)

- `getInsights(signal?) → Insight[]`

Each `Insight` carries: `title`, `description`, `category`
(`automation | usage | system | suggestion`), `tone`
(`info | suggestion | warning`), `generatedAt`, and optional
`relatedPath`/`relatedLabel` for a display-only navigation link (e.g. "Review
automations" → `/automations`).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path (or other transport, e.g. SSE/WebSocket for
   push) for fetching current insights — e.g. `GET /api/v1/intelligence/insights`?
   Is the full set returned per request, or paginated?
2. **Insight taxonomy**: what are the canonical category and tone/severity
   identifiers Core actually returns? The frontend's `InsightCategory`/
   `InsightTone` unions must be extended to match exactly — no invented
   categories.
3. **Dismiss/acknowledge**: does Core support marking an insight as
   dismissed/acknowledged/read, and is that state persisted server-side
   (so it stays dismissed across sessions/devices)? What's the endpoint and
   payload (e.g. `POST /api/v1/intelligence/insights/{id}/dismiss`)? The
   current frontend has intentionally shipped **no dismiss UI** until this is
   answered, to avoid faking persistence with client-only local state.
4. **Subscribe to new insights**: does Core push new insights in real time
   (SSE/WebSocket), or does the frontend need to poll? What's the expected
   polling interval or reconnect behavior if push is supported?
5. **Insight lifecycle**: do insights expire or get superseded (e.g. the
   "3 automations haven't run in 2 weeks" insight should presumably
   disappear once one of them runs)? Is that recomputed by Core on a
   schedule, on-demand, or event-triggered?
6. **Related-entity links**: does each insight carry a structured reference
   to the entity it's about (e.g. specific automation IDs), or only a
   free-text description? The current mock's `relatedPath`/`relatedLabel` is
   a simple frontend-only navigation convenience — should this become a
   structured `relatedEntity: { type, id }` once Core defines it?
7. **Personalization/scope**: are insights computed per user/session? What
   auth is required, and does it differ from the Chat/Automations/Knowledge
   endpoints already in use?
8. **Error taxonomy**: structured error codes vs. free-text, and which are
   safe to surface directly in the page's error state?
9. **Rate/volume expectations**: roughly how many insights should the
   frontend expect at once, so the list UI (currently a plain card grid, no
   pagination) is designed appropriately?

Until these are provided, the static mock adapter remains the only verified
frontend behavior and stays the default. Do not present it as production Core
intelligence — it only ever serves a fixed, hand-seeded insight list held in
this frontend's memory, never a real computed signal.
