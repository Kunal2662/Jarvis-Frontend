# Required from JARVIS Core — Universal Search Contract

**Status:** ⛔ Not available yet. The Universal Search UI is wired to a
pluggable `SearchService` seam
(`frontend/src/features/search/searchService.ts`). The default adapter is a
**client-side frontend mock** (`adapters/mockSearchAdapter.ts`) that does
simple, honest substring filtering over data that already exists in this
frontend session — the Automations mock dataset, the live nav destinations
(Home/Chat/Voice/Automations/Settings), and this browser's own local recent
Chat messages. Nothing is ranked, indexed, or searched server-side, and no
Core-owned corpus (Knowledge, Files, Memory, cross-session Chat history, etc.)
is searched at all. A `core` adapter stub exists
(`adapters/coreSearchAdapter.ts`) but is intentionally unimplemented —
**no Core search endpoint has been invented.**

Once Claude Code ships the real Core Search API, implement `search()` on
`coreSearchService`, set `ready: true`, and select it with
`VITE_SEARCH_BACKEND=core`. **No UniversalSearch/UI changes will be
required** — the overlay renders entirely against the `SearchResult` /
`SearchResultGroup` / `SearchResultCategory` types already defined in
`searchService.ts`.

## What the frontend adapter needs to map (`SearchService` interface)

- `search(query: string, signal?) → SearchResultGroup[]`, where each group is
  `{ category, label, results: SearchResult[] }` and each `SearchResult` is
  `{ id, category, title, description?, path, navState?, action? }`.

The frontend intentionally does **no ranking or relevance scoring** — per the
roadmap ("do not recreate Search or Intelligence logic in React"), a real
Core adapter is expected to return results already ordered/ranked and
grouped by domain; the UI only renders what it is given.

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path (or other transport, e.g. SSE for
   incremental/streamed results) for a query — e.g. `GET /api/v1/search?q=...`?
   Synchronous single response, or streamed/paginated results as ranking
   completes?
2. **Corpus / domains**: which Core-owned domains does Search actually index —
   Knowledge (M10A), Memory (M19), Files/Workspace (M11), full Chat history
   (not just this browser's local session), Automations (server-persisted,
   once M18 Core execution lands), Smart Home entities (M12)? What are the
   canonical category/domain identifiers Core returns, so the frontend's
   `SearchResultCategory` union can be extended to match exactly (no invented
   categories)?
3. **Ranking / relevance**: what ranking signals are used (recency, semantic
   similarity, exact match, usage frequency)? Is ranking stable enough to
   support keyboard "first result = Enter" behavior the way the frontend
   already implements it against grouped results?
4. **Result shape**: does each result carry a stable `id`, a navigable
   `path`/deep-link, and a human-readable `title`/`description`, or does the
   frontend need to resolve additional metadata via a second call per result
   type (e.g. fetch full Automation detail separately)?
5. **Pagination / result limits**: is the full result set returned per query,
   or paginated/truncated with a "load more" affordance? What's the
   recommended per-category cap for a compact overlay UI?
6. **Query semantics**: literal substring, fuzzy, or semantic/embedding-based
   matching? Should the frontend send the raw keystroke-debounced string, or
   does Core expect a minimum query length / explicit submit?
7. **Auth / scoping**: are results scoped per user/session? What auth is
   required on the search endpoint, and does it differ from the Chat/
   Automations endpoints already in use?
8. **Real-time reachability**: since Search is a fast, per-keystroke overlay
   interaction, what latency budget should the frontend design around (debounce
   window, timeout, cancellation via `AbortSignal` — already supported in the
   seam)?
9. **Error taxonomy**: structured error codes vs. free-text, and which are
   safe to surface directly in the overlay's error state?
10. **Recent/saved searches**: does Core want to own "recent searches" (e.g.
    synced across devices), or should the frontend's current lightweight
    local-only `localStorage` "last 5 searches" convenience
    (`searchHistory.ts`) remain purely client-side?

Until these are provided, the client-side mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core search — it only ever searches data this frontend already
has in memory/localStorage (Automations mock data, live nav destinations, and
this browser's own recent Chat messages), never a real cross-domain corpus.
