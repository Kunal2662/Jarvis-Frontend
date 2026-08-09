# Required from JARVIS Core — Calendar Contract

**Status:** ⛔ Not available yet. The Calendar UI is wired to a pluggable
`CalendarService` seam (`frontend/src/features/calendar/calendarService.ts`).
The default adapter is an **in-memory frontend mock**
(`adapters/mockCalendarAdapter.ts`) — everything you create, edit, or delete
lives only in this browser tab's memory and is lost on reload. Nothing is
persisted server-side. A `core` adapter stub exists
(`adapters/coreCalendarAdapter.ts`) but is intentionally unimplemented —
**no Core Calendar endpoint has been invented.**

Once Claude Code ships the real Core Calendar API, implement each method on
`coreCalendarService`, set `ready: true`, and select it with
`VITE_CALENDAR_BACKEND=core`. **No CalendarPage/UI changes will be
required** — the page renders entirely against the `CalendarEvent` /
`CalendarEventInput` types already defined in `calendarService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 5, item 11 "Calendar") and `JARVIS_CORE_MILESTONES.md`
(M11 — Intelligent Workspace & Productivity — 🟡 Active / Not fully closed,
i.e. **not** claimed complete the way M10A/M10B/M10.5 were for Steps 9-11),
Calendar is user-authored content: the frontend owns full local CRUD while
no real Core contract exists, the same shape as Notes/Tasks.

This is **JARVIS's own local/Core-owned calendar surface** — it is
deliberately NOT a Google Calendar or Microsoft 365 client. Third-party
calendar *connectors* already exist as separate AI Apps catalog entries
(Step 11, `features/aiApps/adapters/mockAiAppsAdapter.ts`, e.g. "Google
Calendar"), representing a conceptually different capability (external
account OAuth + sync). No OAuth flow was built for this feature, and none
should be invented here — if Core eventually wants this page to also reflect
a connected external calendar, that is an aggregation/sync question for Core
to define, not something this frontend should assume.

"Calendar view" in the roadmap's one-line scope note is implemented as a
chronological, day-grouped **agenda list** (mirroring how Notes/Tasks reused
the existing `List`/`ListRow` data component) rather than a month-grid
widget. A full interactive grid calendar was judged out of proportion for
this pass and was not built.

## What the frontend adapter needs to map (`CalendarService` interface)

- `getEvents(range?, signal?) → CalendarEvent[]` — `range` is an optional
  `{ from?, to? }` inclusive window over each event's `start`
- `getEvent(id, signal?) → CalendarEvent`
- `createEvent(input: CalendarEventInput, signal?) → CalendarEvent`
- `updateEvent(id, input: CalendarEventInput, signal?) → CalendarEvent`
- `deleteEvent(id, signal?) → void`

Each `CalendarEvent` carries: `title`, `description`, `start`/`end`,
`allDay` (boolean), optional `location`, `createdAt`/`updatedAt` (ISO
timestamps).

## Timezone handling — open question

The mock's `start`/`end` fields are **local-naive datetime strings**
(`"YYYY-MM-DDTHH:mm"`, no timezone offset or `Z` suffix) — the same shape a
native `<input type="datetime-local">` produces. This was a deliberate,
minimal choice to avoid guessing at a Core timezone contract that does not
exist yet. A real Core contract MUST define:

- Whether events are stored/returned in UTC, a fixed server timezone, or the
  creating user's own timezone (and if so, how that timezone is captured).
- Whether the frontend is responsible for any timezone conversion on
  display, or whether Core always returns a value already localized for the
  requesting client.
- How daylight-saving transitions and recurring/multi-day events (see below)
  interact with the chosen representation.

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path(s) (or other transport) for list/get/create/
   update/delete — e.g. `GET /api/v1/calendar/events?from=...&to=...`,
   `POST /api/v1/calendar/events`, `PATCH /api/v1/calendar/events/{id}`,
   `DELETE /api/v1/calendar/events/{id}`?
2. **Timezone representation**: see above — this is the single biggest gap
   between the current mock and a real contract.
3. **Ownership/multi-user**: are events scoped per user/session? What auth is
   required on the Calendar endpoints? Can an event have multiple
   attendees/participants (out of scope for this mock, which assumes a
   single implicit owner and no attendee list)?
4. **Recurrence**: does Core support recurring events (daily/weekly/custom
   RRULE-style patterns)? The current mock has no recurrence concept at
   all — every seeded/created event is a single, standalone occurrence.
5. **Multi-day / cross-midnight events**: the mock's all-day events are
   single-day only (`start`/`end` on the same calendar date). Does Core need
   to support all-day events spanning multiple consecutive days, and timed
   events crossing midnight?
6. **Range querying**: is `getEvents(range)` (an inclusive `[from, to]`
   window) sufficient, or does Core expect pagination, a different
   windowing model (e.g. month/week tokens), or server-side "upcoming N"
   semantics?
7. **Relationship to Automations**: could a Core Automation create or react
   to calendar events (e.g. "notify me 30 minutes before any event tagged
   X")? If so, does the Calendar API need an event/webhook surface beyond
   plain CRUD?
8. **Relationship to third-party calendar connectors**: if a user connects
   Google Calendar / Microsoft 365 via the AI Apps catalog (Step 11), should
   those events ever appear merged into this page, or do they remain a
   fully separate, connector-specific surface? This mock assumes the
   latter (fully separate) and does not merge or sync anything.
9. **Sync model**: since this is local-first content today, does Core expect
   a one-time "import local events" migration path, and is sync
   eventually-consistent or does every mutation require an immediate
   round-trip (current mock assumes the latter)?
10. **Conflict handling**: if the same event is edited from two clients, what
    conflict-resolution or versioning does Core provide? The current mock has
    no concept of this.
11. **Error taxonomy**: structured error codes vs. free-text, and which are
    safe to surface directly in the page's error state?

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Calendar — nothing written through this UI today is saved
anywhere beyond the current browser tab's memory.
