# Required from JARVIS Core — Knowledge Contract

**Status:** ⛔ Not available yet. The Knowledge UI is wired to a pluggable
`KnowledgeService` seam (`frontend/src/features/knowledge/knowledgeService.ts`).
The default adapter is a **local/static frontend mock**
(`adapters/mockKnowledgeAdapter.ts`) — a fixed, in-memory set of knowledge
documents standing in for a real Core Knowledge index (M10A — Universal
Search & Knowledge Platform). Nothing is ingested, indexed, or persisted
server-side. A `core` adapter stub exists (`adapters/coreKnowledgeAdapter.ts`)
but is intentionally unimplemented — **no Core knowledge endpoint has been
invented.**

Once Claude Code ships the real Core Knowledge API, implement each method on
`coreKnowledgeService`, set `ready: true`, and select it with
`VITE_KNOWLEDGE_BACKEND=core`. **No KnowledgePage/UI changes will be
required** — the page renders entirely against the `KnowledgeItem` /
`KnowledgeSourceType` types already defined in `knowledgeService.ts`.

Knowledge is intentionally a **read-only browse/consume surface**: the
`KnowledgeService` interface has no create/upload/edit/delete method. Core
owns ingestion; adding a mutation method here would mean recreating Core's
ingestion pipeline in React, which the roadmap explicitly forbids.

## What the frontend adapter needs to map (`KnowledgeService` interface)

- `getKnowledgeItems(signal?) → KnowledgeItem[]`
- `getKnowledgeItem(id, signal?) → KnowledgeItem`

Each `KnowledgeItem` carries: `title`, `snippet` (short summary), `content`
(full body for the detail view), `sourceType`
(`chat-memory | file | note | web`), `tags[]`, and `updatedAt` (ingested/last
updated timestamp).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path(s) (or other transport) for listing/browsing and
   retrieving a single knowledge item — e.g. `GET /api/v1/knowledge`,
   `GET /api/v1/knowledge/{id}`? Is the full corpus returned per request, or
   paginated/cursor-based?
2. **Source taxonomy**: what are the canonical source-type identifiers Core
   actually returns (chat memory, files, notes, web, calendar, email,
   Smart Home logs, etc.)? The frontend's `KnowledgeSourceType` union must be
   extended to match exactly — no invented source types.
3. **Query/browse semantics**: does Core support server-side filtering by
   source type, tag, or free-text query, or does the frontend need to fetch
   the full set and filter client-side (as the current mock does, honestly,
   with no ranking)? If Core supports query, is it literal substring, fuzzy,
   or semantic/embedding-based?
4. **Content shape**: is `content` plain text, Markdown, or rich structured
   content requiring a renderer beyond the current plain-text detail view? Is
   there a size limit, or does very large content need a separate
   fetch-on-demand path?
5. **Tags**: are tags Core-assigned (e.g. auto-extracted) or user-assigned?
   Is there a fixed tag vocabulary the frontend could offer as filter
   options, or are tags free-form?
6. **Freshness / real-time updates**: should the frontend poll for newly
   ingested items, or does Core push updates (SSE/WebSocket) so the list can
   reflect new ingestion without a manual reload?
7. **Auth / scoping**: are knowledge items scoped per user/session? What auth
   is required on the knowledge endpoints, and does it differ from the Chat/
   Automations/Search endpoints already in use?
8. **Error taxonomy**: structured error codes vs. free-text, and which are
   safe to surface directly in the page's error state?
9. **Relationship to Search**: once a real Core Search contract exists (see
   `docs/CORE_SEARCH_CONTRACT_REQUIRED.md`), does Core's Search endpoint
   already return Knowledge results directly, making the frontend's current
   client-side "search Knowledge inside Universal Search" shim
   (`mockSearchAdapter.ts`'s `searchKnowledge`) obsolete? If so, that shim
   should be removed once the Core Search adapter is wired, not run alongside
   it.

Until these are provided, the local/static mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core knowledge — it only ever serves a fixed, hand-seeded document
set held in this frontend's memory, never a real ingested corpus.
