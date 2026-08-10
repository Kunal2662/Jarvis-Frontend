# Required from JARVIS Core — Memory Contract

**Status:** ⛔ Not available yet. The Memory UI is wired to a pluggable
`MemoryService` seam (`frontend/src/features/memory/memoryService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockMemoryAdapter.ts`) — every remembered item lives only in this
browser tab's memory and is reset on reload. **No real Core memory
service, vector store, or embeddings pipeline is ever contacted anywhere in
this frontend.** A `core` adapter stub exists
(`adapters/coreMemoryAdapter.ts`) but is intentionally unimplemented — **no
Core Memory endpoint has been invented.**

Once Claude Code ships the real Core Memory API, implement its methods on
`coreMemoryService`, set `ready: true`, and select it with
`VITE_MEMORY_BACKEND=core`. **No `MemoryPage`/UI changes should be
required** — the page renders entirely against the `Memory` /
`MemoryType` / `MemorySource` / `MemoryImportance` types already defined in
`memoryService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 7, item 16 "Memory" — status "Placeholder / contract
verification required", the only detail given anywhere in this checkpoint's
roadmap docs) and `docs/JARVIS_CORE_FRONTEND_MAPPING.md` ("Memory | Core
future/current capability | ⚠️ Verify | 🔴/placeholder | Do not invent API"),
no Core Memory milestone number, endpoint, schema, or contract is documented
anywhere in this frontend checkpoint outside `2.0-main`/`backend/` (both
out of scope for this task). `README.md`'s own product-vision sections
(§"Memory System", §"Memory implementation") describe an **intended**
future capability — a vector store + knowledge graph behind a "recall UI",
literally "things Jarvis remembers" — not a built or contracted one.

Based on that intent, this frontend pass implements Memory as a
**read-only recall list + detail + forget** surface:

- Browsing, filtering (by type), and locally searching a list of
  short, atomic remembered items (`Memory`: content, type, source,
  importance, when it was formed).
- A detail view for a single memory.
- **Forgetting** (deleting) a memory — the one write operation this pass
  supports, since giving a user explicit control over what JARVIS
  remembers about them is a privacy expectation independent of Core
  contract maturity, and is entirely local-only (no Core call).

Specifically **out of scope** for this frontend pass, by design:

- **Manually creating or editing a memory's content.** A memory record here
  represents something JARVIS itself formed from a conversation — the
  frontend does not let a user hand-author or rewrite that content, which
  would misrepresent what a real Memory system would actually do. (A user
  *removing* an incorrect/unwanted memory — Forget — is different from
  authoring one, and is supported.)
- **Semantic/vector search.** No embeddings, vector database API, or
  semantic ranking is implemented or simulated in this frontend — per
  `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do not implement a second... memory
  engine" rule. `Memory` search here is honest client-side substring
  filtering over the local mock dataset, exactly like every other Step
  8-15 mock search (Notes, Tasks, Knowledge, etc.) — never presented as
  semantic/contextual retrieval.
- **A knowledge graph, relationship view, or memory-to-memory linking.**
- **Confidence scores or any other raw ML/pipeline internals.** Per
  `CLAUDE.md`'s "memory internals... vector store, embeddings" rule, those
  stay hidden behind Developer Mode and are not part of this end-user
  surface at all — this mock does not fabricate a confidence score to
  imply one exists.
- **Memory permissions/visibility UI.** No second permission system is
  built; the eventual production flow remains User → Memory UI → Core →
  Permission Engine → Memory subsystem, exactly as for every other
  Core-owned capability in this frontend.
- **Real device discovery/vendor-specific memory sources.** `MemorySource`
  is limited to `'chat' | 'voice'` — the two real, already-built
  interactive surfaces (Chat, Voice) — not an invented ingestion pipeline.

## What the frontend adapter needs to map (`MemoryService` interface)

- `getMemories(signal?) → Memory[]` — `{ id, content, type, source,
  importance, createdAt }`
- `getMemory(id, signal?) → Memory`
- `forgetMemory(id, signal?) → void` — permanently removes a memory from
  this adapter's data. Local-only in the mock; a real Core adapter would
  need to confirm this actually deletes (not just hides) the underlying
  record.

## Open questions for JARVIS Core (unanswered — do not guess)

1. **Data model**: is `Memory` (`content`/`type`/`source`/`importance`/
   `createdAt`) anywhere close to Core's real memory record shape, or does
   Core's model include fields this mock doesn't know about (confidence,
   embeddings reference, related-memory links, expiry/retention policy,
   last-recalled timestamp)?
2. **Formation**: how are memories actually formed from a conversation —
   automatically after every Chat/Voice turn, on an explicit "remember
   this" user action, or both? Does the user get to review/approve a
   memory before it's stored?
3. **Retrieval/recall**: is Memory retrieval semantic (vector similarity)
   only, or does Core also expose a list/browse endpoint this UI's
   list view could call directly? What does relevance/ranking look like,
   and is it ever exposed to the frontend, or only used internally by
   Core when injecting memory into a conversation?
4. **Retention/expiry**: do memories expire, decay in importance, or
   persist indefinitely until explicitly forgotten? Is there a
   distinction between short-term/session memory and long-term/episodic
   memory (`README.md`'s backlog mentions this split as a separate,
   unbuilt item)?
5. **Forget semantics**: does forgetting a memory immediately and
   permanently delete the underlying data (including any embedding), or
   only mark it as excluded from future recall? This matters for what
   this UI is allowed to promise the user in its confirmation copy.
6. **Endpoint(s)**: REST/WebSocket path(s) for
   list-memories/get-memory/forget-memory — e.g.
   `GET /api/v1/memory`, `GET /api/v1/memory/{id}`,
   `DELETE /api/v1/memory/{id}` — and whether memory formation itself is
   ever a frontend-triggered action or purely Core-internal.
7. **Authentication/permissions**: what scoping applies — is memory
   strictly per-user, and does any part of it (e.g. household/shared
   context memories in a multi-user Smart Home setting) need broader
   visibility rules that the frontend must respect via Core's Permission
   Engine?
8. **Errors**: structured error codes vs. free-text, and which are safe to
   surface directly (e.g. "memory not found" is safe; an internal
   vector-store fault probably should not leak implementation details).

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Memory, and do not build a real vector store, embeddings
pipeline, or semantic retrieval system against it — nothing this UI does
today reaches a real Core memory service.
