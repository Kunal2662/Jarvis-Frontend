# JARVIS Frontend — Current Progress & Continuation State

**Snapshot:** 2026-08-09  
**Project:** `Jarvis-Frontend-main`  
**Purpose:** Portable, current-state handoff for future Emergent workspaces/accounts or other frontend coding agents.

> **Important:** This document records the **frontend implementation state** found in this checkpoint. It does not claim that JARVIS Core/backend capabilities are complete. Core remains under separate development in the main JARVIS-OS project.

---

## 1. Project Boundary

### Emergent / Frontend owns

- React/Vite/TypeScript presentation layer
- Design system and UI components
- App shell and navigation
- Feature pages and user interactions
- Local UI state
- Frontend service interfaces/adapters
- Development/mock adapters where Core contracts are unavailable
- Streaming display and cancellation UX
- Responsive behavior
- Accessibility
- Frontend tests and production builds

### JARVIS Core / Claude Code owns

- AgentOrchestrator
- Intent Engine
- Context Engine
- Planner
- Tool selection/execution
- Permission/security execution logic
- AI provider management
- Memory backend
- Knowledge backend
- Search backend
- Automation execution
- Smart Home backend
- MQTT/Home Assistant connectors
- Databases and persistence services
- Authentication/authorization backend
- Core API/event contracts
- Infrastructure and deployment

**Rule:** Do not recreate Core logic in React. If a Core contract is unknown, do not invent it.

---

## 2. Current Frontend Navigation

The intended primary navigation is deliberately minimal:

**Home · Chat · Voice · Automations**

- **Home:** live frontend surface
- **Chat:** live frontend surface using the development Chat backend/adapter
- **Voice:** live frontend surface using local browser speech recognition
- **Automations:** live frontend surface using an in-memory mock adapter (Core automation execution is not yet integrated)

There is **no sidebar** in the primary application composition.

Mobile uses the existing bottom tab strip.

Other unfinished modules remain outside the primary strip and/or are reachable through the existing routing/command-palette structure.

---

## 3. Completed Frontend Steps

The following steps are complete **as frontend work** in this checkpoint.

### Step 0 — Core ↔ Frontend Alignment
**Status: COMPLETE**

Portable documentation was created to map frontend surfaces to JARVIS Core milestones and to preserve the Core/frontend boundary.

### Step 0.5 — Portable Project Documentation
**Status: COMPLETE**

The project contains portable architecture, milestone, mapping, roadmap and continuation documents.

### Step 1 — Single Workspace
**Status: COMPLETE**

Implemented:

- Sidebar removed from primary composition
- Single-workspace layout
- Top-bar navigation
- Adaptive workspace
- Status bar
- Mobile bottom navigation
- Existing sidebar/Dock components retained in the design system where useful for developer/edge cases

### Step 2 — Navigation & Routing
**Status: COMPLETE**

Implemented:

- Flat navigation registry
- Home / Chat / Voice / Automations primary strip
- Honest `live` vs `planned` capability metadata
- Secondary/placeholder module handling
- Legacy route redirects
- Command-palette navigation
- Route collision/invariant tests

### Step 3 — Global UI Infrastructure
**Status: COMPLETE**

Implemented/reused:

- `UIStatus`
- `AsyncState<T>`
- `StateView`
- `ModulePage`
- `Widget`
- `WidgetGrid`
- `useAsync`

Standardized UI states:

- loading
- ready
- empty
- error
- unavailable
- coming-soon
- permission-denied
- reconnecting

### Step 4 — Chat Frontend Service Seam
**Status: COMPLETE — frontend seam; Core integration pending**

Architecture:

```text
ChatPage
  ↓
ChatService
  ↓
Development SSE Adapter / Future Core Adapter
  ↓
Endpoint
```

Current development path uses the existing:

`POST /api/chat/stream`

The frontend does **not** invent or assume a JARVIS Core conversational API.

A Core adapter stub and contract-requirements documentation are present for later integration.

### Step 5 — Voice Frontend Service Seam
**Status: COMPLETE — frontend seam; Core integration pending**

Architecture:

```text
VoiceOverlay
  ↓
useVoiceSession
  ↓
VoiceService
  ↓
Local Web Speech Adapter / Future Core Adapter
```

Current local functionality includes:

- browser speech recognition
- continuous/interim transcription
- listening state
- stop/reset
- transcript handling
- voice history
- unsupported-browser/error handling
- VoiceOrb state presentation

No Core voice protocol was invented.

### Step 6 — Home / Command Center
**Status: COMPLETE — frontend using mock data**

Home now contains:

- JARVIS greeting/status
- central JARVIS presence orb
- waveform/presence presentation
- voice entry
- quick Chat input
- suggestion chips
- system/vitals cards
- Tasks widget
- Schedule/Calendar widget
- Automations widget
- Smart Home widget
- System Status widget
- activity timeline

Architecture:

```text
Home
  ↓
HomeService
  ↓
Mock Home Adapter / Future Core Adapter
```

Mock data is intentionally separated from presentation.

### Step 7 — Complete Chat UX
**Status: COMPLETE — frontend using development adapter**

Implemented/refined:

- empty conversation state
- user/JARVIS message rows
- streaming deltas
- thinking indicator
- inline error banner
- retry
- cancellation / generation stopped state
- response copy feedback
- Markdown rendering
- code-block copy
- long-message handling
- table/blockquote/GFM presentation
- smart auto-scroll
- latest-message jump indicator
- auto-growing composer
- suggestion prompts
- VoiceOverlay entry
- mobile-safe composer
- keyboard accessibility
- reduced-motion-aware scrolling

The existing development SSE path remains intact.

### Step 8 — Automations
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
AutomationsPage
  ↓
AutomationService
  ↓
Mock Automation Adapter / Future Core Adapter
```

Implemented:

- `Automation` / `AutomationTrigger` / `AutomationCondition` / `AutomationAction` / `AutomationExecution` types, following the existing `UIStatus`/`AsyncState<T>` convention
- `automationService.ts` seam (`getAutomations`, `getAutomation`, `createAutomation`, `updateAutomation`, `deleteAutomation`, `setEnabled`, `pauseResume`, `getExecutionHistory`), selectable via `VITE_AUTOMATIONS_BACKEND` (`mock` default, `core` stub)
- `adapters/mockAutomationAdapter.ts` — 5 seeded automations (Morning Brief, Daily System Health Check, Smart Home Evening Routine, Weekly Work Summary, Backup Reminder) covering active/paused/failed/disabled statuses, schedule and event triggers, conditions, actions and execution history; create/update/delete/enable/pause-resume perform real in-memory mutations with simulated latency
- `adapters/coreAutomationAdapter.ts` — intentionally unimplemented stub (`ready: false`) that throws/returns `CoreAutomationContractUnavailableError`; no Core endpoint invented
- `AutomationsPage.tsx` — overview counts (total/active/paused/failed) + upcoming executions widget, automation list/cards with status badges, enable/disable toggle, click-through detail drawer (trigger/conditions/actions/execution history, Edit/Pause-Resume/Delete-with-confirmation), and a create/edit form (trigger, conditions, actions) built from existing `FormField`/`Input`/`Select`/`TextArea`
- All async states (loading/ready/empty/error/unavailable) rendered through the existing `ModulePage` + `StateView` + `Widget`/`WidgetGrid` pattern; no new visual language
- Routing: `/automations` wired in `App.tsx`; `app/modules.tsx` entry flipped from `status: 'planned'` / `badge: 'soon'` to `status: 'live'` (badge removed)
- `docs/CORE_AUTOMATIONS_CONTRACT_REQUIRED.md` added, mirroring the existing Chat/Voice contract-requirement docs

**Automation data is mock/local to this frontend session only.** Nothing is persisted server-side and no automation actually executes — creating/enabling an automation does not trigger real scheduling or side effects. Real execution, scheduling and persistence remain owned by JARVIS Core and are pending a verified Core automation contract (see `docs/CORE_AUTOMATIONS_CONTRACT_REQUIRED.md`).

### Step 9 — Universal Search
**Status: COMPLETE — frontend using a client-side mock adapter; Core integration pending**

Architecture:

```text
Topbar search icon / ⌘⇧K
  ↓
UniversalSearch (renders inside the existing SearchOverlay pattern)
  ↓
SearchService
  ↓
Mock Search Adapter (client-side filtering) / Future Core Adapter
```

Universal Search is a **cross-cutting overlay**, not a new item in the
primary nav strip — the nav remains exactly Home · Chat · Voice ·
Automations, with no sidebar. It is reached via the topbar search icon
(now labeled "Search (⌘⇧K)") or the `⌘⇧K` shortcut. The pre-existing
`⌘K` shortcut and the topbar's Command Palette keep their unchanged
command-execution role — the two surfaces stay distinct, as originally
designed (`SearchOverlay` is explicitly commented "Distinct from
CommandPalette actions").

Implemented:

- `SearchResult` / `SearchResultGroup` / `SearchResultCategory` types
  (`'app' | 'automation' | 'chat'` — only domains with real, existing
  frontend data; no fabricated Knowledge/Files/Memory/Smart Home results),
  following the existing `UIStatus` convention
- `searchService.ts` seam (`search(query, signal) → SearchResultGroup[]`),
  selectable via `VITE_SEARCH_BACKEND` (`mock` default, `core` stub)
- `adapters/mockSearchAdapter.ts` — honest client-side substring filtering
  (no ranking/"intelligence") over three real, existing sources: the
  Automations mock dataset (name/description), the live nav destinations
  (Home/Chat/Voice/Automations/Settings, mirroring the Command Palette's
  "Go to" group), and this browser's own local recent Chat messages
  (`chatStore.ts` localStorage, user messages only). Simulates latency like
  the other mock adapters
- `adapters/coreSearchAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) that throws/returns `CoreSearchContractUnavailableError`;
  no Core search endpoint invented
- `searchHistory.ts` — small optional "recent searches" convenience (last 5,
  localStorage), mirroring the existing `chatStore.ts` / `voiceHistory.ts`
  local-persistence pattern
- `UniversalSearch.tsx` — wires the existing, previously-unused
  `design-system/patterns/SearchOverlay` presentational shell to real search
  behavior: debounced input, grouped/categorized results with per-result
  icon + description, `role="listbox"`/`"option"` semantics with
  `aria-selected`/`aria-activedescendant`, a screen-reader result-count live
  region, arrow-key/Enter roving selection, and click-to-select. All async
  states (idle/recent-searches, loading, empty/no-results, error,
  unavailable) render through the existing `StateView` composite (used
  directly, not via `ModulePage` — confirmed generic/layout-agnostic)
- Selecting an automation result navigates to `/automations` and opens that
  automation's detail drawer via `location.state` (a small, additive
  deep-link effect in `AutomationsPage.tsx`, mirroring `ChatPage.tsx`'s
  existing `location.state.prompt` consumption pattern); selecting "Voice"
  opens the real `VoiceOverlay` (not a placeholder route) via the same
  `action: 'voice'` convention `ModuleDef`/`AppLayout` already use; other
  results navigate via react-router and close the overlay
  `design-system/patterns/SearchOverlay/SearchOverlay.tsx` gained one small,
  additive, backward-compatible `inputProps` passthrough prop (for
  `role="combobox"`/`aria-activedescendant` wiring) — no existing behavior
  changed, no overlay chrome duplicated
- `app/AppLayout.tsx`: the topbar search icon now opens `UniversalSearch`
  (relabeled "Search (⌘⇧K)"); a new `⌘⇧K` shortcut opens it directly; `⌘K`
  is untouched and still opens the Command Palette

**Search results are mock/local to this frontend session only** — client-side
filtering over data this frontend already has in memory/localStorage. Real
Core Search (real ranking, a full cross-domain corpus spanning
Knowledge/Files/Memory/server-side Automations/Chat history) is pending a
verified Core search contract (see `docs/CORE_SEARCH_CONTRACT_REQUIRED.md`).

### Step 10 — Knowledge + Intelligence
**Status: COMPLETE — frontend using local/static mock adapters; Core integration pending**

Architecture (both features):

```text
KnowledgePage / IntelligencePage
  ↓
KnowledgeService / IntelligenceService
  ↓
Mock adapter (local/static) / Future Core adapter
```

Knowledge and Intelligence are combined into one frontend step per the
roadmap (Phase 3, item 7), but shipped as two independent feature
directories (`features/knowledge/`, `features/intelligence/`) with their own
service seams — they do not share an adapter or a page. Neither is a
primary-nav item: both are `surface: 'secondary'` + `status: 'live'` in
`app/modules.tsx` (flipped from the placeholder `'planned'` state, the same
transition Notes/Tasks/Calendar/Files/AI Apps will eventually get), reachable
via `/knowledge` and `/intelligence` and surfaced in the command palette's
"Go to" group (not "Coming soon", since they are real, built pages). The
primary nav strip is unchanged: **Home · Chat · Voice · Automations**, no
sidebar, no 5th item.

**Knowledge** (`features/knowledge/`) — a **read-only browse/consume**
surface, since Core owns ingestion (M10A):

- `KnowledgeItem` / `KnowledgeSourceType` (`'chat-memory' | 'file' | 'note' | 'web'`) types, following the existing `UIStatus`/`AsyncState<T>` convention
- `knowledgeService.ts` seam (`getKnowledgeItems`, `getKnowledgeItem` — deliberately no create/upload/edit/delete method), selectable via `VITE_KNOWLEDGE_BACKEND` (`mock` default, `core` stub)
- `adapters/mockKnowledgeAdapter.ts` — 6 seeded documents spanning all four source types (a file safety checklist, a chat-memory standup recap, a research note, a web architecture primer, a supplier contact file, and a home-preferences note), each with title/snippet/full content/tags/updated date
- `adapters/coreKnowledgeAdapter.ts` — intentionally unimplemented stub (`ready: false`) that throws/returns `CoreKnowledgeContractUnavailableError`; no Core endpoint invented
- `KnowledgePage.tsx` — stat cards (total + per-source counts), a local text filter plus a source-type filter (both simple client-side `Array.filter` over the already-fetched list — not a ranking/search engine), a document list built from the existing `List`/`ListRow` data component (a better fit for a document browser than a card grid — reused rather than duplicated), and a click-through read-only detail drawer (`KnowledgeDetailDrawer.tsx`, full content + tags + updated date, no edit/delete actions)
- All async states (loading/ready/empty/error/unavailable) rendered through the existing `ModulePage` + `StateView` + `Widget` pattern; no new visual language
- `docs/CORE_KNOWLEDGE_CONTRACT_REQUIRED.md` added, mirroring the existing Search/Automations contract-requirement docs

**Intelligence** (`features/intelligence/`) — a **read-only display/consume**
surface, since Core owns computing insights (M10B):

- `Insight` type (`category: 'automation' | 'usage' | 'system' | 'suggestion'`, `tone: 'info' | 'suggestion' | 'warning'`), following the existing `UIStatus` convention
- `intelligenceService.ts` seam (`getInsights` only — no dismiss/acknowledge/create method), selectable via `VITE_INTELLIGENCE_BACKEND` (`mock` default, `core` stub)
- `adapters/mockIntelligenceAdapter.ts` — a **static, hand-seeded list of 5 pre-computed insight objects** (e.g. "3 automations haven't run in 2 weeks", "Frequently discussed topic this week: suit diagnostics", "Suggested automation based on your Chat activity") returned unchanged on every call; no scoring, ranking, or NLP is performed client-side — per the roadmap's "do not recreate ... Intelligence logic in React"
- `adapters/coreIntelligenceAdapter.ts` — intentionally unimplemented stub (`ready: false`) that throws/returns `CoreIntelligenceContractUnavailableError`; no Core endpoint invented
- `IntelligencePage.tsx` — stat cards (total + per-tone counts) and a read-only card grid (`InsightCard.tsx`) showing title/description/category/tone (icon + text, never color alone) and an optional "View" navigation link to a related page (e.g. Automations); no dismiss/edit/create controls anywhere in the UI
- All async states (loading/ready/empty/error/unavailable) rendered through the existing `ModulePage` + `StateView` pattern
- `docs/CORE_INTELLIGENCE_CONTRACT_REQUIRED.md` added, documenting (among other things) that a real Core contract would also need to define dismiss/acknowledge and subscribe-to-new-insights behavior, neither of which is implemented client-side today

**Optional light-touch Search integration:** Knowledge documents were
registered as one additional searchable category (`'knowledge'`) inside the
existing Universal Search mock adapter (`features/search/adapters/mockSearchAdapter.ts`),
consistent with how it already searches automations/pages/local chat —
honest substring filtering over title/snippet/tags, no ranking. Selecting a
knowledge result deep-links to `/knowledge` and opens that item's detail
drawer via `location.state.knowledgeId` (mirrors the existing Automations
deep-link pattern from Step 9). **Intelligence insights were deliberately
NOT added to Universal Search** — insights are Core-computed display content,
not searchable named entities, per the task scope for this step.

**Navigation registry note (Step 10 follow-up on Step 9's module registry):**
Adding a *live* secondary surface exposed a gap in the Step 1–9 module
registry — `secondaryModules` previously only ever meant "future placeholder,
always `planned`," so `AppLayout.tsx`'s command palette always routed every
secondary module into the "Coming soon" group. Two new derived selectors
were added to `app/modules.tsx` — `liveSecondaryModules` (real, built
secondary pages) and `comingSoonModules` (still-`planned` secondary
placeholders) — and `AppLayout.tsx`'s command palette now puts
`liveSecondaryModules` in the "Go to" group alongside the primary nav and
Settings, while `comingSoonModules` keeps the "Coming soon" heading. This is
additive: `secondaryModules` itself is unchanged and still exists as the
union of both. `app/__tests__/modules.test.ts`'s invariant test was updated
to match (previously asserted *every* secondary module must be `planned`;
now asserts planned ones stay honest placeholders and live ones are real,
ready pages) — this is the same "flip planned → live" transition Automations
went through in Step 8, just for a `secondary`-surface module instead of a
`topbar` one.

**`Surface` type note:** the module registry's `Surface` union has included
an unused `'contextual'` value since before this step. It was inspected and
confirmed genuinely unused — no selector in `modules.tsx`, no consumer in
`AppLayout.tsx`, `CommandPalette`, or anywhere else in the frontend reads or
branches on it (grepped the full `frontend/src` tree). It has been left as
declared but is now documented in `modules.tsx` as a reserved-but-unwired
placeholder for a possible future context-sensitive placement, so a later
agent does not need to re-investigate it from scratch.

**Both Knowledge and Intelligence are mock/local to this frontend session
only.** No knowledge document is actually ingested from any real source, and
no insight is actually computed from live signals — the insight list is
static seed data. Real ingestion, indexing, and computed intelligence remain
owned by JARVIS Core and are pending verified Core contracts (see
`docs/CORE_KNOWLEDGE_CONTRACT_REQUIRED.md` and
`docs/CORE_INTELLIGENCE_CONTRACT_REQUIRED.md`).

### Step 11 — AI Apps + Integrations
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
AiAppsPage
  ↓
AiAppsService
  ↓
Mock AI Apps Adapter (in-memory) / Future Core Adapter
```

Per the roadmap (Phase 4, item 8) and the README's Phase 11 scope note
("Google Workspace, Microsoft 365, Email → Settings → Connections. Plugin
system and MCP → user-facing as AI Apps, raw registries in Developer
Mode"), this step deliberately combines two conceptually different Core
capabilities into **one** catalog surface (`features/aiApps/`), reachable
from the single pre-existing `/apps` route:

- MCP-style tools the agent itself can call (Web Search, File Access,
  Automations Tool, Code Sandbox)
- third-party integration connectors (Gmail, Google Calendar, Microsoft 365)

Both are represented as entries in one `AiApp` type, differentiated by a
`category: 'mcp-tool' | 'connector'` field — not a second "Integrations" nav
destination, and not a Settings → Connections page (Settings itself,
roadmap item 19, is a separate, later, not-yet-built surface).

Implemented:

- `AiApp` / `AiAppCategory` (`'mcp-tool' | 'connector'`) /
  `AiAppConnectionStatus` (`'connected' | 'not_connected' | 'unavailable'`)
  types, following the existing `UIStatus`/`AsyncState<T>` convention
- `aiAppsService.ts` seam (`getApps`, `getApp`, `setConnected` — a
  deliberately small interface proportionate to a catalog+detail view, no
  install/uninstall or OAuth-flow method), selectable via
  `VITE_AI_APPS_BACKEND` (`mock` default, `core` stub)
- `adapters/mockAiAppsAdapter.ts` — 7 seeded catalog entries (Web Search,
  File Access, Automations Tool, Code Sandbox — all `mcp-tool`; Gmail,
  Google Calendar, Microsoft 365 — all `connector`) covering all three
  connection statuses (`connected`/`not_connected`/`unavailable`);
  `setConnected` performs a real in-memory mutation with simulated latency
  and rejects for an app marked `unavailable` (cannot connect what is not
  offered)
- `adapters/coreAiAppsAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) that throws/returns `CoreAiAppsContractUnavailableError`;
  no Core endpoint invented
- `AiAppsPage.tsx` — overview counts (total/connected/MCP tools/connectors),
  a local text filter plus a category filter (both simple client-side
  `Array.filter`, mirroring `KnowledgePage.tsx`'s source-type filter — not a
  ranking/search engine), a catalog card grid (`AiAppCard.tsx` — a better fit
  than a list row for entries that each need a name/icon/provider/
  description/status, mirroring how `IntelligencePage.tsx` used cards) with
  a connect/disconnect `Switch` reusing the exact same design-system control
  and interaction pattern as Automations' enable/disable toggle, and a
  click-through detail drawer (`AiAppDetailDrawer.tsx`, full description,
  capabilities/permissions list, the same connect/disconnect control, and an
  explicit "local/mock, not a real OAuth flow" disclosure)
- `AiAppCategoryBadge.tsx` / `AiAppStatusBadge.tsx` — category and
  connection status are always paired with an icon + text label, never color
  alone, mirroring `AutomationStatusBadge.tsx`/`KnowledgeSourceBadge.tsx`
- All async states (loading/ready/empty/error/unavailable) rendered through
  the existing `ModulePage` + `StateView` + `Widget` pattern; no new visual
  language
- Routing: `/apps` wired in `App.tsx` (the pre-existing route stub already
  in `app/modules.tsx`, including its `redirectFrom: ['/plugins']`);
  `app/modules.tsx` entry flipped from `status: 'planned'` to
  `status: 'live'` / `ready: true`, the same transition Knowledge/
  Intelligence went through in Step 10
- `docs/CORE_AI_APPS_CONTRACT_REQUIRED.md` added, mirroring the existing
  Knowledge/Intelligence/Automations contract-requirement docs

**Universal Search integration:** AI Apps were registered as one additional
searchable category (`'ai-app'`) inside the existing Universal Search mock
adapter (`features/search/adapters/mockSearchAdapter.ts`), consistent with
how it already searches automations/pages/local chat/knowledge — honest
substring filtering over name/description/provider, no ranking. Selecting an
AI App result deep-links to `/apps` and opens that entry's detail drawer via
`location.state.aiAppId` (mirrors the existing Automations/Knowledge
deep-link pattern). One pre-existing search test needed a small, honest
update: querying `"auto"` previously matched only the "Automations" nav
destination, but the new "Automations Tool" AI App legitimately matches
`"auto"` too (it is an MCP tool for triggering automations) — the test was
broadened to assert both groups instead of exactly one, the same way Step 10
updated `app/__tests__/modules.test.ts`'s invariant when new legitimate live
data was added. No pre-existing search category's actual behavior changed;
this is additive, and dedicated regression tests confirm Automations/nav/
recent-chat/Knowledge search all still return correct results.

**Developer Mode raw registry — deliberately omitted.** The README's Phase
11 note mentions "raw registries in Developer Mode." This was investigated
and skipped for this step: `app/modules.tsx` defines an `audience:
'developer'` concept and a `/design` route gated that way, but no Developer
Mode toggle/context is actually consumed anywhere in the current UI
(`AppLayout.tsx`, the command palette, etc. never read
`developerModules`/`commandModules(devMode)` — they are unwired metadata
today). Building a gated raw tool/connector registry view for this step
would have meant inventing that gating infrastructure from scratch, which is
out of proportion for a catalog+detail surface. This is documented as an
open item in `docs/CORE_AI_APPS_CONTRACT_REQUIRED.md` for whenever Developer
Mode itself is wired up.

**AI Apps connections are mock/local to this frontend session only.**
`setConnected` only flips a local boolean with simulated latency — it never
redirects to an external URL, never performs a real OAuth handshake, and no
MCP tool call or third-party account access actually happens through this
UI. Real MCP tool execution, connector OAuth, and permission/scope
enforcement remain owned by JARVIS Core and are pending a verified Core
contract (see `docs/CORE_AI_APPS_CONTRACT_REQUIRED.md`).

## Step 12 — Productivity

Per the roadmap (Phase 5, items 9-12: Notes, Tasks + Projects, Calendar,
Files + Workspace) and `JARVIS_CORE_MILESTONES.md` (M11 — Intelligent
Workspace & Productivity — 🟡 Active / Not fully closed, i.e. **not** claimed
complete on the Core side the way M10A/M10B/M10.5 were for Steps 9-11), all
four Productivity surfaces are implemented as user-authored, local-first
CRUD surfaces (unlike the read-only Core-owned Knowledge/Intelligence/AI
Apps surfaces) with an in-memory mock adapter and an explicit unready Core
adapter stub each. All four already had matching `secondary`/`planned`
stubs in `app/modules.tsx`; each is flipped to `live`/`ready: true` in turn,
the same transition Knowledge/Intelligence/AI Apps went through in Steps
10-11. None are added to the primary Home/Chat/Voice/Automations strip; no
sidebar was introduced.

### Notes
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
NotesPage
  ↓
NotesService
  ↓
Mock Notes Adapter (in-memory) / Future Core Adapter
```

Implemented:

- `Note` (`title`, `content` — plain multiline text, intentionally not
  rich-text/Markdown — `tags: string[]`, `pinned: boolean`,
  `createdAt`/`updatedAt`) and `NoteInput` types
- `notesService.ts` seam (`getNotes`, `getNote`, `createNote`, `updateNote`,
  `deleteNote`, `setPinned`), selectable via `VITE_NOTES_BACKEND` (`mock`
  default, `core` stub)
- `adapters/mockNotesAdapter.ts` — 5 seeded notes (2 pinned, 3 unpinned,
  spanning work and personal tags) with real in-memory create/edit/delete/
  pin mutations and simulated latency, mirroring
  `mockAutomationAdapter.ts`'s shape/style
- `adapters/coreNotesAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) throwing `CoreNotesContractUnavailableError`; no Core
  endpoint invented
- `NotesPage.tsx` — a local text filter over title/content/tags, a note
  list (`NoteRow.tsx`) with pin toggle and pinned-first ordering, create/
  edit via `NoteForm.tsx` (plain text area, tag input — no rich-text editor
  built, since the roadmap does not call for one), a detail drawer
  (`NoteDetailDrawer.tsx`) with edit/pin/delete (delete requires
  confirmation, mirroring Automations)
- All async states (loading/ready/empty/error/unavailable) via the existing
  `ModulePage` + `StateView` + `Widget` pattern
- Routing: `/notes` wired in `App.tsx`; `app/modules.tsx` entry flipped from
  `status: 'planned'` to `status: 'live'` / `ready: true`
- `docs/CORE_NOTES_CONTRACT_REQUIRED.md` added

### Tasks
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
TasksPage
  ↓
TasksService
  ↓
Mock Tasks Adapter (in-memory) / Future Core Adapter
```

Per the README's Phase 10 note ("Projects becomes a grouping inside them —
not a navigation destination"), this surface does **not** create a separate
Projects entity, route, service, or nav item — `/tasks` keeps its
pre-existing `redirectFrom: ['/projects']`. `project` is a lightweight,
optional, free-text grouping tag on each `Task` only.

Implemented:

- `Task` (`title`, `description`, `status: 'todo' | 'in-progress' | 'done'`,
  `priority: 'low' | 'medium' | 'high'`, optional `dueDate` (ISO date, no
  time), optional `project` (free-text tag), `createdAt`/`updatedAt`,
  `completedAt` — set on transition to `done`, cleared on reopen) and
  `TaskInput` types
- `tasksService.ts` seam (`getTasks`, `getTask`, `createTask`, `updateTask`,
  `deleteTask`, `setStatus`, `toggleComplete` — a dedicated quick-toggle for
  the list checkbox), selectable via `VITE_TASKS_BACKEND` (`mock` default,
  `core` stub)
- `adapters/mockTasksAdapter.ts` — 6 seeded tasks covering every status/
  priority combination and both project-tagged and untagged tasks, with
  real in-memory create/edit/delete/status-change mutations and simulated
  latency
- `adapters/coreTasksAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) throwing `CoreTasksContractUnavailableError`; no Core
  endpoint invented
- `TasksPage.tsx` — a local text + status + project filter, a task list
  (`TaskRow.tsx`) with a completion checkbox (`toggleComplete`) and
  status/priority badges (`TaskStatusBadge.tsx`/`TaskPriorityBadge.tsx`,
  status never conveyed by color alone), create/edit via `TaskForm.tsx`, a
  detail drawer (`TaskDetailDrawer.tsx`) with edit/status-change/delete
  (delete requires confirmation, mirroring Automations/Notes)
- No autonomous task-execution engine, no AI-generated task suggestions, no
  dependency graph — this is a manual personal task list only
- All async states (loading/ready/empty/error/unavailable) via the existing
  `ModulePage` + `StateView` + `Widget` pattern
- Routing: `/tasks` wired in `App.tsx`; `app/modules.tsx` entry flipped from
  `status: 'planned'` to `status: 'live'` / `ready: true`
- `docs/CORE_TASKS_CONTRACT_REQUIRED.md` added

**Universal Search integration (Notes + Tasks):** both were registered as
additional searchable categories (`'note'`, `'task'`) inside the existing
Universal Search mock adapter, matching name/content/tags (Notes) and
title/description/project (Tasks) — honest substring filtering, no ranking.
Selecting a result deep-links to `/notes` or `/tasks` and opens that item's
detail drawer via `location.state.noteId`/`taskId`. One pre-existing search
test needed the same kind of honest update Step 11 made: querying `"auto"`
now also matches a seeded note whose content mentions "the automation
trigger registry" — the assertion was broadened to include the new `note`
group rather than weakened. Dedicated regression tests confirm Automations/
nav/recent-chat/Knowledge/AI Apps search all still return correct results
alongside the two new categories.

**Search-adapter parallelization fix (Step 12):** adding two more sequential
`await` calls inside `mockSearchAdapter.ts`'s `search()` (on top of
Automations/Knowledge/AI Apps) pushed the total simulated latency for a
single search past ~1.7s, which was fine for one search but caused two
multi-search regression tests (three sequential `search()` calls each) to
exceed the default 5000ms test timeout. Fixed by awaiting all five category
searches concurrently via `Promise.all` instead of sequentially — this is a
genuine correctness/performance fix (every search now takes roughly
`max(individual delays)` instead of their sum), not new functionality, and
does not change any result shape or ordering.

**Both Notes and Tasks are mock/local to this frontend session only.**
Nothing you create, edit, complete, pin, or delete is persisted anywhere
beyond the current browser tab's memory. Real persistence, sync, and
multi-client conflict handling remain owned by JARVIS Core and are pending
verified Core contracts (see `docs/CORE_NOTES_CONTRACT_REQUIRED.md` and
`docs/CORE_TASKS_CONTRACT_REQUIRED.md`).

### Calendar
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
CalendarPage
  ↓
CalendarService
  ↓
Mock Calendar Adapter (in-memory) / Future Core Adapter
```

This is JARVIS's own local/Core-owned calendar surface — not a Google
Calendar/Microsoft 365 client. Third-party calendar *connectors* already
exist as separate AI Apps catalog entries (Step 11, `features/aiApps/`,
e.g. "Google Calendar"); no OAuth flow was built here. Per the roadmap
(Phase 5, item 11), "calendar view" is implemented as a chronological,
day-grouped **agenda list** rather than a month-grid widget — proportionate
to a personal local calendar and consistent with how Notes/Tasks reused the
existing `List`/`ListRow` data component instead of a bespoke visual
widget; a full grid calendar was explicitly out of scope for this pass.

Implemented:

- `CalendarEvent` (`title`, `description`, `start`/`end` — local-naive
  `"YYYY-MM-DDTHH:mm"` datetime strings, the same shape a native
  `<input type="datetime-local">` produces, deliberately without a
  timezone offset since no Core contract defines one yet, `allDay: boolean`,
  optional `location`, `createdAt`/`updatedAt`) and `CalendarEventInput`
  types
- `calendarService.ts` seam (`getEvents(range?)`, `getEvent`, `createEvent`,
  `updateEvent`, `deleteEvent`), selectable via `VITE_CALENDAR_BACKEND`
  (`mock` default, `core` stub); `getEvents` accepts an optional
  `{ from?, to? }` window over each event's `start`, exercised directly in
  `calendarService.test.ts`, though `CalendarPage` itself fetches the full
  set once and filters client-side (mirrors Notes/Tasks/Knowledge's
  established "fetch once, filter locally" convention)
- `adapters/mockCalendarAdapter.ts` — 8 seeded events anchored to a fixed
  "today," spanning two days in the past, two events today (one timed, one
  all-day), and several across the upcoming week+, with real in-memory
  create/edit/delete mutations and simulated latency, mirroring
  `mockNotesAdapter.ts`/`mockTasksAdapter.ts`'s shape/style
- `adapters/coreCalendarAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) throwing `CoreCalendarContractUnavailableError`; no Core
  endpoint invented
- `CalendarPage.tsx` — stat cards (total/today/this week/upcoming), a local
  text filter over title/description/location plus a today/this-week/all-
  upcoming/all-events time filter (both simple client-side `Array.filter`,
  mirroring `TasksPage.tsx`'s multi-filter row), a day-grouped agenda list
  (`CalendarEventRow.tsx`, all-day events marked with a badge and rendered
  distinctly from timed events which show their start time), create/edit via
  `CalendarEventForm.tsx` (title, description, location, an all-day
  `Switch`, and date/time inputs that adapt to the all-day toggle), a detail
  drawer (`CalendarEventDetailDrawer.tsx`) with edit/delete (delete requires
  confirmation, mirroring Automations/Notes/Tasks)
- All async states (loading/ready/empty/error/unavailable) via the existing
  `ModulePage` + `StateView` + `Widget` pattern
- Routing: `/calendar` wired in `App.tsx`; `app/modules.tsx` entry flipped
  from `status: 'planned'` to `status: 'live'` / `ready: true`
- `docs/CORE_CALENDAR_CONTRACT_REQUIRED.md` added

### Files
**Status: COMPLETE — frontend using an in-memory mock adapter; Core integration pending**

Architecture:

```text
FilesPage
  ↓
FilesService
  ↓
Mock Files Adapter (in-memory) / Future Core Adapter
```

There is no real file storage anywhere in this frontend today — this is a
**metadata-only file/folder browser**. No file upload/storage/preview system
was built: `uploadFile` is an explicitly mock, local-only "add a file"
action that fabricates a plausible name/type/size and never touches real
file bytes, and there is no PDF/image viewer — only metadata (type, size,
dates) is shown, per the task's explicit proportionality constraint.

Implemented:

- `FileEntry` (`name`, `type: 'file' | 'folder'`, optional `mimeType`/
  `sizeBytes` for files, optional `parentId` for folder nesting,
  `createdAt`/`updatedAt`) and `CreateFolderInput`/`UploadFileInput` types
- `filesService.ts` seam (`getFiles(folderId?)` — children of a folder, root
  entries when omitted; `getFile`, `createFolder`, `deleteFile` — covers
  both files and folders, cascading to a folder's descendants; `uploadFile`
  — the mock-only add-file action), selectable via `VITE_FILES_BACKEND`
  (`mock` default, `core` stub)
- `adapters/mockFilesAdapter.ts` — a small seeded tree (3 root folders:
  Documents, Pictures, Projects; 5 root-level + 6 nested files across varied
  mime types — PDF, DOCX, XLSX, PNG, JPEG) with real in-memory
  create-folder/delete/upload mutations (delete cascades to a folder's
  descendants) and simulated latency, mirroring
  `mockNotesAdapter.ts`/`mockCalendarAdapter.ts`'s shape/style
- `adapters/coreFilesAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) throwing `CoreFilesContractUnavailableError`; no Core
  endpoint invented
- `FilesPage.tsx` — a `List`/`ListRow`-based file/folder listing
  (`FileEntryRow.tsx`, mirroring `KnowledgeItemRow.tsx`'s "list is the right
  shape for a browsable set" reasoning), folder navigation (clicking a
  folder fetches and shows its children; the existing `Breadcrumb`
  composite — previously unused anywhere in the app — renders the current
  path and navigates back up), per-folder stat cards (folders/files/total
  size), a local name filter, a metadata detail drawer for files
  (`FileDetailDrawer.tsx` — size/type/timeline, no content preview), inline
  delete on every row (files and folders both, since navigating into a
  folder means its own row is no longer reachable to open a drawer from) and
  drawer-based delete for files, both requiring confirmation (a folder's
  confirmation explicitly warns its contents are deleted too), and
  `NewFolderForm.tsx`/`AddFileForm.tsx` — small dedicated forms (`AddFileForm`
  carries an explicit "no real file is uploaded or stored" disclosure)
- All async states (loading/ready/empty/error/unavailable) via the existing
  `ModulePage` + `StateView` + `Widget` pattern; the breadcrumb is rendered
  via `ModulePage`'s `toolbar` slot (outside the loading/empty/error swap)
  so navigating back out of an empty or errored folder is never blocked
- Routing: `/files` wired in `App.tsx`; `app/modules.tsx` entry flipped from
  `status: 'planned'` to `status: 'live'` / `ready: true`
- `docs/CORE_FILES_CONTRACT_REQUIRED.md` added, including the real
  storage/upload contract this mock has none of

**Small additive design-system fix:** `design-system/composites/Breadcrumb/Breadcrumb.tsx`
was unused anywhere in the app before this step. Its non-last crumbs
rendered as an `<a>` with `onClick` but no `href` — a bare anchor without
`href` isn't keyboard-focusable, which would have made Files' folder
breadcrumb (onClick-only, no real hrefs) unreachable by keyboard. Fixed by
rendering a real `<button>` when a crumb has no `href` (keeping the existing
`<a>` path unchanged when one is provided) — small, additive, and
backward-compatible, the same kind of targeted fix Step 9 made to
`SearchOverlay` (`inputProps` passthrough) when reusing a pre-existing,
previously-unwired design-system piece.

**Universal Search integration (Calendar + Files):** both were registered as
additional searchable categories (`'calendar'`, `'files'`) inside the
existing Universal Search mock adapter, matching title/description/location
(Calendar) and file/folder **name only, not folder contents** (Files) —
honest substring filtering, no ranking. Selecting a calendar result
deep-links to `/calendar` and opens that event's detail drawer via
`location.state.eventId`. Selecting a files result deep-links to `/files`
via `location.state.folderId`/`fileId` — a folder result opens that folder
directly, a file result opens its *containing* folder (walking the file's
`parentId`) with the file highlighted once its folder's contents load;
`FilesPage.tsx` resolves the full breadcrumb ancestry for a cold deep link
by walking `parentId` via repeated `getFile` calls, since normal in-app
navigation instead grows the breadcrumb incrementally as the user clicks
through folders. `mockSearchAdapter.ts`'s `searchFiles` walks the mock
file tree level-by-level through the real `FilesService.getFiles` seam
(not by reaching into adapter internals) — each level's folders are fetched
concurrently via `Promise.all` rather than one folder at a time, for the
same latency-stacking reason described below. Two pre-existing search tests
needed the same kind of honest update prior steps made when new legitimate
live data was added: `"calendar"` now also matches the pre-existing "Google
Calendar" AI Apps connector (Step 11), and `"files"` now also matches the
pre-existing "File Access" AI Apps MCP tool, whose description mentions
"files" — both assertions were broadened to include the `ai-app` group
alongside the `app` group rather than weakened. Two calendar seed titles
("Morning run", "Quarterly review call") and two file/note titles that
reused the word "Orb" were renamed during this step (to "Quick jog", "Team
retro call", "Voice UI redesign...") purely to avoid accidental substring
collisions with pre-existing exact-match search regression tests (e.g. the
`"morning"` query asserting exactly one `automation` group) — a data-naming
adjustment, not a behavior change. Dedicated regression tests confirm
Automations/nav/Knowledge/AI Apps/Notes/Tasks/recent-chat search all still
return correct results alongside the two new categories.

**Search-adapter latency fix, again (Step 12):** `searchFiles`'s tree walk
originally awaited one `getFiles(folderId)` call per folder sequentially
inside a `while` loop — the exact same latency-stacking problem the Notes +
Tasks pass had already fixed once at the top level via `Promise.all`. Left
unfixed, a single `search()` call's total time became bounded by *that*
sequential chain instead of the top-level `Promise.all`'s `max(...)`, and a
test issuing several sequential `search()` calls exceeded the default
5000ms test timeout again. Fixed by fetching every folder at a given tree
depth concurrently via `Promise.all`, walking depth by depth — a genuine
correctness/performance fix, not new functionality.

**Both Calendar and Files are mock/local to this frontend session only.**
Nothing you create, edit, or delete is persisted anywhere beyond the current
browser tab's memory, and Files' "Add file" action never touches a real
file. Real persistence, sync, and (for Files) real storage/upload remain
owned by JARVIS Core and are pending verified Core contracts (see
`docs/CORE_CALENDAR_CONTRACT_REQUIRED.md` and
`docs/CORE_FILES_CONTRACT_REQUIRED.md`).

---

## Step 13 — Smart Home Command Center

**Status: COMPLETE — frontend using an in-memory mock adapter; Core/Home Assistant/MQTT integration pending**

Per the roadmap (Phase 6, item 13 "Smart Home Command Center" — the first of
three separate M12 items; item 14 "Device Management" and item 15 "Home
Assistant + MQTT" are later, out-of-scope steps) and `JARVIS_CORE_MILESTONES.md`
(M12 — 🟡 Active; Home Assistant and MQTT connectors are marked "shipped" on
the Core side, but no concrete API contract is documented anywhere in this
frontend checkpoint, and reading `2.0-main`/`backend/` to find one was out of
scope for this task), the Command Center is implemented entirely against
normalized, vendor-neutral entities per `JARVIS_FRONTEND_ARCHITECTURE.md`'s
"do not implement a second smart-home protocol engine" rule — no Philips
Hue/Tuya/Shelly-style UI, no raw Home Assistant entity ids surfaced as native.

Architecture:

```text
SmartHomePage
  ↓
SmartHomeService
  ↓
Mock Smart Home Adapter (in-memory) / Future Core Adapter
```

Implemented:

- `Room` (`name`, `icon`, derived `deviceCount`, derived `status: 'all_off' |
  'some_on' | 'all_on'`), `Device` (`name`, `roomId`, `type`, `capabilities:
  DeviceCapability[]`, a typed `state` covering only the capabilities it has,
  `availability: 'online' | 'offline' | 'unavailable'`), `Scene` (`name`,
  `description`, an ordered, display-only `actions` summary list), and a
  normalized `DeviceCommand` union (`TURN_ON`/`TURN_OFF`/`SET_BRIGHTNESS`/
  `SET_TEMPERATURE`/`SET_FAN_SPEED`/`LOCK`/`UNLOCK`) — never a vendor-specific
  command shape
- `smartHomeService.ts` seam (`getRooms`, `getRoom`, `getDevices`,
  `getDevice`, `sendCommand`, `getScenes`, `triggerScene`,
  `subscribeToDeviceState`), selectable via `VITE_SMART_HOME_BACKEND` (`mock`
  default, `core` stub)
- `adapters/mockSmartHomeAdapter.ts` — 6 seeded rooms (Living Room, Bedroom,
  Kitchen, Bathroom, Entrance, Outdoor) and 12 seeded devices spanning every
  capability (a dimmable light, a thermostat, a fan, a lock, a speaker, and a
  sensor among them), including one `offline` device and one `unavailable`
  device to exercise those states; 3 seeded scenes (Good Night, Movie Time,
  Away Mode) each affecting 2-4 devices. `sendCommand`/`triggerScene` perform
  real in-memory mutations with simulated latency — `triggerScene` only ever
  returns devices that actually changed (an offline/unavailable device
  targeted by a scene is skipped, never faked as updated). A light, honest
  realtime seam: `subscribeToDeviceState` fires on every genuine state change
  from `sendCommand`/`triggerScene`, plus a single `setInterval`-driven
  simulated drift for one seeded sensor device (a bedroom temperature
  sensor) — not a general per-device push system, the lightest version
  proportional to this step
- `adapters/coreSmartHomeAdapter.ts` — intentionally unimplemented stub
  (`ready: false`) throwing `CoreSmartHomeContractUnavailableError` for every
  method; no Home Assistant/MQTT/Core endpoint invented, and this adapter
  never contacts a connector directly — only a future verified Core contract
  would
- `SmartHomePage.tsx` — a room overview grid (`RoomCard.tsx`, device count +
  aggregate status badge via `RoomStatusBadge.tsx`), a device grid
  (`DeviceTile.tsx`) with capability-appropriate inline controls (a toggle
  for `power`/`locked`, a slider/stepper for `brightness`/`temperature`, a
  segmented control for `fan_speed`, a read-only value for `sensor`) and an
  availability badge (`DeviceAvailabilityBadge.tsx`, never color-only), and a
  scenes section (`SceneCard.tsx`) with a trigger button that visibly updates
  the affected device tiles
- **A prominent, hard-to-miss simulation-disclosure banner** at the top of
  the page (`data-testid="smart-home-simulation-banner"`) — more visible
  than the quiet mock/local footnotes used elsewhere in this app, since a
  device-control UI could otherwise read as controlling something real: it
  states plainly that every room/device/scene is simulated inside this
  browser tab's memory and that no command sent from the page affects
  anything physical
- No vendor-specific UI, no autonomous scene engine (scenes are pre-defined
  data the frontend displays and triggers, never authored/edited/computed
  client-side), no Device Management (item 14) or Home Assistant/MQTT
  connector configuration (item 15) built here — those are separate, later
  steps
- All async states (loading/ready/empty/error/unavailable) via the existing
  `ModulePage` + `StateView` + `Widget` pattern
- Routing: `/smart-home` wired in `App.tsx`; a **net-new** `app/modules.tsx`
  entry (`surface: 'secondary'`, `status: 'live'`, `ready: true`) — unlike
  Steps 10-12, there was no pre-existing `'planned'` stub to flip. Not added
  to the primary Home/Chat/Voice/Automations strip; no sidebar introduced
- `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md` added

**Universal Search integration:** Rooms, Devices, and Scenes were registered
as three additional searchable categories (`'room'`, `'device'`, `'scene'`)
inside the existing Universal Search mock adapter — honest substring
filtering (room/device name and type, scene name and description), no
ranking, added into the same `Promise.all` fan-out the Step 12 latency fixes
established (not a new sequential chain). Selecting a result deep-links to
`/smart-home` with `location.state.roomId`/`deviceId`/`sceneId`. Dedicated
regression tests confirm every prior category (app/nav, automations,
knowledge, AI Apps, notes, tasks, calendar, files, recent chat) still returns
correct results alongside the three new ones.

**Smart Home is mock/local to this frontend session only.** Every room,
device, and scene lives only in this browser tab's memory; no real hardware,
Home Assistant instance, or MQTT broker is ever contacted, and no command
sent from this page affects anything physical. Real device discovery,
command execution, and realtime state remain owned by JARVIS Core (routed
through its Permission Engine / Execution Engine / Tool Registry — the
frontend must never bypass that) and are pending a verified Core contract
(see `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`).

---

## Step 14 — Device Management

**Status: COMPLETE — frontend using the same in-memory mock adapter as Step 13; Core/Home Assistant/MQTT integration pending**

Per the roadmap (Phase 6, item 14 "Device Management" — the second of three
separate M12 items, scoped by `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`'s
"out of scope for item 13" list as "deep per-device settings,
pairing/onboarding new devices, firmware/diagnostics, device renaming or
reassignment between rooms"), this step extends the Step 13 Command Center
**additively on the same `SmartHomeService` seam** rather than introducing a
second service — the contract doc's own open question (§12, "a separate
`DeviceManagementService`?") was resolved in favor of one seam, consistent
with `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do not build a second
smart-home protocol engine" rule and this project's "do not duplicate
existing services" rule.

Architecture:

```text
SmartHomePage (Step 13)              DeviceManagementPage (Step 14)
  │  "Manage devices" action  ──────────────►  same page, /smart-home/devices
  │  DeviceTile "Manage" button (per device) ─►  opens that device's drawer
  ▼                                            ▼
              SmartHomeService (one seam, extended additively)
                            ▼
     Mock Smart Home Adapter (in-memory) / Future Core Adapter
```

Implemented:

- `smartHomeService.ts` — three new seam methods (`updateDevice`,
  `removeDevice`, `pairDevice`) alongside the Step 13 methods, plus optional,
  additive, never-fabricated health/diagnostics fields on `Device`
  (`battery?`, `signalStrength?`, `firmwareVersion?`, `lastSeenAt?`,
  `connector?: { type: 'home_assistant' | 'mqtt' | 'native'; externalId? }`).
  A missing field always renders as "Not reported", never a guessed value.
  `connector` is read-only display metadata — the frontend never calls a
  connector directly; connector *configuration* remains item 15
- `adapters/mockSmartHomeAdapter.ts` — `updateDevice` (rename/room-reassign,
  trims and validates the name, validates the target room exists),
  `removeDevice` (deletes the device and tears down any active
  `subscribeToDeviceState` subscription so nothing leaks), `pairDevice`
  (validates name/room/capabilities, then a simulated ~1.5s "discovering
  device…" delay — noticeably longer than this adapter's normal ~300ms
  latency — before adding the device with sensible per-capability default
  state and full battery/signal/factory-firmware values). Every one of the
  12 seeded devices from Step 13 got additive health/diagnostics/connector
  metadata (2 devices intentionally omit `connector` to exercise the
  "not reported" display path honestly)
- `adapters/coreSmartHomeAdapter.ts` — the three new methods added as
  unimplemented stubs consistent with every other method (`ready: false`,
  rejects with `CoreSmartHomeContractUnavailableError`); no Core Device
  Management endpoint invented
- `DeviceManagementPage.tsx` (new route `/smart-home/devices`) — a
  `List`/`ListRow`-based device list (`DeviceManagementRow.tsx`, a better
  fit for a management list than the Command Center's card grid) with a
  text filter, a room filter, and stat cards (Devices/Online/Needs
  attention/Low battery); clicking a row opens `DeviceManagementDrawer.tsx`
  (capabilities, a read-only current-state summary — control stays on the
  Command Center — `DeviceHealthSummary.tsx`'s battery/signal/firmware/
  last-seen/connector display, and a rename + room-reassign form); a
  "Pair new device" action opens `PairDeviceForm.tsx` in a modal
  (name/room/type/capabilities, type-based capability defaults that stay
  fully editable, the simulated discovering-device state surfaced visibly
  while `pairDevice` is in flight); removing a device goes through an
  explicit confirm dialog. The same prominent simulation-disclosure banner
  pattern from Step 13 is repeated here
- Two entry points into Device Management, both deep-linking via
  `location.state.deviceId` (mirrors the Step 13/Universal Search
  deep-link pattern): a new "Manage devices" header action on
  `SmartHomePage.tsx`, and a new per-device "Manage" icon button on
  `DeviceTile.tsx` (opens that specific device's drawer directly)
- Routing: `/smart-home/devices` wired in `App.tsx` alongside `/smart-home`;
  not a new `app/modules.tsx` entry (it is reached only via the two
  in-page entry points above, not a nav/search destination of its own)
- No connector configuration UI, no real device-discovery protocol of any
  kind (`pairDevice` is a pure UI-feel `setTimeout` simulation — no
  Bluetooth/Zigbee/WiFi/mDNS/Home Assistant/MQTT discovery runs anywhere in
  this frontend), and rooms remain the fixed Step 13 seeded set (no room
  creation UI) — all per `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`'s
  scope boundary for this item

**Device Management is mock/local to this frontend session only**, the same
as Step 13 — a full page reload resets every rename/pair/remove back to the
Step 13 seed data, since nothing is persisted outside this browser tab's
memory. Real pairing/onboarding, device configuration persistence, and
health/diagnostics telemetry remain owned by JARVIS Core and are pending a
verified Core contract.

---

## Step 15 — Home Assistant + MQTT

**Status: COMPLETE — frontend using in-memory mock adapters (one per connector); Core/Home Assistant/MQTT integration pending**

Per the roadmap (Phase 6, item 15 "Home Assistant + MQTT" — the third and
final M12 item, following item 13 "Smart Home Command Center" and item 14
"Device Management") and `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`'s own
scoping note for item 15 ("connecting/authenticating a Home Assistant
instance or MQTT broker, entity-mapping/discovery configuration, connector
health/status UI. The frontend never talks to a connector directly in any
adapter, mock or future-Core — only Core would, behind this seam"), this
step adds a **connector layer** on top of the existing Smart Home area —
never a second Smart Home system, never a real MQTT client or Home
Assistant REST/WebSocket client anywhere in this frontend.

Architecture:

```text
IntegrationsPage
        │
ConnectorService (one instance per connector — independent readiness)
        │
   ┌────┴────┐
Home Assistant   MQTT
        │            │
   Mock Adapter  Mock Adapter   /  Core Adapter (stub, ready:false)
        │
 DiscoveredEntity preview (normalized DeviceType/DeviceCapability,
 never merged into the live Smart Home Command Center device list)
```

Implemented:

- `smartHomeIntegrationService.ts` — the `ConnectorService` seam
  (`getState`, `connect`, `disconnect`, `reconnect`, `syncEntities`), two
  independent instances (`getHomeAssistantConnectorService()`,
  `getMqttConnectorService()`), each selectable via its own
  `VITE_HOME_ASSISTANT_BACKEND` / `VITE_MQTT_BACKEND` env var (`mock`
  default, `core` stub) — independent because Core may ship one connector's
  real contract before the other's. Types: `ConnectorStatus`
  (`not_configured`/`disconnected`/`connecting`/`connected`/`error`),
  `CredentialState` (`not_configured`/`configured`/`invalid`/`unavailable`
  — **never** the raw credential value), `ConnectorState`, `DiscoveredEntity`
  (normalized into the existing `DeviceType`/`DeviceCapability` vocabulary,
  never a raw Home Assistant entity id or MQTT topic/payload shape)
- `adapters/mockHomeAssistantAdapter.ts` / `adapters/mockMqttAdapter.ts` —
  in-memory mock state per connector. `connect()` validates the form input
  is non-empty, discards the secret immediately (never stored, never
  returned in any state snapshot — covered by an explicit test asserting
  the raw secret string never appears in `JSON.stringify(state)` or the
  rendered DOM), and records only a display label; a simulated
  connecting delay (~1-1.2s) precedes `connected`. `disconnect()` clears
  discovered entities (no longer confirmed live). `reconnect()` requires
  `disconnected`/`error`. `syncEntities()` requires `connected`, simulates a
  discovery delay (~1.5s, mirroring Device Management's `pairDevice`
  pattern), and returns a small, fixed **preview** list — deliberately
  never merged into `mockSmartHomeAdapter.ts`'s seeded `devices` array, so
  Step 13/14's established dataset and tests stay untouched. A capped
  (20-entry), newest-first diagnostics log records every state transition
- `adapters/coreHomeAssistantAdapter.ts` / `adapters/coreMqttAdapter.ts` —
  intentionally unimplemented stubs (`ready: false`), every method rejects
  with `CoreConnectorContractUnavailableError`; no Home Assistant/MQTT/Core
  endpoint invented
- `IntegrationsPage.tsx` (new route `/smart-home/integrations`) — two
  `ConnectorCard.tsx` summary cards (status badge — icon + text, never
  color-only — credential state, last synced, discovered-entity count);
  clicking one opens `ConnectorDetailDrawer.tsx` (credential state, a
  connect/reconnect form when not connected — endpoint + a `type="password"`
  secret field, cleared from the form's own state immediately after submit
  — connect/disconnect/sync actions when connected, the discovered-entities
  preview list, and the diagnostics log). A connector whose backend isn't
  `ready` (Core selected, contract still pending) renders a distinct,
  honest "not connected yet" card/drawer state rather than fabricating
  status — this is a genuine architectural difference from Step 13/14's
  single-service pattern, since the two connectors' Core readiness is
  independent
- Two entry points, both from `SmartHomePage.tsx`'s header actions: a new
  "Integrations" action (always enabled, independent of the main
  `SmartHomeService`'s own readiness) alongside the existing "Manage
  devices" action
- Routing: `/smart-home/integrations` wired in `App.tsx` alongside
  `/smart-home` and `/smart-home/devices`; not a new `app/modules.tsx`
  entry, same reasoning as Device Management
- No connector configuration UI beyond status/connect/disconnect/sync, no
  real device-discovery protocol, no credential ever displayed or
  persisted, and synced entities are never promoted into the Command
  Center's live, controllable device set — all per
  `docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md`'s scope boundary
- `docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md` added — no verified
  Home Assistant, MQTT, or Core connector contract was found anywhere in
  this frontend checkpoint (confirmed via an explicit repository search
  before implementation, excluding `2.0-main`/`backend/` per this task's
  scope), so none was invented

**Home Assistant + MQTT integration is mock/local to this frontend session
only.** No real Home Assistant instance or MQTT broker is ever contacted;
"connecting" never performs a real handshake, and no entered credential is
stored or displayed back. A full page reload resets both connectors to
`not_configured`. Real connection, entity discovery/sync, and the
entity-to-device promotion step remain owned by JARVIS Core and are
pending a verified Core contract (see
`docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md`).

This completes roadmap Phase 6 / M12 Smart Home & IoT (items 13-15).

---

## Step 16 — Memory

**Status: COMPLETE — frontend using an in-memory mock adapter; Core memory integration pending**

Per the roadmap (Phase 7, item 16 "Memory" — status "Placeholder / contract
verification required", the only detail given anywhere in the roadmap
docs) and `docs/JARVIS_CORE_FRONTEND_MAPPING.md` ("Memory | Core
future/current capability | ⚠️ Verify | 🔴/placeholder | Do not invent
API"), no Core Memory milestone, endpoint, or schema is documented
anywhere in this checkpoint. `README.md`'s own product-vision sections
describe the **intended** future capability this step builds toward: a
vector store + knowledge graph behind a "recall UI" — "things Jarvis
remembers." Based on that intent (there being nothing more concrete to go
on), this step implements Memory as a **read-only recall list + detail +
forget** surface — never a place to author or edit a memory's content
(a memory represents something JARVIS itself formed from a conversation),
and never semantic/vector search (honest local substring filtering only,
per `JARVIS_FRONTEND_ARCHITECTURE.md`'s "do not implement a second...
memory engine" rule).

Architecture:

```text
MemoryPage
        │
MemoryService (one seam, mirrors Knowledge/Notes/Smart Home)
        │
  Mock Adapter (in-memory) / Core Adapter (stub, ready:false)
```

Implemented:

- `memoryService.ts` — the `MemoryService` seam (`getMemories`,
  `getMemory`, `forgetMemory` — deliberately no create/edit-content
  method), selectable via `VITE_MEMORY_BACKEND` (`mock` default, `core`
  stub). Data model: `Memory { id, content, type, source, importance,
  createdAt }` — `MemoryType` (`Preference`/`Context`/`Device`/`Routine`/
  `Instruction`), `MemorySource` limited to `'chat' | 'voice'` (the two
  real, already-built interactive surfaces — never an invented ingestion
  pipeline), `MemoryImportance` (`low`/`medium`/`high`). No `confidence`
  or other raw ML/pipeline field — per `CLAUDE.md`'s rule that memory
  internals (vector store, embeddings) stay behind Developer Mode, this
  end-user surface doesn't fabricate one to imply it exists
- `adapters/mockMemoryAdapter.ts` — 9 seeded memories spanning every type,
  both sources, and all three importance levels; all clearly fictional
  local-development content (ordinary preferences/routines/instructions
  like "Preferred home temperature is 23°C.", "Jarvis should use concise
  responses.") — never a real secret, credential, or private identifying
  detail, and an explicit test asserts none of the seed content matches a
  password/API-key/token/secret/financial-identifier pattern.
  `forgetMemory` performs a real in-memory deletion (the one write
  operation this step supports)
- `adapters/coreMemoryAdapter.ts` — intentionally unimplemented stub
  (`ready: false`), every method rejects with
  `CoreMemoryContractUnavailableError`; no Core Memory endpoint invented
- `MemoryPage.tsx` (new route `/memory`) — a `List`/`ListRow`-based
  memory list (`MemoryRow.tsx`) with local text search and a type filter,
  stat cards, and the standard simulation-disclosure banner; clicking a
  row opens `MemoryDetailDrawer.tsx` (content, type, source, importance,
  when it was formed, and a "Forget this memory" action). Forgetting goes
  through an explicit confirmation dialog ("Forget this memory? / This
  memory will be removed from local development data. / [Cancel]
  [Forget]") — never an ambiguous destructive label
- Routing: `/memory` wired in `App.tsx`; a **net-new**
  `app/modules.tsx` entry (`surface: 'secondary'`, `status: 'live'`,
  `ready: true`, no `core` milestone cited — none is confirmed to exist).
  The old v1 `/memory → /settings` redirect (`Settings`'s `redirectFrom`)
  was removed now that `/memory` has a real page of its own — a
  regression test confirms this
- **Universal Search integration**: Memory was registered as a fourth
  Step-13-style additional searchable category (`'memory'`) — honest
  substring filtering over memory content only, deep-linking to `/memory`
  with `location.state.memoryId`. The search seam's own doc comment
  previously named Memory as the explicit example of "not yet ready" for a
  category; it became one now that Step 16 actually built the backing
  surface/dataset. Regression tests confirm every prior category still
  works, including one legitimate new overlap (the seeded "Usually asks
  for a morning briefing around 8 AM" memory honestly also matches the
  pre-existing Step 8 "morning" → Automations query — the old exhaustive
  test was broadened, not weakened, mirroring how Step 13's own room/device
  overlaps were handled)
- No memory creation/editing UI, no semantic/vector search, no knowledge
  graph or memory-linking UI, no confidence scores, no second permission
  system, no localStorage use (memories live only in the mock adapter's
  module-level JS state, confirmed empty via a live browser check) — all
  per `docs/CORE_MEMORY_CONTRACT_REQUIRED.md`'s scope boundary
- `docs/CORE_MEMORY_CONTRACT_REQUIRED.md` added — no verified Core Memory
  contract was found anywhere in this frontend checkpoint (confirmed via
  an explicit repository search before implementation, excluding
  `2.0-main`/`backend/` per this task's scope), so none was invented

**Memory is mock/local to this frontend session only.** No real Core
memory service, vector store, or embeddings pipeline is ever contacted; a
full page reload resets every memory back to the 9 seeded items (a
Forget'd memory returns on reload, since nothing persists outside this
mock's in-memory JS state — no localStorage is used). Real memory
formation, semantic recall, and retention/expiry policy remain owned by
JARVIS Core and are pending a verified Core contract (see
`docs/CORE_MEMORY_CONTRACT_REQUIRED.md`).

---

## Step 17 — Agents

**Status: COMPLETE — frontend using an in-memory mock adapter; Core AgentOrchestrator integration pending**

Per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Agents ("M10 |
🟡 Active | 🔴/placeholder | **Expose existing orchestration; no second
agent framework.**"), this step required a genuine scope correction from
the literal word "Agents": every other mention of "agent" in this
checkpoint ties back to the single, existing `AgentOrchestrator` that
already powers Chat/Voice (Steps 4-5) — not a catalog of independent,
user-invokable autonomous services. Corroborating evidence found before
implementing anything: the old v1 `/agents` route already redirected to
`/chat`; `Automation.actions` (Step 8) already includes a `'run-agent'`
action type, i.e. "running an agent" is already modeled as a Core-owned
*consequence* an Automation triggers, not something this surface hands the
user a button to fire; and the Home dashboard's pre-existing "Active
agents" stat and "AI Timeline" entries (e.g. "Research Agent completed a
market brief") are flavor-text mock data illustrating named *roles* the
orchestrator adopts when reporting activity, not independently-executable
services. Given this, this step implements Agents as an **observability +
lightweight state-management surface — never an execution surface**.

Architecture:

```text
AgentsPage
  ↓
AgentService (getAgents/getAgent/getRuns/setEnabled — no run/execute method)
  ↓
Mock Agent Adapter (in-memory) / Future Core Adapter (ready: false)
```

Implemented:

- `agentService.ts` — the `AgentService` seam. Types: `AgentStatus`
  (`active`/`idle`/`disabled`), `Agent` (`id`, `name`, `description`,
  `status`, `capabilities`, `lastRunAt?`), `AgentRunStatus`
  (`completed`/`failed` only — always already-resolved history, never a
  live `queued`/`running` state this UI itself initiated), `AgentRun`
  (`id`, `agentId`, `status`, `startedAt`, `completedAt`, `summary`).
  Deliberately **no create/run/execute method** — a memory-style
  "never user-authored" rule extended to agents: this frontend never
  simulates an LLM planning/execution loop
- `adapters/mockAgentAdapter.ts` — 5 seeded fictional agent roles (Research
  Agent, Daily Briefing Agent, System Health Agent, Task Planning Agent,
  Smart Home Agent) spanning all three statuses (2 active, 2 idle, 1
  disabled) with a shared activity history dataset (7 `AgentRun` entries
  across 4 agents; the disabled Smart Home Agent has zero runs, honestly
  exercising the empty-history state). `setEnabled(id, enabled)` is a pure
  local state toggle (`disabled` ⇄ `idle`), mirroring Automations'
  `setEnabled` — never an execution action
- `adapters/coreAgentAdapter.ts` — intentionally unimplemented stub
  (`ready: false`), every method rejects with
  `CoreAgentContractUnavailableError`; no Core Agents/AgentOrchestrator
  endpoint invented
- `AgentsPage.tsx` (new route `/agents`) — a card grid (`AgentCard.tsx`,
  mirrors `AutomationCard.tsx`) with status badge, capability badges, and
  an enable/disable `Switch`; stat cards (Total/Active/Idle/Disabled);
  clicking a card opens `AgentDetailDrawer.tsx` (capabilities, last
  activity, a read-only `AgentRunHistoryList.tsx` fetched per-agent on
  selection — scoped loading state so already-loaded agent details never
  disappear while just the history is still fetching — and the same
  enable/disable toggle). The same prominent simulation-disclosure banner
  pattern from Steps 13-16 is repeated here, explicit that the page "does
  not run or execute anything"
- Routing: `/agents` wired in `App.tsx`; a **new** `app/modules.tsx` entry
  (`surface: 'secondary'`, `status: 'live'`, `ready: true`, `core: 'M10'`
  — reusing Chat/Voice's milestone since Agents exposes the same
  orchestrator, never a second one). The old v1 `/agents → /chat` redirect
  (`Chat`'s `redirectFrom`) was removed now that `/agents` has its own
  real page — verified via a dedicated regression test
- **Universal Search integration**: Agents became an additional searchable
  category (`'agent'`), searched by name/description, deep-linking to
  `/agents` with `location.state.agentId`. Regression tests confirm every
  prior category still works, including an honest broadening (not a
  weakening) of an existing Step 8 test: "morning" now legitimately also
  matches the seeded "Daily Briefing Agent" ("Compiles your morning
  briefing…"), alongside the Step 16 "Usually asks for a morning
  briefing…" memory and the pre-existing "Morning Brief" automation — the
  same room/device-style overlap pattern Step 13 established
- No manual "Run agent" action, no agent creation/configuration UI, no
  real permission enforcement, no second chat interface — all per
  `docs/CORE_AGENTS_CONTRACT_REQUIRED.md`'s scope boundary
- `docs/CORE_AGENTS_CONTRACT_REQUIRED.md` added — no verified Core Agents
  contract was found anywhere in this frontend checkpoint (confirmed via
  an explicit repository search before implementation, excluding
  `2.0-main`/`backend/` per this task's scope), so none was invented

**Agents is mock/local to this frontend session only.** No real Core
AgentOrchestrator is ever contacted; a full page reload resets every
agent's enabled/disabled state and the (fixed, never-mutated) activity
history back to seed data. Real agent-role identity, the relationship
between this surface's activity and Chat's own conversation history, and
enable/disable semantics on Core's actual orchestrator remain owned by
JARVIS Core and are pending a verified Core contract (see
`docs/CORE_AGENTS_CONTRACT_REQUIRED.md`).

---

## Step 19 — Settings

**Status: COMPLETE — one real `SettingsService`-backed preference
(`notificationsEnabled`), everything else configures an existing feature's
own service directly; Core settings/preferences integration pending**

Roadmap item 19 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 8, "System")
had no elaboration beyond "Placeholder." No Core settings/preferences
contract is documented anywhere in this checkpoint (confirmed via an
explicit repository search across settings, preferences, appearance,
theme, notifications, voice, privacy, security, connections, and every
other feature's preference surface, before implementing anything) — none
was invented; see `docs/CORE_SETTINGS_CONTRACT_REQUIRED.md`.

Architecture:

```text
SettingsPage (10 tabs)
  ↓
SettingsService (getSettings/updateSettings/resetSettings — owns `notificationsEnabled` only)
  ↓
mockSettingsAdapter (localStorage) / coreSettingsAdapter (ready: false)
```

Every other tab reads an *existing* feature's own service directly and
links to that feature's real page — Settings never duplicates another
feature's catalog, data model, or controls:

- **Appearance** — NOT backed by `SettingsService` at all. Reads/writes
  the existing, already-shipped `ThemeProvider` directly (the same engine
  `QuickSettings` already used) — theme mode, density, contrast, Liquid
  Glass. Verified live: switching Light/Dark/System actually changes
  `document.documentElement`'s `data-theme` attribute
- **Voice** — read-only status over the existing `VoiceService` seam
  (backend id/label/ready, STT/TTS capability flags); no fake
  microphone/speaker control, since none exists in the underlying seam. A
  "Start voice session" button reuses `AppLayout`'s existing voice overlay
  via outlet context — no second voice engine
- **Notifications** — the one real `SettingsService`-backed preference.
  Toggling `notificationsEnabled` genuinely empties `AppLayout`'s
  `NotificationCenter` bell menu and hides its unread badge (verified live
  in the browser and via a dedicated end-to-end regression test) — not a
  fake toggle. No per-category notification toggles were built (no
  per-category notification data model exists anywhere in this checkpoint)
- **Privacy** — informational (what's stored locally) plus a real link
  into Memory (`/memory`). No toggle claims to change Core-side data
  retention, since no verified Core contract for that exists; shown as an
  honest "Unavailable" card instead
- **Smart Home** — read-only summary (room/device/scene counts via
  `SmartHomeService`) plus the existing `ConnectorCard` component (reused
  as-is) showing Home Assistant/MQTT status via `ConnectorService`.
  Connect/disconnect/sync stays exclusively on `IntegrationsPage` (Step
  15); this tab only summarizes and links there
- **AI Apps, Memory, Agents, Automations** — each a read-only summary card
  (via a shared `SettingsSummaryCard` component) over that feature's own
  service, with a link to its real page. No catalog, recall, execution, or
  orchestration logic duplicated
- **About** — the frontend's real `package.json` version (via a
  `resolveJsonModule` import, not a hardcoded string) plus a live
  system-status table reading every backend seam's actual `id`/`label`/
  `ready` values (Chat, Voice, Automations, Smart Home, Home Assistant,
  MQTT, Memory, Agents, Settings itself) — never fabricated

Implemented:

- `settingsService.ts` — the `SettingsService` seam. `AppSettings { notificationsEnabled: boolean }`
  and `DEFAULT_SETTINGS`. Deliberately small — only a preference with a
  genuine, verifiable effect belongs here
- `adapters/mockSettingsAdapter.ts` — persists to `localStorage`
  (`jarvis.settings`) — real, honest client-side persistence across
  reloads, not a per-tab-session simulation like most other mock adapters
- `adapters/coreSettingsAdapter.ts` — intentionally unimplemented stub
  (`ready: false`), every method rejects with
  `CoreSettingsContractUnavailableError`
- `SettingsProvider.tsx` — a React context wrapping `SettingsService`,
  mounted once in `main.tsx` (mirrors `ThemeProvider`). Unlike
  `useTheme()`, `useSettings()` does **not** throw outside a provider — it
  falls back to `DEFAULT_SETTINGS` — because `AppLayout` (the shared shell
  every route renders) reads it, and dozens of pre-existing feature test
  files already render the full `<App/>` tree without a `SettingsProvider`
  wrapper; a throwing hook would have broken all of them for an unrelated
  step. The safe default exactly matches `AppLayout`'s pre-Step-19
  behavior, so nothing regressed
- `SettingsPage.tsx` — `ModulePage` + a 10-tab `Tabs` (line variant):
  Appearance, Voice, Notifications, Privacy, Smart Home, AI Apps, Memory,
  Agents, Automations, About. A header "Reset to defaults" action opens a
  centered `Modal` confirmation ("Reset settings?") explaining exactly
  what resets (the notification preference) and what does not (Memory,
  Files, Tasks, Automations, Smart Home devices, Agent history, and
  Appearance — Appearance is intentionally excluded from reset since it
  isn't owned by this seam)
- Routing: `/settings` wired in `App.tsx`; the existing `app/modules.tsx`
  entry (already present as a `surface: 'settings'` placeholder since
  Step 2) flipped from `status: 'planned'` to `status: 'live', ready:
  true` — no new module entry needed, and no primary-nav change (Settings
  stays in the top-bar right cluster, not the Home/Chat/Voice/Automations
  strip)
- **Universal Search integration**: no code change was needed.
  `searchService.ts`'s `'app'` category doc comment already listed
  Settings among the nav destinations `searchApp()` covers, and
  `mockSearchAdapter.ts`'s `searchApp()` already read `settingsModules`
  unconditionally (regardless of `status`) — flipping the module to `live`
  was sufficient. No individual setting/toggle became a separate search
  result — only the Settings destination itself, verified via a
  regression test asserting exactly one `/settings` result
- No Developer Mode surface, no AI provider/credential management, no
  connector connect/disconnect UI, no bulk Memory/Automations mutation —
  all deliberately out of scope per `docs/CORE_SETTINGS_CONTRACT_REQUIRED.md`
- `docs/CORE_SETTINGS_CONTRACT_REQUIRED.md` added — no verified Core
  settings/preferences contract was found anywhere in this frontend
  checkpoint (confirmed via an explicit repository search before
  implementation, excluding `2.0-main`/`backend/` per this task's scope),
  so none was invented

**Settings preferences are local-device-only.** `notificationsEnabled`
persists in this browser's `localStorage` and is never synced to another
device or to JARVIS Core. Appearance persists via `ThemeProvider`'s own
existing `localStorage` key, unaffected by this step. Real Core-backed
settings sync, notification delivery, and data-retention controls remain
owned by JARVIS Core and are pending a verified Core contract (see
`docs/CORE_SETTINGS_CONTRACT_REQUIRED.md`).

---

## Step 20 — Diagnostics + Performance

**Status: COMPLETE — honest local introspection of every other feature's
adapter status, plus real browser-Performance-API metrics; Core
Self-Healing & Observability (M13B) integration pending, and unlike every
prior step, that milestone has not started at all**

Roadmap item 20 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 8, "System")
was explicitly marked "Placeholder / Core contract dependent." A
repository search before implementation confirmed
`docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Diagnostics reads "M13B/
future observability | 🔴/future | Do not pretend future Core exists," and
`docs/JARVIS_CORE_MILESTONES.md` marks M13B — Self-Healing & Observability
🔴 Not Started / future capability — the only frontend surface in this
checkpoint whose underlying Core milestone has not started at all (every
other step's milestone was at least partial/active/"verify"). This changed
the shape of the step: rather than seeding a plausible-looking fake health
dashboard (the way, say, `mockAgentAdapter.ts` seeds plausible agent
roles), the frontend adapter instead introspects data that is **already
real** — this frontend's own adapter registry — and is explicit and
permanent about what Core cannot yet provide.

Architecture:

```text
DiagnosticsPage
  ↓
DiagnosticsService (getSystemStatus / getCoreHealth)
  ↓
mockDiagnosticsAdapter (introspects every other feature's real service) / coreDiagnosticsAdapter (ready: false)

performanceMetrics.ts — NOT part of the adapter seam; reads the browser's
own Performance API directly, the same way AboutSection reads pkg.version
```

Implemented:

- `diagnosticsService.ts` — the `DiagnosticsService` seam:
  `SystemComponentStatus { key, name, backendId, backendLabel, ready }`
  and `CoreHealthSnapshot { available, milestone, message }`
- `adapters/mockDiagnosticsAdapter.ts` — **not fabricated data.** Calls
  every other shipped feature's own `getXService()` accessor (Home, Chat,
  Voice, Automations, Knowledge, Intelligence, AI Apps, Notes, Tasks,
  Calendar, Files, Smart Home, Home Assistant, MQTT, Memory, Agents,
  Settings, Search — 18 seams) and reports each one's real `id`/`label`/
  `ready` — the exact same fields `AboutSection.tsx` (Step 19) already
  surfaces for a curated 9-seam subset, extended here to every seam.
  `getCoreHealth()` always returns `available: false` with the `M13B`
  milestone name and an explanation — never an invented CPU/memory/uptime
  number
- `adapters/coreDiagnosticsAdapter.ts` — intentionally unimplemented stub
  (`ready: false`), every method rejects with
  `CoreDiagnosticsContractUnavailableError`
- `performanceMetrics.ts` — `getPerformanceSnapshot()`, a plain function
  (not an adapter) reading `window.performance` directly: page load time,
  DOM-content-loaded time, time-to-first-byte, resource count, and
  Chromium's non-standard `performance.memory` (JS heap) where available.
  Every field the current browser/engine doesn't expose is reported as
  `undefined` — shown as "Not available" / "Not available in this
  browser" — never zero-fabricated
- `DiagnosticsPage.tsx` — `ModulePage` with a local-data disclosure
  banner, three stat cards (Components / Ready / Awaiting Core), a
  "System status" card (the 18-seam list, mirrors `AboutSection`'s
  Card+list+Badge pattern), an explicit "Core health" unavailable card
  naming M13B and linking to `docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md`,
  and a "Performance" card with a Refresh button that re-measures live
  browser metrics on demand
- Routing: `/diagnostics` wired in `App.tsx`; a new `secondary`/`live`
  entry added to `app/modules.tsx` with `redirectFrom: ['/performance']`.
  The pre-existing `/diagnostics` and `/performance` redirects were
  **removed from Settings'** `redirectFrom` (they previously pointed at
  `/settings`, a leftover from before either surface had its own real
  page) — mirrors how Step 17 removed the old `/agents → /chat` redirect
  once Agents got its own page
- **Universal Search / Command Palette integration**: no code change was
  needed — `mockSearchAdapter.ts`'s `searchApp()` and `AppLayout.tsx`'s
  command list both already read `liveSecondaryModules` unconditionally;
  registering Diagnostics as `secondary`/`live` was sufficient
- No Settings file was touched — Diagnostics is reachable only via ⌘K/
  Universal Search/direct navigation, not a new Settings tab, keeping this
  step's diff scoped to a net-new feature rather than re-opening Step 19
- `docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md` added — explicitly notes
  this is further behind than every other `CORE_*_CONTRACT_REQUIRED.md`
  doc in this checkpoint, since the underlying Core milestone itself
  hasn't started

**Known pre-existing item, intentionally not touched:** the Home dashboard
(`features/home/HomeSections.tsx`'s `SystemWidget`, `features/home/
adapters/mockHomeAdapter.ts`'s hardcoded `SystemVitals { cpu: 34, memory:
58, ... }`) predates this checkpoint's later "never fabricate Core data"
discipline and does show static illustrative CPU/memory numbers. Per
CLAUDE.md rule 9 ("Preserve working Home… unless the task explicitly
changes them") this was out of scope for Step 20 and was left as-is — but
Diagnostics' own Performance card deliberately does not reuse or reconcile
with those numbers; it sources everything itself, live, from the browser.

**Diagnostics data is entirely local to this browser tab and this
frontend's own code — nothing here contacts JARVIS Core.** Real Core-side
self-healing/observability data remains owned by JARVIS Core and is
pending M13B shipping and a verified Core contract (see
`docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md`).

---

## Step 21 — Developer Mode

**Status: COMPLETE — a presentation/control layer over capabilities that
already existed; one new real `SettingsService`-backed preference
(`developerModeEnabled`) with a genuine Command Palette effect; no Core
contract required for what was built**

Roadmap item 21 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 8, "System")
was explicitly marked "Placeholder / contract dependent." A repository
search before implementation found `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s
own row for Developer Mode reads "Cross-cutting | ⚠️ Verify | Expose real
diagnostics/events only" — the single sentence that scoped this entire
step: Developer Mode does not create a second orchestration/permission/
execution system, does not invent a Core or MCP endpoint, and does not
touch real hardware. It only exposes real, already-built local frontend
capabilities more prominently.

The search also turned up scaffolding that had existed, unused, since
Step 2: `app/modules.tsx` already declared an `Audience` type with a
`'developer'` value, a `surface: 'developer'` module (`/design`, the
Design System showcase page — `audience: 'developer'`, commented "hidden
by default"), a `developerModules` selector, and even a `commandModules
(devMode: boolean)` helper — but nothing anywhere in the app ever called
`commandModules` or read `developerModules`, and `AppLayout.tsx`'s Command
Palette "Go to" group was hard-coded to `[...topBarModules,
...liveSecondaryModules, ...settingsModules]`. `/design` was fully
reachable by direct URL, just never discoverable through any UI. This
step's job was to actually wire up that dormant scaffolding with a real
toggle, not invent a new one.

Architecture:

```text
Settings → Developer tab
  ↓
developerModeEnabled (SettingsService, additive to the Step 19 seam)
  ↓
AppLayout.tsx's commandGroups ("Go to") — conditionally includes
app/modules.tsx's developerModules (currently just /design)
```

Implemented:

- `settingsService.ts` — `AppSettings` gains `developerModeEnabled:
  boolean` (default `false`), documented the same way
  `notificationsEnabled` is. No adapter code changes were needed —
  `mockSettingsAdapter.ts`'s generic `{ ...DEFAULT_SETTINGS, ...patch }`
  merge already handles any new field additively, and
  `coreSettingsAdapter.ts`'s stub methods are field-agnostic
- `sections/DeveloperSection.tsx` (new) — the Settings → Developer tab.
  The toggle itself mirrors `NotificationsSection.tsx` exactly (spinner
  while loading/saving, success/error toast). When on, shows a "System
  registry" `SettingsSummaryCard` (component/ready counts) that reads the
  Step 20 `DiagnosticsService.getSystemStatus()` — real, already-computed
  data — and links to `/diagnostics`, and a "Design System" card
  confirming it's "Now in ⌘K" with a link to `/design`. When off, shows a
  short explanatory hint instead. An explicit disclosure line states the
  toggle "never changes what JARVIS Core does, never bypasses a permission
  check, and never talks to real hardware"
- `SettingsPage.tsx` — added an 11th "Developer" tab (trailing, after
  About)
- `AppLayout.tsx` — the Command Palette's "Go to" `items` array now
  conditionally spreads `developerModules` when
  `settings.developerModeEnabled` is true, and tags each developer item
  with a `hint: 'dev'` (mirroring how "Coming soon" items get `hint:
  'soon'`). `commandGroups`'s `useMemo` dependency array gained
  `settings.developerModeEnabled` so the list actually recomputes when the
  setting changes — verified live (see tests below), not just a toggle
  with no observable effect
- `app/modules.tsx` — comment-only update on the `/design` entry
  documenting that it is now genuinely gated by Developer Mode rather than
  permanently hidden
- **No Universal Search change.** Per this step's own scope note ("only
  modify Universal Search if Step 21 genuinely requires Developer Mode to
  be searchable"), and since `mockSearchAdapter.ts`'s `searchApp()`
  intentionally mirrors the Command Palette's "Go to" set
  (`topBarModules`/`liveSecondaryModules`/`settingsModules`, never
  `developerModules`), Universal Search was left untouched
- `docs/CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md` added — states plainly
  that no Core contract was required for what this step built (it's a
  local discoverability toggle over already-real frontend state), and
  documents what a *future*, deeper Core-connected Developer Mode (real
  event/log streaming, real feature-flag control, real Core health
  internals) would need — none of which was invented or assumed

**Developer Mode is entirely local to this browser tab.** Toggling it
never contacts JARVIS Core, never changes what any other feature does, and
never exposes a credential, secret, or raw hardware control. It only
changes what's discoverable in the Command Palette in this browser tab.

---

## Step 22 — Global Command Center

**Status: COMPLETE — an orchestration/discovery layer over the
pre-existing Command Palette; two new command groups compose already-real
capabilities; no new page, no second search index, no second execution
engine, no Core contract required**

Roadmap item 22 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 9, "Unified
JARVIS Experience") read only "Make Chat, Voice, Search, Productivity,
Smart Home and Integrations behave as one assistant experience" — the
first item in a new phase, with no prior frontend-Step precedent to mirror
the way earlier steps could mirror Steps 8/13/16/17/19. Before writing any
code, the existing Command Palette (`design-system/patterns/
CommandPalette/CommandPalette.tsx`, wired in `AppLayout.tsx`) and Universal
Search (`features/search/`, Step 9) were inspected together with every
candidate "control" surface (`SmartHomeService`, `AutomationService`,
`AgentService`). Two governing decisions came out of that inspection,
both driven by "reuse existing seams, never invent an execution path":

1. **No new page or route.** A dedicated `/command-center` page would have
   duplicated Home (which already surfaces Automations/Smart Home/Tasks
   widgets) and the Command Palette (already a working, correctly-centered
   — see the Step 17 "center Search/Command Palette" fix — global command
   surface) without adding real capability. The "unified command surface"
   the roadmap item asks for already exists as the Command Palette; this
   step's job was to make it more capable, not to build a second one.
2. **Only Smart Home scenes qualify as "Control" commands.** `AutomationService`
   has no execute/run-now method (only enable/disable/pause-resume, per
   Step 8's own scope) — adding a command would have meant inventing a
   capability. `AgentService` explicitly has no run/execute method by
   design (Step 17, "no second agent framework"). Smart Home's `Scene` /
   `triggerScene()` (Step 13) is different: a scene *is* a pre-curated,
   named, already-safe top-level action — exposing the 3 seeded scenes
   (Good Night, Movie Time, Away Mode) is not "blindly exposing every
   feature," it is exposing exactly the category of thing scenes exist
   for. Per-device commands were deliberately excluded — those stay on the
   Smart Home / Device Management pages, which have the context (current
   state, room, availability) a one-line palette command doesn't.

Architecture:

```text
AppLayout.tsx's Command Palette (⌘K)
  "Go to" (unchanged) → "Search" (new) → "Control" (new, conditional) → "Coming soon" (unchanged) → "Actions" (unchanged)
                              ↓                        ↓
                    opens UniversalSearch        SmartHomeService.triggerScene()
                    (existing overlay/seam)       (existing seam, same as SmartHomePage.tsx)
```

Implemented:

- `app/commandCenter.ts` (new) — two pure, independently-testable builder
  functions consumed by `AppLayout.tsx`:
  - `buildSearchGroup(onOpenSearch)` — always returns one "Search" group
    with a single "Search everything…" (`⌘⇧K` hint) item that calls the
    callback AppLayout already uses to open `UniversalSearch` (`setSearchOpen(true)`).
    No new search index, no duplicated category adapter — this is a
    pointer to the existing Step 9 surface, nothing more.
  - `buildSceneControlGroup(scenes, onTrigger)` — returns `null` when
    `scenes` is empty (e.g. a Core Smart Home adapter selected and not yet
    returning data) rather than an empty/broken-looking "Control" heading;
    otherwise one command per scene, each item's `icon` reusing
    `smartHomeFormat.ts`'s existing `sceneIcon()` helper (no new icon
    mapping), `hint: 'scene'`, and an `onSelect` that calls the shared
    `onTrigger` callback with that scene
- `app/AppLayout.tsx` — fetches scenes once at the app root via the
  existing `SmartHomeService` seam (`useAsync`, mirrors how
  `SettingsProvider` fetches settings once, not per-route);
  `handleTriggerScene` calls `smartHomeService.triggerScene(scene.id)` and
  shows the *exact same* success/error toast copy
  `SmartHomePage.tsx`'s own `handleTriggerScene` uses — never a parallel
  or divergent execution path, and never a toast implying a real device
  changed when only the local mock did. `commandGroups`'s `useMemo` now
  also inserts `buildSearchGroup(...)` (always) and the `Control` group
  (only when non-null) between the pre-existing "Go to" and "Coming soon"
  groups — every pre-existing group, its heading, and its items are
  otherwise byte-for-byte unchanged
- **No Universal Search changes** — the palette *opens* it, it does not
  reimplement any part of it
- **No Universal Search/Automations/Agents command was added** — see the
  scoping decisions above
- No new Core contract document was needed: this step recombines the
  already-documented `docs/CORE_SEARCH_CONTRACT_REQUIRED.md` and
  `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md` seams rather than
  introducing a new one

**Command Center actions are exactly as real (or as mock) as the seam they
route through.** Selecting "Search everything…" opens the real, working
Universal Search. Selecting a scene calls the real (local, in-memory mock)
`SmartHomeService.triggerScene()` — the same call `/smart-home`'s own UI
makes — so its effect is visible if the user later visits that page. If
`VITE_SMART_HOME_BACKEND=core` is ever set before a real Core Smart Home
contract exists, `getScenes()` rejects and the "Control" group is silently
omitted — never a fake or broken-looking group.

---

## Step 23 — JARVIS Visual Identity

**Status: COMPLETE — a visual-system consistency pass, not a feature
milestone. One genuine incompleteness found and fixed (the ambient waves
never reacted to the orb's state); every other audited area (logo
clear-space, glow discipline, popup centering/geometry, typography,
spacing) was already consistent and needed no code change**

Roadmap item 23 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 10, "Visual
Experience") read "Add final startup/interaction polish without rebuilding
the design system." Per this step's own instructions, the frontend was
audited *before* any code was touched, against ten explicit,
previously-stated acceptance requirements (logo clear-space, no glowing
separator lines, keep logo/text/orb glow, avoid excessive glow, popup
geometry, popup centering, avoid visual congestion) plus the general
typography/spacing/color/interaction/animation language sections. A live
user report during this session ("the waves are also incomplete — I want
animated waves that react with the orb") pointed directly at a real,
confirmed defect; the rest of the audit is documented below as
**verification**, not as a list of fixes.

**Audit findings (verification only — no code changed for these):**

- **Logo clear-space**: the JARVIS brand mark exists in exactly one place
  app-wide — `AppLayout.tsx`'s top-bar `leading` slot — inside 16px
  container padding with its own internal gap. No instance of the logo
  touching a line, border, card edge, or viewport edge was found.
- **Glowing decorative lines**: an exhaustive search (every `shadow-glow*`
  usage, every gradient `via-`/`from-transparent` pattern, every CSS file)
  found zero instances of a glowing separator/edge line anywhere in the
  current codebase. `shadow-glow-sm` is used in exactly three deliberate
  places — the logo mark, the `ai`-variant Toast, and the `ai`-variant
  Button's hover state — never on a divider, border, or full-width line.
- **Popup/modal centering + geometry**: `Modal`, `CommandPalette`, and
  `SearchOverlay` are all already centered
  (`left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`) with consistent
  rounded-2xl geometry, `p-6`/consistent internal spacing, and
  title/description typography — the Step 17 "center Search overlay and
  Command Palette instead of top-anchoring" fix already covers this.
  Drawers remain drawers (`Drawer.tsx`, side-anchored, never converted to
  a centered modal).
- **Typography**: every audited page already uses the design system's
  token scale (`text-h1`…`text-caption`/`text-overline`) consistently.
  Exactly three arbitrary `text-[...]` values exist app-wide, all
  deliberate and justified: relative `0.85em` sizing for inline Markdown
  code spans, one `18px` glyph in the QuickSettings trigger, and two
  `10px` compact mobile tab labels below the smallest named token. No
  systemic inconsistency found.
- **Spacing/color/interaction states**: consistently sourced from the
  shared `design-system` primitives/tokens across every page audited
  (Home, Chat, Voice, Automations, Smart Home, Device Management, Home
  Assistant/MQTT, Memory, Agents, Knowledge, Intelligence, Calendar,
  Files, Settings, Diagnostics, Developer Mode, Global Command Center,
  Universal Search) — no parallel spacing/color system found.

**The real fix — Orb + Waveform reactivity:**

- `Waveform` (`features/home/Waveform.tsx`) took only a boolean `active`
  and always animated with a fixed cyan color and fully random per-bar
  jitter — completely disconnected from which `VoiceState` the orb next to
  it was actually in. Whether JARVIS was idle, listening, thinking, or
  speaking, the waves looked and moved identically. Separately,
  `VoiceOverlay.tsx` — the *real* voice interaction surface — showed the
  orb completely alone, with no waves at all, an inconsistency with the
  Home hero's decorative treatment of the same orb.
- **Relocated** `Waveform` from `features/home/` into
  `design-system/patterns/Waveform/Waveform.tsx`, alongside `VoiceOrb`
  (its natural pairing), and exported it from the design-system barrel —
  it's now a shared cross-feature primitive, not a Home-only one. No other
  file referenced the old path (confirmed before moving).
- **Exported `VoiceOrb`'s existing `stateColor` map** (was a private local
  const) as the single source of truth for "what color is JARVIS's
  presence in this state" — `Waveform` reuses it exactly rather than
  maintaining a second, potentially-drifting palette.
- **Rewrote `Waveform`** to accept the real `state: VoiceState` instead of
  a collapsed boolean: bars now render in `stateColor[state]` (matching
  the orb exactly) with per-state amplitude/speed (`idle`: slow, subtle;
  `listening`: brighter, quicker; `thinking`: measured, purple;
  `speaking`: fastest, most energetic; `offline`: static, dimmed) — real
  reactive character, not a single generic ambient loop. Offline bars are
  also visibly dimmer (`opacity: 0.2`).
- **`HeroOrb.tsx`** (Home page) now passes the real `state` straight
  through instead of collapsing it to a boolean first. Its status-dot
  indicator was also switched from a hardcoded aura-cyan/disabled-gray
  choice to `stateColor[state]`, so the dot, the orb, and the waves all
  agree on color for every state — not just idle/offline.
- **`VoiceOverlay.tsx`** now flanks the real orb with the same reactive
  `Waveform`, reusing its already-computed live `state` — no new state or
  logic, purely visual — closing the cross-surface gap between Home's
  decorative hero and the actual voice interaction surface. Hidden below
  `md` viewports, matching Home's existing anti-congestion responsive
  choice.
- **No functional behavior changed.** Voice recognition, transcript
  handling, send-to-Jarvis, and every existing testid are untouched; the
  waves are `aria-hidden` and purely decorative, exactly as before.

**Follow-up fix (same PR, before merge):** a live screenshot after the
above landed showed the two wave clusters still visually huddled at one
end of their flex-1 container instead of spanning it — a plain-CSS layout
bug, not a reactivity bug: the container never set `justifyContent`, so
the (correctly colored/animated) fixed set of bars defaulted to
`flex-start` and left a dead gap between the wave cluster and the outer
edge of the card. Fixed by giving the `Waveform` root `width: '100%'` and
`justifyContent: 'space-between'`, so the same bars now spread across the
*entire* container edge-to-edge — from the card's inner edge continuously
up to the orb, with only the deliberate 16px `gap-4` flex spacing (the
same gap used everywhere else in that row) remaining, never a large dead
zone. Verified via exact pixel measurements in the live browser (both
wave containers' first/last bar boundaries matched their container's
edges almost exactly). The now-redundant `justify-end` Tailwind class was
removed from both call sites (`HeroOrb.tsx`, `VoiceOverlay.tsx`), since
the component itself now owns full-width distribution. One new test
(`Waveform.test.tsx`, "spans the full container width edge-to-edge…")
asserts this directly.

**Deliberately not done:** no new Admin interface (explicitly out of
scope for this step — only the visual-language foundation that a future
Admin surface could reuse, which is already satisfied by everything above
being centralized in `design-system/`, not duplicated per-surface); no
rewrite of any existing page; no new design tokens/spacing scale; no
change to Modal/CommandPalette/SearchOverlay/Drawer (already correct); no
change to any feature's mock data or service seam.

---

## Step 24 — Responsive + Accessibility

**Status: COMPLETE — a hardening pass, not new product functionality. An
audit-first pass across desktop/tablet/mobile viewports, keyboard/focus,
semantics, touch targets, and reduced motion found the large majority of
the app already solid; three genuine, confirmed gaps were fixed.**

Roadmap item 24 (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 10) read
"Complete desktop/tablet/mobile, keyboard, focus, semantics and
reduced-motion coverage." Per this step's own instructions and the
audit-first discipline established in Step 23, the frontend was audited
*before* any code was touched.

**Audit method:**

- An automated live-browser overflow scan across all 17 live routes at
  all 7 required viewports (1440×900, 1280×800, 1024×768, 834×1194,
  768×1024, 390×844, 375×812), driven via `history.pushState`/`popstate`
  client-side navigation rather than 119 individual full page loads.
- Live interaction testing of Modal (a representative `size="lg"` form),
  a representative Drawer, CommandPalette, and SearchOverlay.
- Direct measurement of touch-target sizes (`getBoundingClientRect()`) for
  the mobile tab bar, topbar icon buttons, the floating Voice orb button,
  and the `Switch` toggle.
- Code-level review of keyboard-interactive patterns (`role="button"` +
  `tabIndex` + `onKeyDown` usage), non-semantic clickable elements, and
  every Framer Motion (`from 'framer-motion'`) consumer's reduced-motion
  handling.

**Audit findings — already solid, verification only (no code changed for
these):**

- **Horizontal overflow**: zero found, anywhere, at any of the 7 required
  viewports, across all 17 routes.
- **Drawer / CommandPalette / SearchOverlay**: all already height-bound
  with internal scroll (`max-h-[min(60vh,420px)]` / `max-h-[min(60vh,480px)]`
  with `overflow-y-auto`, or the Drawer's own per-page scrollable body) —
  the Step 9/17 work here holds up.
- **Keyboard-interactive cards**: every clickable card/row across the app
  (`AutomationCard`, `RoomCard`, `AgentCard`, `TaskRow`, and 11 others)
  already uses a real `role="button"` + `tabIndex={0}` + an `onKeyDown`
  handling both `Enter` and `Space` with `preventDefault()` — spot-checked
  `AutomationCard.tsx`, consistent codebase-wide. No non-semantic
  `<div onClick>` was found anywhere in `src/features` or
  `src/design-system`.
- **Reduced motion**: a global `@media (prefers-reduced-motion: reduce)`
  rule already exists in `index.css` and forces every CSS-driven
  animation/transition to near-zero duration app-wide — this already
  covers Modal/Drawer/CommandPalette/SearchOverlay open-close, the
  shimmer/press micro-interactions, with zero extra code. Of the 6 Framer
  Motion consumers (JS-driven, outside that CSS rule's reach), 4 already
  called `useReducedMotion()` (`VoiceOrb`, `Waveform`, `ActivityTimeline`,
  `ChatPage`); `Dock` is unused/unmounted dead code (not reachable by any
  live route, left untouched); `Toast` was the one live gap (see fixes,
  below). No page-transition animation exists anywhere to gate.
- **Dense data / tables**: the `Table` design-system primitive already
  self-wraps in `overflow-x-auto` (currently unused by any live feature,
  but correctly future-proofed already).
- **Touch targets**: the mobile bottom tab bar (92×46px) and the floating
  Voice orb button (56×56px) already comfortably exceed 44×44px.

**Three genuine gaps found and fixed:**

1. **Modal viewport-height overflow — confirmed live, blocking.**
   `ModalContent` had no `max-height` or scroll. Live-tested at 375×812:
   the Automations create-form modal (`size="lg"`) rendered 970px tall;
   its Cancel/Create buttons sat at y≈1367 — entirely below the 812px
   viewport, with no scroll mechanism anywhere to reach them. This affects
   every `size="lg"` form app-wide: Automations, Calendar, Tasks, Notes,
   Device pairing. Fixed with `max-h-[85vh] overflow-y-auto` added to the
   shared `ModalContent` primitive (`design-system/primitives/Modal/Modal.tsx`)
   — one change, every current and future Modal consumer covered. Verified
   live that the submit button becomes reachable via the modal's own
   internal scroll (see the environment note below on why this required
   forcing the entrance animation to complete for verification).
2. **`Toast` ignored `prefers-reduced-motion`.** Extracted
   `toastMotionProps(reduced)` in `design-system/composites/Toast/Toast.tsx`
   — instant, offset-free (`opacity` only, `duration: 0`) when reduced;
   unchanged spring enter/exit otherwise — mirroring exactly how `Waveform`
   already branches on the same hook. Toast fires on nearly every user
   action app-wide (Automations, Smart Home scenes, Notes/Tasks/Calendar
   CRUD, Quick Settings, ...), so this was the highest-traffic remaining
   gap.
3. **No skip-to-main-content link.** Keyboard users had to tab through
   every topbar control (search, voice, notifications, appearance,
   settings, avatar — up to 6 stops) before reaching page content on
   every single route. Added a standard, visually-hidden-until-focused
   skip link (`sr-only focus:not-sr-only`, WCAG 2.4.1) in `AppShell`, the
   single shared shell every route renders through, plus
   `id="main-content"`/`tabIndex={-1}` on `<main>` so activating the link
   moves real keyboard focus, not just scroll position.

**Reviewed and deliberately left unchanged:** icon-button (36px), `Switch`
(38×22px), and the Modal/Drawer close button (32px) touch targets all
fall short of the 44×44px *ideal* but comfortably exceed the WCAG 2.5.8 AA
minimum (24×24px). Measured live: the topbar's trailing icon row has zero
pixel headroom at 375px width (right edge at 359px of 375px) to grow any
of them without reintroducing horizontal overflow — the same class of
visual regression Step 23 had just fixed. Documented here as an audited,
intentional trade-off rather than left silent.

**Environment limitation, honestly noted:** this session's Browser pane
again reported `document.visibilityState: "hidden"` / `document.hasFocus():
false` throughout (the same limitation noted in Steps 20/23's own QA).
This (a) paused the Modal's CSS entrance animation mid-keyframe, stalling
its centering `transform` at the animation's `from` state until manually
forced complete for live verification, and (b) meant the skip link's
`:focus` CSS genuinely could not be triggered live — `.focus()` correctly
moves `document.activeElement`, but `:focus` does not match unless the
document itself is OS-focused. The skip link is confirmed correct by
construction (the standard, widely-used Tailwind `sr-only`/
`focus:not-sr-only` pattern; its generated CSS rule was confirmed present
in the loaded stylesheet) and by `AppShell.test.tsx`'s structural
assertions, not by a live visual check.

**Deliberately not done:** no redesign of any page, no new design
tokens/spacing scale, no second navigation system, no change to
Drawer/CommandPalette/SearchOverlay (already correct), no change to any
feature's mock data or service seam, no full accessibility audit tooling
(axe/Lighthouse) integrated — this was a targeted, evidence-based pass
against the brief's explicit checklist, not a general audit sweep.

---

## 4. Current Architecture Pattern

The frontend is intentionally structured so UI does not need to be redesigned when JARVIS Core becomes available.

```text
                 FRONTEND
                    │
                 Feature UI
                    │
               Service Layer
                    │
          ┌─────────┴─────────┐
          │                   │
   Local/Mock/Dev         Core Adapter
       Adapter                 │
          │                    ▼
          │               JARVIS Core
          │
          ▼
     Development UI
```

### Adapter rule

A mock/local/development adapter may be used when the real Core contract is unavailable, but it must remain clearly identified as development/mock behavior.

When Core is ready, replace the adapter rather than redesigning the feature UI.

---

## 5. Current Frontend Source Areas

Important implemented areas in this checkpoint include:

### Design system

- primitives
- patterns
- composites
- layouts
- theme/tokens
- motion
- `StateView`
- `ModulePage`
- `Widget` / `WidgetGrid`
- `useAsync`
- `patterns/VoiceOrb/VoiceOrb.tsx` — exports `stateColor` (Step 23) as the single source of truth for per-`VoiceState` color
- `patterns/Waveform/Waveform.tsx` (Step 23) — relocated here from `features/home/`; reacts to the real `VoiceState` (color via `stateColor`, plus per-state amplitude/speed) instead of a boolean

### Home

- `features/home/HomeSections.tsx`
- `features/home/HeroOrb.tsx` (Step 23: passes real `VoiceState` to `Waveform`/the status dot instead of a collapsed boolean)
- `features/home/ActivityTimeline.tsx`
- `features/home/homeService.ts`
- `features/home/adapters/mockHomeAdapter.ts`
- future Core adapter seam

### Chat

- `features/chat/ChatPage.tsx`
- `features/chat/chatStore.ts`
- `features/chat/chatService.ts`
- `features/chat/adapters/`
- `features/chat/Markdown.tsx`

### Voice

- `features/voice/VoiceOverlay.tsx` (Step 23: now flanks the orb with the shared reactive `Waveform`, reusing its own already-computed live `state`)
- `features/voice/useVoiceSession.ts`
- `features/voice/voiceService.ts`
- `features/voice/voiceHistory.ts`
- `features/voice/adapters/`

### Automations

- `features/automations/AutomationsPage.tsx`
- `features/automations/automationService.ts`
- `features/automations/adapters/mockAutomationAdapter.ts`
- `features/automations/adapters/coreAutomationAdapter.ts`
- `features/automations/AutomationCard.tsx`, `AutomationDetailDrawer.tsx`, `AutomationForm.tsx`, `AutomationStatusBadge.tsx`, `ExecutionHistoryList.tsx`, `automationFormat.ts`
- `features/automations/__tests__/`

### Universal Search

- `features/search/UniversalSearch.tsx`
- `features/search/searchService.ts`
- `features/search/searchHistory.ts`
- `features/search/adapters/mockSearchAdapter.ts` (now also searches Knowledge — Step 10 — and AI Apps — Step 11)
- `features/search/adapters/coreSearchAdapter.ts`
- `features/search/__tests__/`
- `design-system/patterns/SearchOverlay/SearchOverlay.tsx` (pre-existing shell; now wired, plus a small additive `inputProps` passthrough)

### Knowledge

- `features/knowledge/KnowledgePage.tsx`
- `features/knowledge/knowledgeService.ts`
- `features/knowledge/adapters/mockKnowledgeAdapter.ts`
- `features/knowledge/adapters/coreKnowledgeAdapter.ts`
- `features/knowledge/KnowledgeItemRow.tsx`, `KnowledgeDetailDrawer.tsx`, `KnowledgeSourceBadge.tsx`, `knowledgeFormat.ts`
- `features/knowledge/__tests__/`

### Intelligence

- `features/intelligence/IntelligencePage.tsx`
- `features/intelligence/intelligenceService.ts`
- `features/intelligence/adapters/mockIntelligenceAdapter.ts`
- `features/intelligence/adapters/coreIntelligenceAdapter.ts`
- `features/intelligence/InsightCard.tsx`, `intelligenceFormat.ts`
- `features/intelligence/__tests__/`

### AI Apps

- `features/aiApps/AiAppsPage.tsx`
- `features/aiApps/aiAppsService.ts`
- `features/aiApps/adapters/mockAiAppsAdapter.ts`
- `features/aiApps/adapters/coreAiAppsAdapter.ts`
- `features/aiApps/AiAppCard.tsx`, `AiAppDetailDrawer.tsx`, `AiAppCategoryBadge.tsx`, `AiAppStatusBadge.tsx`, `aiAppsFormat.ts`
- `features/aiApps/__tests__/`

### Notes

- `features/notes/NotesPage.tsx`
- `features/notes/notesService.ts`
- `features/notes/adapters/mockNotesAdapter.ts`
- `features/notes/adapters/coreNotesAdapter.ts`
- `features/notes/NoteRow.tsx`, `NoteDetailDrawer.tsx`, `NoteForm.tsx`, `notesFormat.ts`
- `features/notes/__tests__/`

### Tasks

- `features/tasks/TasksPage.tsx`
- `features/tasks/tasksService.ts`
- `features/tasks/adapters/mockTasksAdapter.ts`
- `features/tasks/adapters/coreTasksAdapter.ts`
- `features/tasks/TaskRow.tsx`, `TaskDetailDrawer.tsx`, `TaskForm.tsx`, `TaskStatusBadge.tsx`, `TaskPriorityBadge.tsx`, `tasksFormat.ts`
- `features/tasks/__tests__/`

### Calendar

- `features/calendar/CalendarPage.tsx`
- `features/calendar/calendarService.ts`
- `features/calendar/adapters/mockCalendarAdapter.ts`
- `features/calendar/adapters/coreCalendarAdapter.ts`
- `features/calendar/CalendarEventRow.tsx`, `CalendarEventDetailDrawer.tsx`, `CalendarEventForm.tsx`, `calendarFormat.ts`
- `features/calendar/__tests__/`

### Files

- `features/files/FilesPage.tsx`
- `features/files/filesService.ts`
- `features/files/adapters/mockFilesAdapter.ts`
- `features/files/adapters/coreFilesAdapter.ts`
- `features/files/FileEntryRow.tsx`, `FileDetailDrawer.tsx`, `NewFolderForm.tsx`, `AddFileForm.tsx`, `filesFormat.ts`
- `features/files/__tests__/`
- `design-system/composites/Breadcrumb/Breadcrumb.tsx` (pre-existing, previously unused; small additive keyboard-accessibility fix in this step)

### Smart Home (Command Center + Device Management + Integrations)

- `features/smartHome/SmartHomePage.tsx` (Step 13 Command Center; Step 14 added the "Manage devices" header action, Step 15 added the "Integrations" header action)
- `features/smartHome/DeviceManagementPage.tsx`, `DeviceManagementRow.tsx`, `DeviceManagementDrawer.tsx`, `DeviceHealthSummary.tsx`, `PairDeviceForm.tsx` (Step 14)
- `features/smartHome/IntegrationsPage.tsx`, `ConnectorCard.tsx`, `ConnectorDetailDrawer.tsx` (Step 15)
- `features/smartHome/smartHomeService.ts`, `smartHomeFormat.ts`
- `features/smartHome/smartHomeIntegrationService.ts`, `smartHomeIntegrationFormat.ts` (Step 15)
- `features/smartHome/adapters/mockSmartHomeAdapter.ts`, `adapters/coreSmartHomeAdapter.ts`
- `features/smartHome/adapters/mockHomeAssistantAdapter.ts`, `adapters/mockMqttAdapter.ts`, `adapters/coreHomeAssistantAdapter.ts`, `adapters/coreMqttAdapter.ts` (Step 15)
- `features/smartHome/RoomCard.tsx`, `DeviceTile.tsx` (Step 14 added its "Manage" deep-link button), `SceneCard.tsx`, `DeviceAvailabilityBadge.tsx`, `RoomStatusBadge.tsx`
- `features/smartHome/__tests__/`

### Memory

- `features/memory/MemoryPage.tsx`, `MemoryRow.tsx`, `MemoryDetailDrawer.tsx` (Step 16)
- `features/memory/memoryService.ts`, `memoryFormat.ts` (Step 16)
- `features/memory/adapters/mockMemoryAdapter.ts`, `adapters/coreMemoryAdapter.ts` (Step 16)
- `features/memory/__tests__/`

### Agents

- `features/agents/AgentsPage.tsx`, `AgentCard.tsx`, `AgentDetailDrawer.tsx`, `AgentRunHistoryList.tsx` (Step 17)
- `features/agents/agentService.ts`, `agentFormat.ts` (Step 17)
- `features/agents/adapters/mockAgentAdapter.ts`, `adapters/coreAgentAdapter.ts` (Step 17)
- `features/agents/__tests__/`

### Settings

- `features/settings/SettingsPage.tsx` (Step 19) — `ModulePage` + 10-tab `Tabs`
- `features/settings/SettingsProvider.tsx` (Step 19) — non-throwing context wrapping `SettingsService`, mounted in `main.tsx`
- `features/settings/settingsService.ts` (Step 19)
- `features/settings/adapters/mockSettingsAdapter.ts`, `adapters/coreSettingsAdapter.ts` (Step 19)
- `features/settings/sections/` (Step 19) — `AppearanceSection.tsx` (reads `useTheme()` directly), `VoiceSection.tsx`, `NotificationsSection.tsx`, `PrivacySection.tsx`, `SmartHomeSection.tsx`, `AiAppsSection.tsx`, `MemorySection.tsx`, `AgentsSection.tsx`, `AutomationsSection.tsx`, `AboutSection.tsx`, `SettingsSummaryCard.tsx` (shared)
- `features/settings/sections/DeveloperSection.tsx` (Step 21) — reads `developerModeEnabled` via `useSettings()` and the Step 20 `DiagnosticsService` seam
- `features/settings/__tests__/`

### Diagnostics

- `features/diagnostics/DiagnosticsPage.tsx` (Step 20)
- `features/diagnostics/diagnosticsService.ts`, `performanceMetrics.ts` (Step 20)
- `features/diagnostics/adapters/mockDiagnosticsAdapter.ts`, `adapters/coreDiagnosticsAdapter.ts` (Step 20)
- `features/diagnostics/__tests__/`

### Navigation

- `app/modules.tsx` (`liveSecondaryModules` / `comingSoonModules` selectors added in Step 10; `developerModules` wired up for the first time in Step 21 — it existed, unused, since Step 2)
- `app/AppLayout.tsx` (Step 21: Command Palette "Go to" group gated on `settings.developerModeEnabled`; Step 22: also composes the new "Search"/"Control" groups)
- `app/commandCenter.ts` (Step 22) — pure `buildSearchGroup`/`buildSceneControlGroup` command-group builders
- `design-system/patterns/TopNav/`

---

## 6. Testing / Quality State

The latest reported frontend gates for the completed Steps 1–24 were green:

- TypeScript/typecheck: **PASS** (`tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`)
- Vitest: **557/557 PASS** across 75 files, deterministic (`npx vitest run --no-file-parallelism`, run alone —
  not concurrently with the build, to avoid the resource-contention false-failures observed in earlier steps;
  one run mid-step reported one timeout on `IntegrationsPage`'s Home Assistant test (unrelated to any file
  touched this step) under sustained full-suite load, which passed in 3.06s — well under its 5s timeout — in
  isolation; the same resource-contention pattern documented in earlier steps, not a regression, and the full
  suite passed cleanly 557/557 on retry)
  — all 550 Step 0–23 tests still pass, plus 7 net new for Step 24 — Responsive + Accessibility:
  - Responsive + Accessibility (7 across 3 new files): `design-system/__tests__/Modal.test.tsx` (new, 1 —
    `ModalContent` carries both `max-h-[85vh]` and `overflow-y-auto` so a form taller than the viewport
    scrolls internally instead of pushing its footer actions off-screen), `design-system/__tests__/Toast.test.tsx`
    (new, 4 — the extracted `toastMotionProps(reduced)` helper drops the spring/positional offsets to an
    instant, opacity-only transition when motion is reduced and keeps the spring entrance/exit otherwise; a
    toast renders and dismisses on click; a `danger`-variant toast announces via `role="alert"`, others via
    `role="status"`), `design-system/__tests__/AppShell.test.tsx` (new, 2 — the new skip link targets a
    `<main id="main-content" tabIndex={-1}>` landmark and carries the `sr-only`/`focus:not-sr-only` classes
    that keep it invisible until keyboard-focused)
  - Audit method: a live-browser pass (automated overflow scan across all 17 live routes at all 7 required
    viewports — 1440×900, 1280×800, 1024×768, 834×1194, 768×1024, 390×844, 375×812 — via
    `history.pushState`/`popstate` client-side navigation, far faster than 119 individual full navigations)
    found **zero horizontal overflow anywhere**, before or after this step's fixes. Confirmed already-solid,
    no code change needed: `Drawer`/`CommandPalette`/`SearchOverlay` are already height-bound with internal
    scroll (Step 9/17 work holds up); every interactive card already uses real `role="button"` +
    `tabIndex={0}` + Enter/Space `onKeyDown` (spot-checked `AutomationCard.tsx`, consistent codebase-wide, no
    non-semantic clickable `div`s found anywhere); a global `@media (prefers-reduced-motion: reduce)` rule in
    `index.css` already forces every CSS-driven animation/transition to near-zero duration app-wide (Modal/
    Drawer/CommandPalette/SearchOverlay open-close, shimmer, press); `Table` already self-wraps in
    `overflow-x-auto` (unused today, but future-proofed correctly).
  - Three genuine gaps found and fixed:
    1. **Modal viewport overflow (confirmed live, blocking)** — `ModalContent` had no max-height or scroll.
       At 375×812 the Automations create-form modal (`size="lg"`) rendered 970px tall with its Cancel/Create
       buttons at y≈1367 — entirely off-screen, no way to reach them. This affects every `size="lg"` form:
       Automations, Calendar, Tasks, Notes, Device pairing. Fixed with `max-h-[85vh] overflow-y-auto` added
       to the shared `ModalContent` primitive — one change, every current and future Modal consumer covered.
       Verified live: the submit button becomes reachable via the modal's own internal scroll once its
       entrance animation completes (see the QA note below on why that required forcing the animation).
    2. **Toast ignored `prefers-reduced-motion`** — every other Framer Motion consumer in the design system
       (`VoiceOrb`, `Waveform`, `ActivityTimeline`, `ChatPage`) already checks `useReducedMotion()`; `Toast`
       (fires on nearly every user action app-wide) didn't. Fixed by extracting `toastMotionProps(reduced)`
       and gating the spring enter/exit the same way the others already do.
    3. **No skip-to-main-content link** — keyboard users had to tab through every topbar control (search,
       voice, notifications, appearance, settings, avatar) before reaching page content on every route. Added
       a standard visually-hidden-until-focused skip link (`sr-only focus:not-sr-only`) in `AppShell`, plus
       `id="main-content"`/`tabIndex={-1}` on `<main>` so activating it moves real keyboard focus, not just
       scroll position.
  - Reviewed and deliberately left unchanged: icon-button (36px), Switch (38×22px), and Modal-close-button
    (32px) touch targets all fall short of the 44×44px *ideal* but comfortably exceed the WCAG 2.5.8 AA
    minimum (24×24px); the topbar's trailing icon row measured with zero pixel headroom at 375px width
    (right edge at 359 of 375) to grow any of them without reintroducing overflow — the same visual-regression
    risk Step 23 had just fixed. Documented here as an audited, intentional trade-off rather than left silent.
  - Browser QA (live dev server): the automated overflow scan (above) covered all 7 required viewports across
    17 routes. Console checked for new errors — none found beyond pre-existing, environment-level Vite HMR
    WebSocket noise and one pre-existing `Function components cannot be given refs` warning on `Modal.tsx`'s
    `Overlay` (present before this step; `Overlay` itself was not modified). **Environment limitation, honestly
    noted**: this session's Browser pane again reported `document.visibilityState: "hidden"` /
    `document.hasFocus(): false` throughout (the same limitation noted in Step 20/23's own QA), which (a)
    paused the Modal's CSS entrance animation mid-keyframe, stalling its centering `transform` at the
    animation's `from` state until manually forced complete for verification, and (b) meant the skip link's
    `:focus` CSS genuinely could not be triggered live (`.focus()` correctly moves `document.activeElement`
    but does not make `:focus` match when the document itself isn't OS-focused) — confirmed real in a normal,
    foregrounded browser tab by construction (standard, widely-used Tailwind `sr-only`/`focus:not-sr-only`
    pattern; the generated CSS rule was confirmed present in the loaded stylesheet) and by the `AppShell.test.tsx`
    structural tests, not by a live visual check.
  - Was 550/550 across 72 files for the completed Steps 1–23:
  - JARVIS Visual Identity (14 across 2 new files): `design-system/__tests__/Waveform.test.tsx` (new, 12 —
    renders the requested bar count, every one of the 6 `VoiceState`s colors every bar with the exact same
    `stateColor` `VoiceOrb` itself uses, `offline` visibly dims bar opacity while every other state does not,
    `mirror` reverses layout via `flexDirection`, the whole waveform is `aria-hidden` (purely decorative), it
    defaults to `idle` when no state is given, and — added for the follow-up layout fix below — the
    container spans its full width edge-to-edge via `width: 100%`/`justifyContent: space-between`),
    `features/voice/__tests__/VoiceOverlay.test.tsx` (new, 2 — first-ever coverage for this previously-
    untested surface: the dialog renders its two new flanking wave containers with real bars when open, and
    renders nothing when closed)
  - **Follow-up layout fix, same PR**: a live screenshot after the reactivity fix landed showed the wave
    bars still huddled at one end of their container (a plain `justify-content` default-`flex-start` bug,
    not a reactivity bug — the container never set `justifyContent`). Fixed with `width: '100%'` +
    `justifyContent: 'space-between'` on the `Waveform` root, spreading the same bars across the *entire*
    container; verified via exact pixel measurements live (both wave containers' first/last bar boundaries
    matched their container edges almost exactly, with only the deliberate 16px `gap-4` flex spacing before
    the orb remaining — never a dead zone)
  - Lint: one pre-existing `react-refresh/only-export-components` warning surfaced on `VoiceOrb.tsx` after
    exporting `stateColor` alongside the `VoiceOrb` component — resolved with the same inline
    `eslint-disable-next-line` convention already used elsewhere in this codebase for an identical situation
    (e.g. `Button.tsx`'s exported `buttonVariants`), rather than splitting `stateColor` into its own file
  - A genuine architectural decision was made before writing any code, not a bug found after the fact:
    `Waveform` was relocated from `features/home/` into `design-system/patterns/Waveform/`, alongside
    `VoiceOrb` (its natural pairing) — it's a shared, cross-feature presentational primitive (used by both
    Home and Voice), not a Home-only one. No other file referenced the old path (confirmed via search before
    moving); zero pre-existing tests referenced `HeroOrb`, `Waveform`, or `VoiceOverlay` by name, so this
    step also represents this codebase's first-ever coverage of `VoiceOverlay`'s rendered output.
  - Browser QA (manual, live dev server): confirmed end-to-end — Home's hero orb, its status dot, and both
    flanking `Waveform` containers (28 bars each) all render `var(--ai-aura)` (the idle color) in agreement;
    the same confirmed on the real `/voice` overlay after this step added the waves there (28 bars each,
    same idle color, no console errors — mic access is blocked in this sandboxed browser, so the session
    honestly stays in its unsupported/`idle`-adjacent state rather than reaching `listening`). `/diagnostics`
    and `/settings` (all 11 tabs, including Developer) were re-verified to still render correctly and
    unchanged (regression), with no console errors beyond pre-existing, environment-level Vite HMR WebSocket
    noise. **Not performed this session**: interactively cycling the orb through listening/thinking/speaking/
    processing/offline in the live browser, and re-opening the Command Palette live, because this session's
    Browser pane reported `document.visibilityState: "hidden"` throughout (the same "browser pane was not
    compositing frames" limitation noted in Step 20's own QA) — click/keyboard dispatch to that hidden tab
    was unreliable even after repeated retries and a forced navigation. The per-state color/motion logic this
    would have visually spot-checked is instead directly and exhaustively covered by the 11 new
    `Waveform.test.tsx` cases (one per `VoiceState`, asserting the exact rendered color), and Command
    Palette/Global Command Center behavior is unchanged code already covered by Step 22's own passing tests.
  - Was 536/536 across 70 files for the completed Steps 1–22:
  - Global Command Center (13 across 2 new files): `commandCenter.test.ts` (new, 5 — `buildSearchGroup` always
    returns one "Search" item that calls the given `onOpenSearch` callback exactly once, `buildSceneControlGroup`
    returns `null` for an empty scene list rather than an empty/broken-looking group, returns one command per
    scene each wired to the shared `onTrigger` callback with the exact scene object, never exposes a per-device
    command, and an explicit registrations test asserting the full set of ids assembled from real `topBarModules`/
    `liveSecondaryModules`/`settingsModules`/`developerModules`/`comingSoonModules` plus the new Search/Control
    ids plus the static Actions ids are all unique — "no duplicate command registrations"),
    `AppLayoutCommandCenter.test.tsx` (new, 8 — the enhanced palette renders "Go to"/"Actions" unchanged
    alongside the new "Search" and "Control" (all 3 seeded scenes) groups, typing a scene name filters the
    palette to just that command, selecting "Good Night" calls the real `SmartHomeService.triggerScene()` and
    shows the real "Good Night activated" toast then closes the palette, Escape closes the palette, the
    "Search everything…" item opens the real Universal Search overlay and exactly one such dialog exists,
    existing "Go to" navigation to `/chat` still works, Developer Mode's `/design` gate still works correctly
    alongside the new groups, and `⌘⇧K`/`⌘K` still open the correct, distinct overlay)
  - A genuine architectural decision was made before writing any code, not a bug found after the fact: no new
    `/command-center` page or route was built. The roadmap item's own text ("Make Chat, Voice, Search,
    Productivity, Smart Home and Integrations behave as one assistant experience") was read against the
    pre-existing Command Palette (already a working, correctly-centered global command surface since the Step
    17 "center Search/Command Palette" fix) and Universal Search (Step 9) — a new page would have duplicated
    both, plus Home's existing widgets, without adding real capability. `AutomationService` (no execute/run-now
    method) and `AgentService` (no run/execute method, by design — "no second agent framework") were both
    evaluated and excluded from "Control" for the same reason: adding either would have meant inventing a
    capability neither service actually has. Smart Home's `Scene`/`triggerScene()` was the only pre-existing
    seam whose action set is already finite, named, and safe by construction.
  - Browser QA (manual, live dev server — a second `frontend-dev-alt` launch config on port 3001 was used for
    this session only, since another session held port 3000; reverted after QA, never committed): confirmed
    end-to-end in the actual running app — `⌘K` shows all 16 "Go to" items unchanged, a new "Search" group
    ("Search everything…", `⌘⇧K` hint), a new "Control" group (Good Night / Movie Time / Away Mode, each
    tagged `scene`), and an empty "Coming soon"/unchanged "Actions" group; selecting "Good Night" closed the
    palette and produced the real toast "Good Night activated — 4 devices updated" (matching the seed data's 4
    scene actions exactly); `/diagnostics` and `/settings` (including the Developer tab) were re-verified to
    still render correctly and unchanged (regression); `⌘⇧K` opened exactly one `role="dialog"` element,
    labeled "Search". Only pre-existing, environment-level Vite HMR WebSocket console errors were observed.
  - Was 523/523 across 68 files for the completed Steps 1–21:
  - Developer Mode (12 across 2 new files + 4 modified files): `DeveloperSectionStates.test.tsx` (new, 5 —
    loading spinner while settings load, the disabled hint with no registry/Design-System cards while
    Developer Mode is off, a saving spinner then success toast once the toggle resolves, an error toast that
    keeps the control usable when the update rejects, and the system-registry summary + Design System card
    appearing once Developer Mode is on), `AppLayoutDeveloperMode.test.tsx` (new, 3 — a real end-to-end check
    that the Design System page is genuinely absent from ⌘K by default and appears only after enabling
    Developer Mode from Settings, that `/design` stays reachable by direct navigation regardless of the
    toggle — discoverability only, never a route block — and that turning Developer Mode back off hides it
    from ⌘K again), `settingsService.test.ts` (+2, 9 total — `developerModeEnabled` round-trips independently
    of `notificationsEnabled`, and persists as a plain boolean in the same `jarvis.settings` `localStorage`
    key with no new storage key and nothing sensitive), `SettingsPage.test.tsx` (+1, 14 total — the Developer
    tab toggles Developer Mode and reveals the system-registry summary + Design System link; the existing
    "never displays a raw secret" sweep extended to cover the new tab), `NotificationsSectionStates.test.tsx`
    (unchanged test count — its fake `AppSettings` literals updated for the new required field, no behavior
    change), `app/__tests__/modules.test.ts` (+1 — developer-audience modules stay out of the
    topbar/secondary/settings surfaces and are only reachable via Developer Mode)
  - A genuine architectural finding, not invented: `app/modules.tsx` had declared an `Audience` type with a
    `'developer'` value, a `surface: 'developer'` `/design` module, a `developerModules` selector, and even a
    `commandModules(devMode: boolean)` helper since Step 2 — but nothing anywhere in the app ever read
    `developerModules` or called `commandModules`, and `AppLayout.tsx`'s Command Palette was hard-coded to a
    static list. This step wired up that dormant scaffolding with a real toggle rather than building a new
    mechanism.
  - Browser QA (manual, live dev server): confirmed end-to-end in the actual running app — the Design System
    page was absent from ⌘K by default; toggling Developer Mode on in Settings → Developer showed a real
    toast ("Developer Mode enabled"), a "System registry" card reporting the true `18 Components / 18 Ready`
    (matching `/diagnostics`), and a "Design System — Now in ⌘K" card; opening the Command Palette (Ctrl+K)
    and filtering to "Design System" showed exactly one match tagged `dev`, and selecting it navigated to a
    fully-rendered `/design` page with no console errors. `/diagnostics`, `/settings`, and `/` (Home) were
    re-verified to still render correctly and unchanged (regression). Only pre-existing, environment-level
    Vite HMR WebSocket console errors were observed (unrelated to this step, present before any interaction).
    The reverse (toggling back off hides `/design` from ⌘K again) was verified via the automated
    `AppLayoutDeveloperMode.test.tsx` end-to-end test rather than re-confirmed manually a second time in this
    session, after the browser automation tool's element-ref clicks became intermittently unresponsive on a
    fresh page load (a tool/environment quirk — the identical click sequence had just succeeded moments
    earlier for the "on" path); pixel-level screenshot comparison was not performed (the browser pane was not
    compositing frames this session, consistent with Step 20's browser QA note).
  - Was 511/511 across 66 files for the completed Steps 1–20:
  - Diagnostics (28 across 5 new files): `diagnosticsService.test.ts` (new, 7 — mock adapter defaults to
    `ready: true`, the Core stub is `ready: false` and every method rejects with
    `CoreDiagnosticsContractUnavailableError`, `getSystemStatus` reports all 18 shipped feature seams with
    real, non-fabricated `backendId`/`backendLabel`/`ready` — no fixed `'mock'|'core'` union assumed, since
    Chat's is `'dev'` and Voice's is `'local'` — `getCoreHealth` honestly reports `available: false` for M13B
    rather than fabricating CPU/memory numbers, and AbortSignal cancellation is respected),
    `performanceMetrics.test.ts` (new, 4 — `supported: false` with no fabricated values when the Performance
    API is unavailable, real navigation-timing fields when a navigation entry exists, fields left `undefined`
    rather than zero-fabricated when no navigation entry exists, and `memory` populated only when the
    non-standard Chromium `performance.memory` API is present), `DiagnosticsPage.test.tsx` (new, 6 — the
    local-only banner + stat cards + all 18 system-status rows, the explicit unavailable Core-health card,
    real performance metrics rendered from a mocked snapshot, the Refresh button re-measuring on click, the
    honest "Not available"/"Not available in this browser" fallbacks, and the unsupported-Performance-API
    message), `DiagnosticsPageStates.test.tsx` (new, 5 — loading/empty/error+retry/unavailable/ready),
    `routing.test.tsx` (new, 6 — live secondary module registration, not a 5th primary nav item, `/diagnostics`
    renders the real page directly, `/performance` redirects to `/diagnostics`, the old `/diagnostics`/
    `/performance` redirects to Settings confirmed removed, primary nav/no-sidebar invariant)
  - `features/settings/__tests__/routing.test.tsx` (net +1, 8 total): the `/google`/`/microsoft` redirects to
    `/settings` still work (split out from the old combined test now that `/diagnostics`/`/performance` no
    longer redirect there); a new test asserts those two paths were actually removed from Settings'
    `redirectFrom`
  - No Settings feature file (`sections/`, `SettingsPage.tsx`, `settingsService.ts`) was modified — Diagnostics
    is a standalone secondary module, not a new Settings tab, so Step 19's test suite otherwise needed no
    changes beyond the routing split above
  - A genuine architectural distinction was made before writing any code (mirrors the Step 19/Agents/Memory
    pattern of scoping before implementing): every prior step's underlying Core milestone was at least
    partial/active/"verify," so a plausible fictional mock dataset was defensible (e.g. `mockAgentAdapter.ts`'s
    named agent roles). Diagnostics' milestone (M13B) has **not started at all**
    (`JARVIS_CORE_MILESTONES.md`), so `getSystemStatus` instead introspects this frontend's own, already-real
    adapter registry rather than inventing a dataset, and `getCoreHealth` is a permanent, honest "unavailable"
    response, not a stub awaiting future mock data — see `docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md`.
  - Browser QA (manual, live dev server): `/diagnostics` renders all 18 real component rows, the Core Health
    card, and live Performance metrics (page load/DOM ready/TTFB/resource count/JS heap) sourced from the
    actual `Performance` API in that browser tab; `/performance` redirects to `/diagnostics`; the Refresh
    button re-measures without console errors; Settings/Agents/Memory/Device Management pages all still render
    correctly; Universal Search finds "Go to Diagnostics" (plus one legitimate secondary match — the seeded
    "System Health Agent" — honestly, not suppressed); no horizontal overflow at a 375px mobile width; dark
    mode renders without errors. Pixel-level screenshot comparison was not performed in this environment (the
    browser pane was not compositing frames this session) — verification was DOM/content/interaction-based
    against the live running app instead.
  - Was 482/482 across 61 files for the completed Steps 1–19:
  - Settings (35 across 6 files): `settingsService.test.ts` (new, 7 — mock adapter defaults to `ready: true`
    and persists to `localStorage`, the Core stub is `ready: false` and every method rejects with
    `CoreSettingsContractUnavailableError`, `getSettings` returns documented defaults when nothing is
    persisted, `updateSettings`/`resetSettings` round-trip correctly, corrupted `localStorage` content falls
    back to defaults rather than throwing), `SettingsProvider.test.tsx` (new, 4 — loads on mount, `update()`/
    `reset()` propagate to consumers, and `useSettings()` outside a provider falls back to safe defaults
    rather than throwing), `SettingsPage.test.tsx` (new, 13 — default Appearance tab, real theme switching via
    `document.documentElement`'s `data-theme` attribute, Notifications toggle persists across a remount, Reset
    confirmation modal restores the default, Voice/Privacy/Smart Home/AI Apps/Memory/Agents/Automations/About
    tabs each show real per-service data, an explicit assertion no secret/credential text appears anywhere
    across every tab), `NotificationsSectionStates.test.tsx` (new, 3 — loading spinner, in-flight saving
    spinner, error toast on a rejected update), `routing.test.tsx` (new, 7 — live settings-surface module
    registration, not a 5th primary nav item, not a secondary/"Go to" module, `/settings` renders the real page
    directly, the pre-existing `/google`/`/microsoft`/`/diagnostics`/`/performance` redirects still resolve,
    the topbar gear button navigates there, primary nav/no-sidebar invariant), `AppLayoutNotifications.test.tsx`
    (new, 1 — a real end-to-end check that disabling the Notifications setting empties `AppLayout`'s bell menu
    and hides its unread badge, confirming this is not a fake toggle)
  - `features/search/__tests__/searchService.test.ts` (net +2): the Settings nav destination is searchable as
    an `'app'` group result with exactly one match (no per-toggle leakage); regression tests confirm every
    pre-existing category (agent/automation/memory/knowledge/room/files) keeps working correctly now that
    Settings is a live destination — no new search category was added, since `searchApp()` already read
    `settingsModules` unconditionally before this step
  - A genuine architectural distinction was made before writing any code: Settings owns exactly one real
    preference itself (`notificationsEnabled`) — appearance, voice, privacy, and every linked feature
    (Smart Home, AI Apps, Memory, Agents, Automations) are read directly from that feature's own existing
    service, never duplicated. This kept every control real and verifiable rather than adding speculative
    toggles with no underlying effect.
  - Was 445/445 across 55 files for the completed Steps 1–17:
  - Agents (27 across 4 files): `agentService.test.ts` (new, 11 — mock adapter defaults to `ready: true`, the
    Core stub is `ready: false` and every method rejects with `CoreAgentContractUnavailableError`, seeded
    agents cover every `AgentStatus`, an explicit assertion that no seeded agent description/run summary
    matches a password/API-key/token/secret pattern, `getAgent`/`getRuns` lookups + not-found rejections
    (newest-first ordering asserted), the disabled seeded agent honestly has zero runs, `setEnabled` toggling
    disabled ⇄ idle + not-found rejection, and confirmation there is no run/execute/create method),
    `AgentsPage.test.tsx` (new, 7 — the agent card grid + stat cards + simulation banner, enabling a disabled
    agent via its card toggle, opening the detail drawer with capabilities + activity history, the honest "no
    activity yet" empty state for a zero-run agent, disabling from the detail drawer, an explicit assertion no
    secret/credential text appears anywhere on the page, deep-linking to a specific agent's drawer),
    `AgentsPageStates.test.tsx` (new, 5 — loading/empty/error+retry/unavailable/ready), `routing.test.tsx`
    (new, 4 — live secondary module registration, not a 5th primary nav item, `/agents` renders the real page
    directly with the old v1 `/agents → /chat` redirect confirmed removed, primary nav/no-sidebar invariant)
  - `features/search/__tests__/searchService.test.ts` (net +4): a query matching only an agent's name returns
    a categorized `'agent'` group with a working deep-link `navState.agentId`; the Agents nav destination is
    searchable as an `'app'` group result; regression tests confirm every pre-existing category
    (automation/memory/knowledge/room/files/chat) keeps working correctly alongside the new one — including
    a second legitimate overlap on the same Step 8 "morning" query, honestly broadened again rather than
    weakened: the seeded "Daily Briefing Agent" ("Compiles your morning briefing…") legitimately also matches,
    alongside the Step 16 memory and the pre-existing automation (mirrors how Step 13's room/device overlaps
    were handled)
  - A genuine scope correction was made before writing any code (not a bug found after the fact): the literal
    word "Agents" would suggest a catalog of independent, user-invokable services (as the task's own
    illustrative examples suggested), but `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Agents reads
    "Expose existing orchestration; **no second agent framework**" — every "agent" mention elsewhere in this
    checkpoint ties to the single, existing `AgentOrchestrator` behind Chat/Voice, the old v1 `/agents` route
    already redirected to `/chat`, and `Automation.actions` (Step 8) already models "running an agent" as a
    Core-owned consequence, not a frontend-triggered action. Implemented as observability + a local
    enable/disable toggle only — no run/execute action anywhere in this surface.
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool — or even
    `--no-file-parallelism` runs sharing the machine with other concurrent work — can produce intermittent
    timeout flakes in unrelated tests under CPU contention on this development machine (a `DeviceManagementPage.test.tsx`
    test with real simulated-latency delays was observed flaking transiently across a couple of full-suite runs
    this step, always passing cleanly — 11/11 — when that file was run in isolation); every test — new and
    pre-existing — passes reliably given an uncontended run, which is what was used to produce the 445/445
    result above.

Prior to Step 17, Steps 1–16 gates (414/414 tests across 51 files) were also green:
- TypeScript/typecheck: **PASS**
- Vitest: **414/414 PASS** across 51 files, deterministic (`npx vitest run --no-file-parallelism`, run alone —
  not concurrently with the build, to avoid the resource-contention false-failures observed in earlier steps)
  — all 384 Step 0–15 tests still pass (including the Step 12 Calendar date-drift test, now fixed during
  Step 15's validation), plus 30 new for Step 16 — Memory:
  - Memory (30 across 5 files): `memoryService.test.ts` (new, 9 — mock adapter defaults to `ready: true`, the
    Core stub is `ready: false` and every method rejects with `CoreMemoryContractUnavailableError`, seeded
    memories cover every `MemoryType`/`MemorySource`/`MemoryImportance`, an explicit assertion that no seeded
    memory content matches a password/API-key/token/secret/financial-identifier pattern, `getMemory`
    lookup + not-found rejection, `forgetMemory` deleting a memory + not-found rejection, and confirmation
    there is no create/update/edit-content method), `MemoryPage.test.tsx` (new, 7 — the memory list + stat
    cards + simulation banner, search filtering, type filtering, opening the detail drawer with
    content/source/importance, an explicit assertion no secret/credential text appears anywhere in the list
    or detail view, forget-with-confirm end to end including the exact "Forget this memory?" confirmation
    copy, deep-linking to a specific memory's drawer), `MemoryPageStates.test.tsx` (new, 6 —
    loading/empty/error+retry/unavailable/ready/no-results), `routing.test.tsx` (new, 4 — live secondary
    module registration, not a 5th primary nav item, `/memory` renders the real page directly with the old
    v1 `/memory → /settings` redirect confirmed removed, primary nav/no-sidebar invariant)
  - `features/search/__tests__/searchService.test.ts` (net +4): a query matching only a memory's content
    returns a categorized `'memory'` group with a working deep-link `navState.memoryId`; the Memory nav
    destination is searchable as an `'app'` group result; regression tests confirm every pre-existing
    category (automation/knowledge/room/files/chat) keeps working correctly alongside the new one — including
    one legitimate new overlap, honestly broadened rather than weakened: the Step 8 "morning" → Automations
    test now also asserts the seeded "Usually asks for a morning briefing around 8 AM" memory legitimately
    matches too (mirrors how Step 13's room/device overlaps were handled)
  - A genuine bug was caught and fixed during this step's own manual/automated testing (not a pre-existing
    issue carried over): `MemoryDetailDrawer.tsx` initially rendered a memory's content twice (once as the
    drawer description, once in a separate "Content" section) — redundant since a memory is short/atomic,
    unlike Knowledge's distinct snippet-vs-full-body split. Fixed by removing the duplicate section.
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool can produce
    intermittent timeout flakes in unrelated tests under CPU contention on this development machine; every
    test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`,
    which is what was used to produce the 414/414 result above.

Prior to Step 16, Steps 1–15 gates (383/384 tests across 47 files, with one known pre-existing Calendar
date-drift failure since fixed — see Step 15's own entry above) were also green:
- TypeScript/typecheck: **PASS**
- Vitest: **383/384 PASS** across 47 files, deterministic — all 365 Step 0–14 tests still pass, plus 19 new for
  Step 15 — Home Assistant + MQTT. The one failure (`CalendarPage.test.tsx > filters events to only today via
  the time filter`) was a pre-existing, unrelated Step 12 issue — `mockCalendarAdapter.ts` hardcodes its seed
  data to a fixed "today" anchor (`2026-08-09`) that had drifted behind the real calendar date; fixed as part
  of Step 15's validation pass (freezing only `Date` in that one test) before the branch was merged.
  - Smart Home + Device Management + Integrations (84 across 7 files): `smartHomeIntegrationService.test.ts`
    (new, 11 — both mock adapters default `ready: true` and are selected by default, both Core adapter stubs
    are `ready: false` and every method rejects with a connector-specific `CoreConnectorContractUnavailableError`,
    the full Home Assistant connect/disconnect/reconnect/syncEntities lifecycle including validation rejections
    and an explicit assertion that a connected/synced state's `JSON.stringify` never contains the raw secret
    entered, the equivalent MQTT lifecycle, and confirmation the two connectors' mock state is fully
    independent), `IntegrationsPage.test.tsx` (new, 6 — both connector cards render `not_configured` by
    default, connecting Home Assistant end to end through the drawer form, syncing entities and rendering the
    preview list, disconnect clearing discovered entities then reconnect, MQTT connecting independently of
    Home Assistant's state, and an explicit DOM-wide assertion that no entered secret ever appears after
    connecting), `smartHomeService.test.ts` (unchanged from Step 14), `SmartHomePage.test.tsx` (+1 — the new
    "Integrations" header action navigates to `/smart-home/integrations`), `routing.test.tsx` (+1 —
    `/smart-home/integrations` renders `IntegrationsPage`, not a placeholder), `DeviceManagementPage.test.tsx`
    / `SmartHomePageStates.test.tsx` unchanged from Step 14
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool can produce
    intermittent timeout flakes in unrelated tests under CPU contention on this development machine; every
    test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`.

Prior to Step 15, Steps 1–14 gates (365/365 tests across 45 files) were also green:
  - Smart Home + Device Management (65 across 5 files): `smartHomeService.test.ts` (+9 — `updateDevice` rename/trim/room-reassign + empty-name/unknown-room/unknown-device rejections, `removeDevice` deleting the device + tearing down its subscription + unknown-device rejection, `pairDevice` adding a device with sensible per-capability defaults after its simulated discovery delay + empty-name/unknown-room/zero-capability rejections, plus the existing core-adapter-not-ready test extended to cover all three new methods), `DeviceManagementPage.test.tsx` (new, 7 — the device list + stat cards + simulation banner, search/room filtering, opening the management drawer with capabilities/state/health-diagnostics, rename + room-reassign end to end, remove-with-confirm end to end, pair-new-device end to end including the visible "discovering device…" state, deep-linking to a specific device's drawer), `SmartHomePage.test.tsx` (+2 — the new "Manage devices" header action and a `DeviceTile`'s "Manage" button each correctly deep-link to `/smart-home/devices`), `routing.test.tsx` (+1 — `/smart-home/devices` renders `DeviceManagementPage`, not a placeholder)
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool can produce intermittent timeout flakes in unrelated tests under CPU contention on this development machine (Automations/Calendar/Tasks/AI Apps/Files/Knowledge routing tests and a couple of Smart Home deep-link tests were all observed flaking transiently, none of them a real regression); every test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`, which is what was used to produce the 365/365 result above.

Prior to Step 14, Steps 1–13 gates (346/346 tests across 44 files) were also green:
  - Smart Home (39 across 4 files): `smartHomeService.test.ts` (mock adapter rooms/devices/scenes, `sendCommand` mutating real state per capability, `triggerScene` skipping offline/unavailable devices and returning only devices that actually changed, the seeded offline + unavailable devices, `subscribeToDeviceState` firing on genuine changes plus the single simulated-drift sensor, core-adapter-not-ready rejecting every method), `SmartHomePage.test.tsx` (room overview, device grid with capability-specific controls incl. toggling a power switch and confirming the tile updates, triggering a scene and confirming affected device tiles update, the prominent simulation-disclosure banner), `SmartHomePageStates.test.tsx` (loading/empty/error+retry/unavailable), `routing.test.tsx` (live secondary module, not a 5th primary nav item, real page renders not a placeholder, primary nav/no-sidebar invariant)
  - `features/search/__tests__/searchService.test.ts` (net +15): Rooms/Devices/Scenes are each searchable as their own categorized group with working deep-link `navState` (`roomId`/`deviceId`/`sceneId`), and regression tests confirm every pre-existing category (app/nav, automation, knowledge, ai-app, note, task, calendar, files, chat) keeps working correctly alongside the three new ones.
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool can produce intermittent timeout flakes in unrelated tests under CPU contention on this development machine; every test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`, which is what was used to produce the 346/346 result above.

Prior to Step 13, Steps 1–12 gates (292/292 tests across 40 files) were also green:
  - Notes (28 across 4 files): `notesService.test.ts` (11 — mock adapter CRUD/defaults, core-adapter-not-ready + every method rejecting, seeded pinned/unpinned mix), `NotesPage.test.tsx` (9 — rendering, text/tag filtering, pin toggle, create/edit/delete flows, required-title validation), `NotesPageStates.test.tsx` (4 — loading/empty/error+retry/unavailable), `routing.test.tsx` (4 — live secondary module, not a 5th primary nav item, real page renders, primary nav/no-sidebar invariant)
  - Tasks (33 across 4 files): `tasksService.test.ts` (12), `TasksPage.test.tsx` (11 — including status/priority/project filters and the completion-checkbox quick toggle), `TasksPageStates.test.tsx` (4), `routing.test.tsx` (6 — including the pre-existing `/projects` redirect)
  - Calendar (27 across 4 files): `calendarService.test.ts` (11 — mock adapter CRUD/defaults, core-adapter rejection, the `getEvents(range)` `from`/`to` window, seeded all-day + timed mix), `CalendarPage.test.tsx` (8 — day-grouped agenda rendering with all-day vs. timed events shown distinctly, text + time-range filtering, detail drawer, create/edit/delete flows, required-title validation), `CalendarPageStates.test.tsx` (4), `routing.test.tsx` (4)
  - Files (30 across 4 files): `filesService.test.ts` (12 — mock adapter CRUD/defaults, core-adapter rejection, folder-scoped `getFiles`, cascading folder delete, the mock-only `uploadFile` metadata action), `FilesPage.test.tsx` (9 — root listing, name filter, folder navigation + breadcrumb back-navigation, file detail drawer, create-folder + add-file flows including the mock disclosure text, file delete and cascading folder delete each with confirm/cancel), `FilesPageStates.test.tsx` (5 — loading/empty/error+retry/unavailable, plus an explicit check that the breadcrumb toolbar stays visible in the empty state so folder navigation is never lost), `routing.test.tsx` (4)
  - `features/search/__tests__/searchService.test.ts` (net +15 across the Notes+Tasks and Calendar+Files additions): Notes/Tasks/Calendar/Files are each searchable as their own categorized group with working deep-link `navState` (Calendar → `eventId`; Files → `folderId`/`fileId`, resolving a nested file's *containing* folder), the Notes/Tasks/Calendar/Files nav destinations remain searchable via the "app" category, and regression tests confirm every pre-existing category (automation/knowledge/ai-app/chat) plus each newly-added one keeps working correctly together. Two pre-existing-style honest broadenings were needed, not weakenings: `"auto"` already matched extra legitimate data from Steps 11–12 (documented in-line in the test file), and `"calendar"`/`"files"` each legitimately also match a same-themed pre-existing AI Apps catalog entry ("Google Calendar", "File Access") — both assertions were broadened to include the extra `ai-app` group rather than narrowed. A few calendar/file seed titles ("Morning run", "Quarterly review call", two reuses of "Voice Orb …") were renamed during this step purely to avoid incidental substring collisions with earlier steps' exact-match search assertions — seed-data naming only, not a behavior change.
  - Note: as with prior steps, running the full suite with Vitest's default parallel worker pool can produce intermittent timeout flakes in unrelated tests under CPU contention on this development machine; every test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`, which is what was used to produce the 292/292 result above.
- Lint on changed/new files: **PASS** (zero errors, zero warnings — `npx eslint` run explicitly against every new/changed `.ts`/`.tsx` file)
- Production build: **PASS** (`tsc -b && vite build`)

There is a known unrelated/pre-existing Storybook lint issue reported during development in:

`.storybook/preview.tsx`

Do not treat that pre-existing finding as a regression from the JARVIS frontend work unless a future change touches or changes the finding.

The checkpoint also contains Emergent's `test_result.md`; preserve its required testing-protocol block if that file is updated.

---

## 7. Pending Frontend Roadmap

These are the next frontend product steps. They should be implemented **one at a time**.

| Step | Frontend Work | Status |
|---:|---|---|
| 8 | Automations frontend | 🟢 Complete (mock adapter; Core integration pending) |
| 9 | Universal Search frontend | 🟢 Complete (client-side mock adapter; Core integration pending) |
| 10 | Knowledge + Intelligence frontend | 🟢 Complete (local/static mock adapters; Core integration pending) |
| 11 | AI Apps + Integrations frontend | 🟢 Complete (in-memory mock adapter; Core integration pending) |
| 12 | Notes frontend | 🟢 Complete (in-memory mock adapter; Core integration pending) |
| 13 | Tasks + Projects frontend | 🟢 Complete (in-memory mock adapter; Core integration pending) |
| 14 | Calendar frontend | 🟢 Complete (in-memory mock adapter; Core integration pending) |
| 15 | Files + Workspace frontend | 🟢 Complete (in-memory mock adapter; Core integration pending) |
| 16 | Smart Home Command Center | 🟢 Complete (in-memory mock adapter; Core/Home Assistant/MQTT integration pending) |
| 17 | Device Management / Connectivity UI | 🟢 Complete (in-memory mock adapter, extends the Step 13 seam additively; Core/Home Assistant/MQTT integration pending) |
| 18 | Home Assistant + MQTT frontend integration | 🟢 Complete (in-memory mock adapters, one per connector, extend the Step 13 seam additively via a new `ConnectorService`; Core/Home Assistant/MQTT integration pending) |
| 19 | Memory frontend | 🟢 Complete (in-memory mock adapter, read-only recall + forget only, no semantic/vector search; Core memory integration pending) |
| 20 | Agents frontend | 🟢 Complete (in-memory mock adapter, observability + enable/disable only — no execution/run action, per "no second agent framework"; Core AgentOrchestrator integration pending) |
| 21 | Settings frontend | 🟢 Complete (one real `SettingsService`-backed preference — `notificationsEnabled`; every other tab reads an existing feature's own service directly; Core settings integration pending) |
| 22 | Diagnostics + Performance UI | 🟢 Complete (honest local introspection of every other feature's own adapter status via a new `DiagnosticsService` seam, extended to all 18 shipped seams; real live browser-Performance-API metrics, not part of the adapter seam; Core health is an explicit permanent "unavailable" state since the underlying milestone, M13B, has not started — Core Self-Healing & Observability integration pending) |
| 23 | Developer Mode | 🟢 Complete (one new real `SettingsService`-backed preference, `developerModeEnabled`; a genuine Command Palette discoverability gate over the pre-existing, previously-unused `developerModules` selector and `/design` page; a Settings → Developer tab summarizing the Step 20 `DiagnosticsService` registry rather than duplicating it; no second orchestration/permission/execution system, no invented Core/MCP endpoint — no Core contract required for what was built) |
| 24 | Unified JARVIS Command Center / cross-surface UX | 🟢 Complete (an orchestration/discovery layer over the pre-existing Command Palette — two new command groups, `app/commandCenter.ts`'s `buildSearchGroup`/`buildSceneControlGroup`, composing the existing Universal Search overlay and `SmartHomeService.triggerScene()`; no new page, no second search index, no second execution engine; no Core contract required) |
| 25 | Final JARVIS visual/interaction polish | 🟢 Complete (a visual-system consistency audit — logo clear-space, glow discipline, popup centering/geometry, typography, spacing — found everything already consistent except one real defect: `Waveform`, relocated into `design-system/patterns/Waveform/` alongside `VoiceOrb`, now reacts to the orb's real `VoiceState` via the newly-exported `stateColor` map; `VoiceOverlay.tsx` now flanks the real orb with the same reactive waves; no feature behavior changed) |
| 26 | Responsive + accessibility completion | 🟢 Complete (audited all 17 live routes at all 7 required viewports — zero horizontal overflow found; fixed a confirmed Modal viewport-overflow bug, gated `Toast`'s Framer Motion on `useReducedMotion` like every other consumer, and added a skip-to-main-content link; touch targets/Drawer/CommandPalette/SearchOverlay/semantic markup already solid, no change needed — no Core contract required) |
| 27 | Performance engineering | 🔴 Not Started ← next |
| 28 | Final frontend QA/release validation | 🔴 Not Started |

> The numbering above is the **current frontend continuation sequence**. The older `FRONTEND_IMPLEMENTATION_ROADMAP.md` uses a different numbering scheme and still contains historical statuses. Do not interpret its older `Not Started` labels as evidence that Steps 1–7 in this document are missing from the source.

---

## 8. Core Integration Dependencies

The following are intentionally pending real JARVIS Core contracts:

- Chat → real Core conversational orchestration
- Voice → real Core voice/conversation path
- Home → real Core status/data
- Search → real Core Search
- Knowledge → real Core Knowledge (frontend currently ships a local/static mock adapter only — see `docs/CORE_KNOWLEDGE_CONTRACT_REQUIRED.md`)
- Intelligence → real Core Intelligence Layer (frontend currently ships a static, pre-seeded mock adapter only, no client-side scoring — see `docs/CORE_INTELLIGENCE_CONTRACT_REQUIRED.md`)
- AI Apps → real MCP tool execution and connector OAuth (frontend currently ships an in-memory mock adapter only, with `setConnected` as a local toggle — no real MCP call or OAuth flow — see `docs/CORE_AI_APPS_CONTRACT_REQUIRED.md`)
- Automations → real execution/scheduling/persistence (frontend currently ships a mock/local adapter only — see `docs/CORE_AUTOMATIONS_CONTRACT_REQUIRED.md`)
- Notes → real persistence/sync (frontend currently ships an in-memory mock adapter only — see `docs/CORE_NOTES_CONTRACT_REQUIRED.md`)
- Tasks → real persistence/sync (frontend currently ships an in-memory mock adapter only — see `docs/CORE_TASKS_CONTRACT_REQUIRED.md`)
- Calendar → real persistence/timezone contract (frontend currently ships an in-memory mock adapter only, local-naive datetimes with no timezone model — see `docs/CORE_CALENDAR_CONTRACT_REQUIRED.md`)
- Files → real storage/upload (frontend currently ships an in-memory, metadata-only mock adapter only — no real file bytes exist anywhere in this frontend — see `docs/CORE_FILES_CONTRACT_REQUIRED.md`)
- Smart Home + Device Management → real device discovery/command execution/realtime state via Home Assistant/MQTT connectors, real pairing/onboarding, and real health/diagnostics telemetry (frontend currently ships an in-memory mock adapter only, normalized entities, no vendor-specific UI, no real discovery protocol — see `docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`)
- Home Assistant + MQTT connectors → real connect/disconnect handshake, real credential submission, real entity discovery/sync, and the entity-to-device promotion step (frontend currently ships in-memory mock adapters only, one per connector, that never contact a real instance/broker — see `docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md`)
- Memory → real memory formation, semantic/vector recall, and retention/expiry policy (frontend currently ships an in-memory mock adapter only — read-only recall list + forget, no create/edit-content, no semantic search — see `docs/CORE_MEMORY_CONTRACT_REQUIRED.md`)
- Agents → the real Core AgentOrchestrator this surface observes (frontend currently ships an in-memory mock adapter only — agent-role status + activity history + a local enable/disable toggle, no run/execute action, no real permission enforcement — see `docs/CORE_AGENTS_CONTRACT_REQUIRED.md`)
- Settings → real cross-device preference sync and any Core-controlled data-retention policy (frontend currently ships a `localStorage`-only mock adapter for its one owned preference, `notificationsEnabled`; every other tab reads an existing feature's own service — see `docs/CORE_SETTINGS_CONTRACT_REQUIRED.md`)
- Diagnostics → real Core-reported system health, self-healing events, and any Core-side view of per-subsystem status (frontend currently ships an adapter that honestly introspects its OWN local feature-adapter registry and an explicit permanent "unavailable" Core-health response — no Core self-healing/observability engine exists to integrate with yet, since JARVIS Core has not started M13B; see `docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md`). Performance metrics are real, live, browser-sourced data with no Core dependency at all — nothing pending there.
- Developer Mode → none required for what was built (a local Command Palette discoverability toggle over already-real frontend state). A *future*, deeper Core-connected Developer Mode would need real Core event/log streaming, real feature-flag control, and real Core health internals — none of which exists or was invented; see `docs/CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md`.
- Global Command Center → none required for what was built. It only recombines the already-documented Search (`docs/CORE_SEARCH_CONTRACT_REQUIRED.md`) and Smart Home (`docs/CORE_SMART_HOME_CONTRACT_REQUIRED.md`) seams' existing Core dependencies — no new one was introduced.
- JARVIS Visual Identity → none required, and none possible — this step touched only presentation (colors, motion, layout) against local `VoiceState`, never a backend seam or mock adapter.

These should not be implemented as fake backend systems in React.

When a real contract is supplied by Claude Code/JARVIS Core, implement the corresponding frontend adapter and preserve the existing UI where possible.

---

## 9. What Must NOT Be Rebuilt

Do not redo:

- Single Workspace
- sidebar removal
- primary navigation
- TopNav
- existing design system
- StateView
- ModulePage
- Widget/WidgetGrid
- useAsync
- Home foundation
- Chat foundation
- Voice foundation
- ChatService seam
- VoiceService seam
- existing mock/local adapter pattern
- Automations foundation
- AutomationService seam
- Universal Search foundation (`SearchOverlay` wiring, `SearchService` seam)
- Knowledge foundation (`KnowledgeService` seam, read-only browse/detail UI)
- Intelligence foundation (`IntelligenceService` seam, read-only display UI)
- AI Apps foundation (`AiAppsService` seam, catalog/detail UI, the single combined `/apps` surface for MCP tools + connectors)
- Notes foundation (`NotesService` seam, list/pin/CRUD UI)
- Tasks foundation (`TasksService` seam, list/status/CRUD UI, the `project` free-text tag convention — no separate Projects entity/route)
- Calendar foundation (`CalendarService` seam, the day-grouped agenda UI — not a month-grid widget, and not a Google Calendar/Microsoft 365 client)
- Files foundation (`FilesService` seam, the folder-navigation + breadcrumb UI, the metadata-only "no real storage" scope)
- Smart Home foundation (`SmartHomeService` seam, the normalized Room/Device/Scene entities, the room-overview + device-grid + scenes Command Center UI, the prominent simulation-disclosure banner)
- Device Management foundation (the same `SmartHomeService` seam extended additively with `updateDevice`/`removeDevice`/`pairDevice` and the optional health/diagnostics `Device` fields — do not introduce a second `DeviceManagementService`; the `/smart-home/devices` list + drawer + pair-device UI)
- Home Assistant + MQTT integration foundation (`smartHomeIntegrationService.ts`'s `ConnectorService` seam, one instance per connector — do not introduce a second connector service or a real MQTT/Home Assistant client; the `/smart-home/integrations` connector-card + detail-drawer UI, the `DiscoveredEntity` preview that is never merged into the live Smart Home device list)
- Memory foundation (`MemoryService` seam, the read-only recall list + detail + forget UI at `/memory` — do not add a create/edit-content method here; a memory represents something JARVIS itself formed, never user-authored in this frontend)
- Agents foundation (`AgentService` seam, the `/agents` card grid + detail + enable/disable UI — do not add a run/execute method here, and do not build a second `AgentOrchestrator`/planner/tool-executor in React; this surface only observes and toggles the SAME orchestrator that powers Chat/Voice)
- Settings foundation (`SettingsService` seam, `SettingsProvider`, the `/settings` 10-tab UI — do not add settings for things that already have a real control elsewhere; Appearance stays owned by `ThemeProvider`, never a second theme engine; Voice/Smart Home/AI Apps/Memory/Agents/Automations tabs stay read-only summaries + links into their own real pages, never a duplicate catalog or a second connect/execute/CRUD surface)
- Diagnostics foundation (`DiagnosticsService` seam, the `/diagnostics` system-status + Core-health + performance UI — do not fabricate Core health data; `getSystemStatus` must keep introspecting other features' own real service seams rather than inventing its own dataset, and `getCoreHealth` must stay an honest "unavailable" response until a real Core M13B contract exists; do not build a second health/monitoring/logging engine; `performanceMetrics.ts`'s browser-Performance-API reads stay outside the adapter seam, since they have no Core equivalent)
- Developer Mode foundation (`developerModeEnabled` on the `SettingsService` seam, `DeveloperSection.tsx`, `AppLayout.tsx`'s Command Palette gate over `app/modules.tsx`'s `developerModules` — do not build a second orchestration/permission/execution system, do not invent a Core/MCP endpoint, do not gate real hardware or bypass a real permission check through this toggle; the "System registry" card must keep reading the existing `DiagnosticsService` rather than re-deriving its own copy)
- Global Command Center foundation (`app/commandCenter.ts`'s `buildSearchGroup`/`buildSceneControlGroup`, composed into `AppLayout.tsx`'s existing `commandGroups` — do not build a second search index, a second Smart Home execution path, a new `/command-center` page, or an execute/run-now command for Automations or Agents; "Control" commands stay limited to the finite, pre-curated Smart Home scene set, never per-device commands)
- Visual Identity foundation (`design-system/patterns/VoiceOrb/VoiceOrb.tsx`'s exported `stateColor` map, `design-system/patterns/Waveform/Waveform.tsx` — do not reintroduce a second/local color palette per state, do not fork Waveform back into a feature folder, do not add a glowing decorative line/border anywhere, keep Modal/CommandPalette/SearchOverlay centered exactly as the Step 17 fix established, do not build a separate Admin visual language)
- the Home/Chat/Voice/Automations primary nav (Search stays a cross-cutting overlay; Knowledge/Intelligence/AI Apps/Notes/Tasks/Calendar/Files/Smart Home/Device Management/Integrations/Memory/Agents stay secondary/command-palette surfaces, Settings stays the top-bar right-cluster surface — none of these are a 5th nav item)

Inspect existing code before making structural changes.

---

## 10. Continuation Instructions

A new Emergent workspace/account or coding agent should:

1. Read `CLAUDE.md`.
2. Read `docs/PROJECT_CONTEXT_README.md`.
3. Read this file: `docs/FRONTEND_PROGRESS.md`.
4. Read `docs/JARVIS_FRONTEND_ARCHITECTURE.md`.
5. Read `docs/JARVIS_CORE_FRONTEND_MAPPING.md`.
6. Read `docs/FRONTEND_CONTINUATION_GUIDE.md`.
7. Inspect git status before modifying anything.
8. Do not redo Steps 0–24.
9. Keep the primary navigation as **Home · Chat · Voice · Automations** unless explicitly instructed otherwise.
10. Do not restore the sidebar.
11. Continue from **Performance Engineering** (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 11, item 25 — the next unstarted item now that item 24 Responsive + Accessibility is complete — re-read the architecture docs and verify scope before implementing).
12. Build frontend features independently using mock/local adapters when Core is unavailable.
13. Do not wait for Claude Code for frontend-only work.
14. Do not invent JARVIS Core endpoints, event schemas, authentication, or backend behavior.
15. Keep Core adapters replaceable.
16. Work on one approved step at a time.
17. Run focused tests and build validation after meaningful changes.
18. Do not manually commit or push unless explicitly requested.

---

## 11. Current Stop Point

**LAST COMPLETED FRONTEND STEP:** Step 24 — Responsive + Accessibility. A hardening pass, not new product functionality. Audited horizontal-overflow behavior across all 17 live routes at all 7 required viewports (1440×900 down to 375×812) plus Modal/Drawer/CommandPalette/SearchOverlay geometry, touch-target sizing, keyboard activation patterns, and reduced-motion coverage — the large majority was already solid (zero horizontal overflow anywhere; Drawer/CommandPalette/SearchOverlay already height-bound with internal scroll; every interactive card already uses real `role="button"` + `tabIndex={0}` + Enter/Space `onKeyDown`; a global `prefers-reduced-motion` CSS rule already covers every CSS-driven animation/transition app-wide). Three genuine gaps were found and fixed: (1) `ModalContent` had no max-height/scroll, so a tall `size="lg"` form (Automations/Calendar/Tasks/Notes/Device-pairing) could render taller than the viewport with its Save/Cancel buttons entirely unreachable — confirmed live at 375×812; fixed with `max-h-[85vh] overflow-y-auto` on the shared primitive. (2) `Toast` was the one Framer Motion consumer that didn't check `useReducedMotion` (every other one — VoiceOrb, Waveform, ActivityTimeline, ChatPage — already did); fixed via an extracted `toastMotionProps(reduced)` helper. (3) Added a standard skip-to-main-content link in `AppShell` (WCAG 2.4.1) — no skip link existed before. Icon-button/Switch/Modal-close touch targets were reviewed and left as-is: all exceed the WCAG 2.5.8 AA minimum, and the topbar has zero pixel headroom at 375px width to grow them further without reintroducing overflow. This completes roadmap Phase 10 item 24.

**NEXT FRONTEND STEP:** Performance Engineering (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 11, item 25 — the next unstarted item now that item 24 Responsive + Accessibility is complete — verify scope before implementing.)

**CURRENT PRODUCT STATE:**

- Frontend foundation: complete
- Single Workspace: complete
- Navigation: complete
- Global UI infrastructure: complete
- Home / Command Center: complete using mock data
- Chat: complete using the development adapter
- Voice: complete using local browser speech adapter
- Automations: complete as a full frontend surface using an in-memory mock adapter (Core execution/scheduling/persistence pending)
- Universal Search: complete as a cross-cutting overlay surface using a client-side mock adapter (Core search integration pending)
- Knowledge: complete as a read-only browse/detail frontend surface using a local/static mock adapter (Core ingestion/indexing integration pending)
- Intelligence: complete as a read-only display frontend surface using a static, pre-seeded mock adapter (Core Intelligence Layer integration pending)
- AI Apps: complete as a combined MCP-tool + connector catalog/detail frontend surface using an in-memory mock adapter (`setConnected` is a local toggle only — no real MCP call or OAuth flow; Core MCP & Integration Platform integration pending)
- Notes: complete as a full CRUD frontend surface using an in-memory mock adapter (Core persistence/sync integration pending)
- Tasks: complete as a full CRUD frontend surface using an in-memory mock adapter, `project` as a free-text tag rather than a separate entity (Core persistence/sync integration pending)
- Calendar: complete as a day-grouped agenda frontend surface using an in-memory mock adapter — JARVIS's own local calendar, not a Google Calendar/Microsoft 365 client (Core persistence + timezone contract pending)
- Files: complete as a metadata-only file/folder browser frontend surface using an in-memory mock adapter — no real storage/upload/preview (Core storage/upload contract pending)
- Smart Home: complete as a normalized-entity Command Center frontend surface (rooms, devices, inline controls, scenes) using an in-memory mock adapter — no vendor-specific UI, no real hardware/Home Assistant/MQTT contacted (Core Smart Home/connector integration pending)
- Device Management: complete as a per-device rename/room-reassignment, pairing, removal, and read-only health/diagnostics/connector frontend surface at `/smart-home/devices`, extending the Smart Home `SmartHomeService` seam additively using the same in-memory mock adapter — no connector configuration UI, no real device-discovery protocol (Core Smart Home/connector integration pending)
- Home Assistant + MQTT: complete as a connector status/configuration/diagnostics frontend surface at `/smart-home/integrations`, using in-memory mock adapters (one per connector) behind a new `ConnectorService` seam — no real handshake, no credential ever stored/displayed, synced entities are a preview never promoted into the live Smart Home device list (Core Home Assistant/MQTT connector integration pending)
- Memory: complete as a read-only recall list + detail + forget frontend surface at `/memory`, using an in-memory mock adapter behind a new `MemoryService` seam — no create/edit-content UI (a memory is never user-authored here), no semantic/vector search, no localStorage use (Core memory integration pending)
- Agents: complete as an observability + local enable/disable frontend surface at `/agents`, using an in-memory mock adapter behind a new `AgentService` seam — no run/execute action, no agent creation/configuration UI (every "agent" is a fictional named role the single, existing AgentOrchestrator could adopt, not an independent service); the old v1 `/agents → /chat` redirect was removed now that `/agents` has its own real page (Core AgentOrchestrator integration pending)
- Settings: complete as an 11-tab configuration frontend surface at `/settings`, using a `localStorage`-backed mock adapter behind a `SettingsService` seam for the preferences it actually owns (`notificationsEnabled`, `developerModeEnabled`) — Appearance stays owned by the existing `ThemeProvider`; Voice/Privacy/Smart Home/AI Apps/Memory/Agents/Automations/About are read-only summaries over each feature's own existing service with a link to its real page; Developer (Step 21) hosts the `developerModeEnabled` toggle plus a summary linking into Diagnostics; the pre-existing `/settings` module entry flipped from `planned` to `live` (Core settings/preferences integration pending)
- Diagnostics + Performance: complete as a `/diagnostics` frontend surface using a `DiagnosticsService` seam that honestly introspects every other feature's own real adapter status (never fabricated) plus real, live browser-Performance-API metrics (Core Self-Healing & Observability, M13B, integration pending — M13B has not started at all, unlike every other step's underlying milestone)
- Developer Mode: complete as a Settings → Developer tab + a real Command Palette discoverability gate at `/design`, using one new `SettingsService`-backed preference (`developerModeEnabled`) — no second orchestration/permission/execution system, no invented Core/MCP endpoint, no Core contract required for what was built
- Global Command Center: complete as two new Command Palette (`⌘K`) groups — "Search" (bridges to the existing Universal Search overlay) and "Control" (triggers the existing Smart Home scene set via `SmartHomeService.triggerScene()`) — composed via `app/commandCenter.ts`; no new page, no second search index, no second execution engine, no Core contract required for what was built
- JARVIS Visual Identity: complete as a consistency audit (logo/glow/popup-centering/typography/spacing all already correct) plus one real fix — `Waveform` (now in `design-system/patterns/Waveform/`) reacts to `VoiceOrb`'s real `stateColor`-mapped state with per-state amplitude/speed, shared by both the Home hero and the real Voice overlay; no Core contract required, no feature behavior changed
- Responsive + Accessibility: complete as a hardening pass across desktop/tablet/mobile viewports, keyboard/focus, semantics, touch targets, and reduced motion — zero horizontal overflow found anywhere (17 routes × 7 required viewports); Modal now caps at `max-h-[85vh] overflow-y-auto` (was a confirmed live bug — tall forms could push their footer actions entirely off-screen and unreachable on mobile); `Toast` now respects `prefers-reduced-motion` like every other Framer Motion consumer; a skip-to-main-content link was added to `AppShell`; Drawer/CommandPalette/SearchOverlay/semantic markup/touch targets were audited and found already solid — no Core contract required, no feature behavior changed
- Remaining modules: pending
- Real JARVIS Core integrations: pending separate Core contracts

**DO NOT START PERFORMANCE ENGINEERING automatically when merely reading this document. Wait for explicit approval/instruction.**

---

## 12. Snapshot Integrity Note

This document was added as a **continuation checkpoint** to the `Jarvis-Frontend-main` source snapshot. It is intended to prevent future Emergent accounts/workspaces from rediscovering or rebuilding completed work.

The source code is the implementation authority for what physically exists. This document is the current frontend status authority for continuation. Core milestone truth remains owned by the separate JARVIS-OS/Core repository and must be re-verified before Core-dependent integration work.
