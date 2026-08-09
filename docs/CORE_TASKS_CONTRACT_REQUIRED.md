# Required from JARVIS Core — Tasks Contract

**Status:** ⛔ Not available yet. The Tasks UI is wired to a pluggable
`TasksService` seam (`frontend/src/features/tasks/tasksService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockTasksAdapter.ts`) — everything you create, edit, complete, or
delete lives only in this browser tab's memory and is lost on reload.
Nothing is persisted server-side. A `core` adapter stub exists
(`adapters/coreTasksAdapter.ts`) but is intentionally unimplemented —
**no Core Tasks endpoint has been invented.**

Once Claude Code ships the real Core Tasks API, implement each method on
`coreTasksService`, set `ready: true`, and select it with
`VITE_TASKS_BACKEND=core`. **No TasksPage/UI changes will be required** —
the page renders entirely against the `Task` / `TaskInput` /  `TaskStatus` /
`TaskPriority` types already defined in `tasksService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 5, item 10 "Tasks + Projects") and the README's
Phase 10 note ("Projects becomes a grouping inside them — not a navigation
destination"), this surface intentionally does **not** create a separate
Projects entity, route, service, or nav item. `project` is a lightweight,
free-text grouping tag on each `Task` only. `JARVIS_CORE_MILESTONES.md`
marks M11 (Intelligent Workspace & Productivity) as 🟡 Active / Not fully
closed — **not** claimed complete the way M10A/M10B/M10.5 were for Steps
9-11 — so, like Notes, this is user-authored content where the frontend
owns full local CRUD while no real Core contract exists. This is a manual
personal task list only: no autonomous task execution, no AI-generated
suggestions, no dependency graph were built.

## What the frontend adapter needs to map (`TasksService` interface)

- `getTasks(signal?) → Task[]`
- `getTask(id, signal?) → Task`
- `createTask(input: TaskInput, signal?) → Task`
- `updateTask(id, input: TaskInput, signal?) → Task`
- `deleteTask(id, signal?) → void`
- `setStatus(id, status: TaskStatus, signal?) → Task`
- `toggleComplete(id, signal?) → Task` (quick list-checkbox toggle between
  `'done'` and `'todo'`)

Each `Task` carries: `title`, `description`, `status`
(`todo | in-progress | done`), `priority` (`low | medium | high`),
`dueDate` (optional ISO date, no time), `project` (optional free-text
grouping tag), `createdAt`/`updatedAt` (ISO timestamps), and
`completedAt` (set when status transitions to `done`, cleared on reopen).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path(s) (or other transport) for list/get/create/
   update/delete/status-change — e.g. `GET /api/v1/tasks`,
   `PATCH /api/v1/tasks/{id}/status`?
2. **Ownership/multi-user**: are tasks scoped per user/session? What auth is
   required on the Tasks endpoints? Can tasks be assigned to someone other
   than the creator (out of scope for this mock, which assumes a single
   implicit owner)?
3. **Projects**: does Core have (or plan) a real Projects entity that tasks
   would reference by ID rather than a free-text tag? If so, should this
   frontend's `project` string be migrated to a `projectId` foreign key, and
   does that warrant Projects becoming its own surface after all (contrary
   to the current README guidance)?
4. **Due dates / reminders**: does Core drive any notification/reminder
   behavior off `dueDate` (e.g. surfaced via Automations or a future
   notification system), or is it purely descriptive metadata today?
5. **Status model**: is `todo | in-progress | done` the real Core status
   enum, or does Core support additional states (e.g. `blocked`,
   `cancelled`) the frontend should also render?
6. **Priority model**: is `low | medium | high` sufficient, or does Core use
   a numeric/ordinal priority the frontend should map to these three labels?
7. **Sync model**: since this is local-first content today, does Core expect
   a one-time "import local tasks" migration path, and is sync
   eventually-consistent or does every mutation require an immediate
   round-trip (current mock assumes the latter)?
8. **Relationship to Automations**: could a Core Automation eventually
   create/update tasks (e.g. "create a task when X happens")? If so, does
   the Tasks API need to distinguish user-created vs. automation-created
   tasks in its response shape?
9. **Conflict handling**: if the same task is edited from two clients, what
   conflict-resolution or versioning does Core provide? The current mock has
   no concept of this.
10. **Error taxonomy**: structured error codes vs. free-text, and which are
    safe to surface directly in the page's error state?

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core Tasks — nothing written through this UI today is saved
anywhere beyond the current browser tab's memory.
