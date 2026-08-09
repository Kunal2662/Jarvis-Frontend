# Required from JARVIS Core — Files Contract

**Status:** ⛔ Not available yet. The Files UI is wired to a pluggable
`FilesService` seam (`frontend/src/features/files/filesService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockFilesAdapter.ts`) — everything you create or delete lives
only in this browser tab's memory and is lost on reload. **There is no real
file storage anywhere in this frontend.** No file bytes are ever read,
written, or transmitted — this is a metadata-only browser (name, type,
size, folder, timestamps). A `core` adapter stub exists
(`adapters/coreFilesAdapter.ts`) but is intentionally unimplemented —
**no Core Files endpoint has been invented.**

Once Claude Code ships the real Core Files/Workspace API, implement each
method on `coreFilesService`, set `ready: true`, and select it with
`VITE_FILES_BACKEND=core`. **No FilesPage/UI changes should be required**
for the metadata browsing/navigation behavior — the page renders entirely
against the `FileEntry` / `CreateFolderInput` / `UploadFileInput` types
already defined in `filesService.ts`. Real upload almost certainly *will*
require new UI (a real file picker, progress, retry) — see "Real
storage/upload contract" below, which this mock deliberately has none of.

## Scope of this frontend surface

Per the roadmap (Phase 5, item 12 "Files + Workspace") and
`JARVIS_CORE_MILESTONES.md` (M11 — Intelligent Workspace & Productivity —
🟡 Active / Not fully closed, i.e. **not** claimed complete the way
M10A/M10B/M10.5 were for Steps 9-11), Files is implemented as a local-first
metadata browser: the frontend owns folder-structure CRUD (create folder,
delete file/folder) locally, but explicitly does NOT implement real file
storage, upload, or preview — those require a real backend that does not
exist yet, and building a fake one in React would misrepresent the
capability (per the project's "do not fake backend functionality" rule).

Specifically out of scope for this frontend pass, by design:

- Real file upload (drag-and-drop, file picker, multipart/chunked transfer,
  progress reporting) — `uploadFile` in the mock adapter only creates a
  metadata row with a **fabricated** size/mime type; it never reads a real
  `File`/`Blob` object.
- Any file preview or viewer (no PDF rendering, no image preview, no text
  preview) — the UI only ever shows metadata (name, type, size, dates).
- Download.
- Sharing, permissions, or access control on individual files/folders.
- File versioning/history.
- Search inside file *contents* (Universal Search's `'files'` category only
  matches file/folder **names**, never contents — see
  `docs/CORE_SEARCH_CONTRACT_REQUIRED.md` for the broader search contract).

## What the frontend adapter needs to map (`FilesService` interface)

- `getFiles(folderId?, signal?) → FileEntry[]` — children of `folderId`;
  root-level entries when omitted
- `getFile(id, signal?) → FileEntry`
- `createFolder(input: CreateFolderInput, signal?) → FileEntry`
- `deleteFile(id, signal?) → void` — deletes a file OR a folder; for a
  folder, the mock cascades to delete every descendant too
- `uploadFile(input: UploadFileInput, signal?) → FileEntry` — **mock-only**,
  see below; do not treat this method name as evidence a real upload
  contract exists

Each `FileEntry` carries: `name`, `type` (`'file' | 'folder'`), optional
`mimeType`/`sizeBytes` (files only), optional `parentId` (folder nesting;
absent means root), `createdAt`/`updatedAt` (ISO timestamps).

## Real storage/upload contract — what Core must actually define

This mock has **none** of the following, and a real Files feature cannot
ship without Core defining them:

1. **Storage backend**: where do file bytes actually live (object storage,
   local filesystem on a JARVIS host, something else)? What are the size
   limits, quota per user, and allowed mime types?
2. **Upload transport**: direct multipart upload to an API endpoint,
   presigned-URL-style direct-to-storage upload, or chunked/resumable
   upload for large files? What does progress reporting look like?
3. **Download/serving**: signed URLs with expiry, a proxied download
   endpoint, or something else? Does the frontend ever handle raw bytes, or
   only URLs Core issues?
4. **Preview/thumbnail generation**: does Core generate thumbnails/preview
   renditions server-side, or would the frontend need to render previews
   client-side (and for which file types)? This mock assumes no preview
   exists at all today.
5. **Virus/content scanning**: is uploaded content scanned before being
   made available, and what does a scan-in-progress or scan-rejected state
   look like to the frontend?
6. **Folder semantics**: are folders a real Core entity (with their own
   ID/metadata, as this mock assumes), or a purely client-side path
   convention over flat storage keys?
7. **Move/rename**: this mock has no `updateFile`/rename/move method at
   all — only create-folder, delete, and the mock upload. Does Core need
   move/rename, and if so what does it do to a folder's descendants'
   effective paths?
8. **Ownership/multi-user/sharing**: are files scoped per user/session? Can
   a file be shared with another user or made public? What auth is required
   on the Files endpoints?
9. **Endpoint(s)**: REST path(s) (or other transport, e.g. presigned URLs)
   for list/get/create-folder/delete/upload/download — e.g.
   `GET /api/v1/files?folder={id}`, `POST /api/v1/files/folders`,
   `DELETE /api/v1/files/{id}`, `POST /api/v1/files/upload`?
10. **Sync model**: since this is local-first content today, does Core
    expect a one-time "import local structure" migration path (there is no
    real content to migrate, only folder names created in-session), and is
    sync eventually-consistent or does every mutation require an immediate
    round-trip (current mock assumes the latter)?
11. **Relationship to Knowledge**: `JARVIS_CORE_FRONTEND_MAPPING.md` treats
    Files (M11) and Knowledge (M10A, which already has a `'file'` source
    type) as separate capabilities. Should a file uploaded here ever become
    indexed/searchable as a Knowledge item once real ingestion exists, or do
    these remain fully separate stores?
12. **Error taxonomy**: structured error codes vs. free-text (e.g. quota
    exceeded, unsupported file type, storage unavailable), and which are
    safe to surface directly in the page's error state?

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Files, and do not build a real upload/storage/preview
system against it — nothing written through this UI today is saved
anywhere beyond the current browser tab's memory, and `uploadFile` never
touches a real file.
