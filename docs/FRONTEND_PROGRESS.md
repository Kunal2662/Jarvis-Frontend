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

### Home

- `features/home/HomeSections.tsx`
- `features/home/HeroOrb.tsx`
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

- `features/voice/VoiceOverlay.tsx`
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

### Navigation

- `app/modules.tsx` (`liveSecondaryModules` / `comingSoonModules` selectors added in Step 10)
- `app/AppLayout.tsx`
- `design-system/patterns/TopNav/`

---

## 6. Testing / Quality State

The latest reported frontend gates for the completed Steps 1–11 were green:

- TypeScript/typecheck: **PASS** (`tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`)
- Vitest: **PASS** — 159/159 tests across 24 files (all 127 Step 0–10 tests still pass, plus 32 new for Step 11):
  - `features/aiApps/__tests__/aiAppsService.test.ts` (11): mock adapter defaults, core-adapter-not-ready + rejection, the seeded catalog mixes `mcp-tool`/`connector` categories and covers all three connection statuses, get-by-id + not-found rejection, `setConnected` mutating in place with a persisted `updatedAt` change, `setConnected` rejecting for an app marked `unavailable`, and an explicit assertion that no install/uninstall/OAuth method exists on the service
  - `features/aiApps/__tests__/AiAppsPage.test.tsx` (7): catalog rendering with mixed categories/statuses and overview counts, connect/disconnect from the catalog card and from the detail drawer (each reflecting back to the other), the toggle staying disabled for an `unavailable` entry, the detail drawer's capabilities list and mock/local disclosure text, and the category + text filters narrowing the catalog
  - `features/aiApps/__tests__/AiAppsPageStates.test.tsx` (4): loading/empty/error+retry/unavailable async states via a fully controllable fake service, mirroring `AutomationsPageStates.test.tsx`/`KnowledgePage.test.tsx`'s state-coverage pattern
  - `features/aiApps/__tests__/routing.test.tsx` (5): `/apps` registered as a live secondary module, not a 5th primary-nav item, renders the real page (not the placeholder), the pre-existing `/plugins` redirect still resolves to it, and the primary nav/no-sidebar invariant
  - `features/search/__tests__/searchService.test.ts` (net +5): AI Apps are now searchable by name and by provider as a categorized "ai-app" group with a working deep-link `navState`, the AI Apps nav destination still resolves via the "app" category, and two explicit regression tests confirm automations/nav/knowledge search and recent-chat search all still return correct results after adding the new category. One pre-existing test in this file (`"auto"` query → nav destination) was broadened, not weakened: the new "Automations Tool" AI App legitimately also matches the substring `"auto"` (it is an MCP tool for triggering automations), so the test now asserts both the unchanged "app" group and the new "ai-app" group instead of asserting exactly one group — the same kind of honest update Step 10 made to `app/__tests__/modules.test.ts` when new live data was added.
  - Note: as with Step 10, running the full suite with Vitest's default parallel worker pool can produce intermittent timeout flakes in unrelated tests under CPU contention on this development machine; every test — new and pre-existing — passes reliably and deterministically with `npx vitest run --no-file-parallelism`, which is what was used to produce the 159/159 result above.
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
| 12 | Notes frontend | 🔴 Placeholder |
| 13 | Tasks + Projects frontend | 🔴 Placeholder |
| 14 | Calendar frontend | 🔴 Placeholder |
| 15 | Files + Workspace frontend | 🔴 Placeholder |
| 16 | Smart Home Command Center | 🔴 Placeholder |
| 17 | Device Management / Connectivity UI | 🔴 Placeholder |
| 18 | Home Assistant + MQTT frontend integration | 🔴 Placeholder / Core-contract dependent |
| 19 | Memory frontend | 🔴 Placeholder / contract dependent |
| 20 | Agents frontend | 🔴 Placeholder |
| 21 | Settings frontend | 🔴 Placeholder |
| 22 | Diagnostics + Performance UI | 🔴 Placeholder / contract dependent |
| 23 | Developer Mode | 🔴 Placeholder / contract dependent |
| 24 | Unified JARVIS Command Center / cross-surface UX | 🔴 Not Started |
| 25 | Final JARVIS visual/interaction polish | 🔴 Pending |
| 26 | Responsive + accessibility completion | 🟡 Partial / pending final QA |
| 27 | Performance engineering | 🔴 Not Started |
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
- Smart Home → real Smart Home services/connectors
- Memory → real memory service
- Tasks/Calendar/Files → real persistence/service contracts

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
- the Home/Chat/Voice/Automations primary nav (Search stays a cross-cutting overlay; Knowledge/Intelligence/AI Apps stay secondary/command-palette surfaces — none of these are a 5th nav item)

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
8. Do not redo Steps 0–11.
9. Keep the primary navigation as **Home · Chat · Voice · Automations** unless explicitly instructed otherwise.
10. Do not restore the sidebar.
11. Continue from **Step 12 — Notes** (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 5 / M11 Productivity, item 9 — the first item in the next unstarted phase, followed by Tasks + Projects, Calendar, and Files + Workspace, items 10–12).
12. Build frontend features independently using mock/local adapters when Core is unavailable.
13. Do not wait for Claude Code for frontend-only work.
14. Do not invent JARVIS Core endpoints, event schemas, authentication, or backend behavior.
15. Keep Core adapters replaceable.
16. Work on one approved step at a time.
17. Run focused tests and build validation after meaningful changes.
18. Do not manually commit or push unless explicitly requested.

---

## 11. Current Stop Point

**LAST COMPLETED FRONTEND STEP:** Step 11 — AI Apps + Integrations

**NEXT FRONTEND STEP:** Step 12 — Notes (`FRONTEND_IMPLEMENTATION_ROADMAP.md` Phase 5 / M11 Productivity, item 9 — the first unstarted item in the next phase; Tasks + Projects, Calendar, and Files + Workspace, items 10–12, follow it)

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
- Remaining modules: pending
- Real JARVIS Core integrations: pending separate Core contracts

**DO NOT START STEP 12 automatically when merely reading this document. Wait for explicit approval/instruction.**

---

## 12. Snapshot Integrity Note

This document was added as a **continuation checkpoint** to the `Jarvis-Frontend-main` source snapshot. It is intended to prevent future Emergent accounts/workspaces from rediscovering or rebuilding completed work.

The source code is the implementation authority for what physically exists. This document is the current frontend status authority for continuation. Core milestone truth remains owned by the separate JARVIS-OS/Core repository and must be re-verified before Core-dependent integration work.
