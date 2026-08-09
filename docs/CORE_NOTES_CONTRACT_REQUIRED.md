# Required from JARVIS Core — Notes Contract

**Status:** ⛔ Not available yet. The Notes UI is wired to a pluggable
`NotesService` seam (`frontend/src/features/notes/notesService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockNotesAdapter.ts`) — everything you create, edit, pin, or
delete lives only in this browser tab's memory and is lost on reload.
Nothing is persisted server-side. A `core` adapter stub exists
(`adapters/coreNotesAdapter.ts`) but is intentionally unimplemented —
**no Core Notes endpoint has been invented.**

Once Claude Code ships the real Core Notes API, implement each method on
`coreNotesService`, set `ready: true`, and select it with
`VITE_NOTES_BACKEND=core`. **No NotesPage/UI changes will be required** —
the page renders entirely against the `Note` / `NoteInput` types already
defined in `notesService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 5, item 9) and `JARVIS_CORE_MILESTONES.md` (M11 —
Intelligent Workspace & Productivity — 🟡 Active / Not fully closed, i.e.
**not** claimed complete the way M10A/M10B/M10.5 were for Steps 9-11), Notes
is user-authored content: the user writes their own notes, so — unlike
Knowledge (Core-ingested, read-only) — the frontend owns full CRUD locally
while a real Core contract does not exist. A plain multiline text field is
used intentionally; no rich-text/Markdown editor was built, since the
roadmap does not call for one.

## What the frontend adapter needs to map (`NotesService` interface)

- `getNotes(signal?) → Note[]`
- `getNote(id, signal?) → Note`
- `createNote(input: NoteInput, signal?) → Note`
- `updateNote(id, input: NoteInput, signal?) → Note`
- `deleteNote(id, signal?) → void`
- `setPinned(id, pinned: boolean, signal?) → Note`

Each `Note` carries: `title`, `content` (plain text), `tags` (string[]),
`pinned` (boolean), `createdAt`/`updatedAt` (ISO timestamps).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path(s) (or other transport) for list/get/create/
   update/delete/pin — e.g. `GET /api/v1/notes`, `POST /api/v1/notes`,
   `PATCH /api/v1/notes/{id}`, `DELETE /api/v1/notes/{id}`?
2. **Ownership/multi-user**: are notes scoped per user/session? What auth is
   required on the Notes endpoints?
3. **Sync model**: since this is user-authored local-first content today,
   does Core expect a one-time "import local notes" migration path when a
   user first connects to a real backend, or does the mock adapter's data
   simply get discarded? Is sync eventually-consistent, or does every
   mutation require an immediate round-trip (current mock assumes the
   latter — every create/edit/delete/pin already awaits a network-shaped
   call)?
4. **Content format**: does Core expect/return plain text (matching this
   UI), or should the frontend be prepared to store/render Markdown or rich
   text once a real editor is justified by a future step?
5. **Tags**: are tags free-form per-user strings (as the mock assumes), or
   does Core maintain a shared/normalized tag vocabulary (e.g. matching
   Knowledge's tag model) that the frontend should validate/autocomplete
   against?
6. **Pinning**: is pin state per-user local metadata, or a Core-tracked
   field? Does pinning have a limit (e.g. max pinned notes)?
7. **Conflict handling**: if the same note is edited from two clients (or
   this UI vs. a future desktop/mobile client), what conflict-resolution or
   versioning does Core provide? The current mock has no concept of this.
8. **Error taxonomy**: structured error codes vs. free-text, and which are
   safe to surface directly in the page's error state?
9. **Real-time updates**: should the frontend poll, or does Core push note
   changes (e.g. created via voice/chat elsewhere) so the list reflects them
   without a manual reload?
10. **Relationship to Knowledge**: `JARVIS_CORE_FRONTEND_MAPPING.md` treats
    Notes (M11) and Knowledge (M10A) as separate capabilities. Should a note
    ever become indexed/searchable as a Knowledge item once Core ingestion
    exists, or do these remain fully separate stores?

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Notes — nothing written through this UI today is saved
anywhere beyond the current browser tab's memory.
