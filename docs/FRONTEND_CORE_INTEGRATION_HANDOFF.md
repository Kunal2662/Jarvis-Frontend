# JARVIS Frontend → Core Integration Handoff

**Snapshot date:** 2026-08-14
**Status:** Frontend feature roadmap COMPLETE and FROZEN as of Step 26.
**Purpose:** A single, repository-verified reference for whoever picks up JARVIS Core completion and Core↔Frontend integration next. Everything below was confirmed against the actual source in this checkpoint, not assumed from older snapshot docs.

> This document supersedes the "Frontend state in ZIP" columns in `docs/JARVIS_CORE_FRONTEND_MAPPING.md` (dated 2026-08-08, written when most frontend surfaces were still placeholders). Every surface listed there as 🔴/placeholder is now a real, built frontend page — see the seam table below for the current, verified state.

---

## 1. Frontend architecture summary

```text
Feature Page (React)
  ↓
Feature Service (e.g. SmartHomeService) — an interface, not a class
  ↓
Adapter selected by an env var (VITE_<FEATURE>_BACKEND, default 'mock')
  ↓
mock<Feature>Adapter (real, in-memory, ready: true)   OR   core<Feature>Adapter (stub, ready: false, throws Core<Feature>ContractUnavailableError)
```

- **App shell**: `App.tsx` (routes) → `app/AppLayout.tsx` (topbar, Command Palette, Universal Search, Notification Center, Quick Settings, mobile tab bar, Voice overlay — all globally mounted) → `design-system/layouts/AppShell/AppShell.tsx` (the three-zone shell + skip link).
- **Navigation registry**: `app/modules.tsx` is the single source of truth for every route — `surface` (topbar/secondary/settings/developer), `audience`, `status` (live/planned — currently every module is `live`), `ready`. Derived selectors (`topBarModules`, `liveSecondaryModules`, `settingsModules`, `developerModules`) drive the topbar, Command Palette "Go to" group, and mobile tab bar. Nothing is hand-wired per-surface.
- **Design system**: `design-system/` (primitives → patterns → composites → data → layouts), barrel-exported via `design-system/index.ts`. Features import UI only from there, never redefine primitives.
- **State/async convention**: `UIStatus` (`idle|loading|ready|empty|error|unavailable|coming-soon|permission-denied|reconnecting`) + `useAsync` + `StateView`/`ModulePage`, used identically by every feature page.
- **Routing/bundling**: 4 primary routes (Home, Chat, Automations — eager; Voice has no route, it's an always-mounted overlay) + 15 secondary routes, all `React.lazy` (Step 25). See `App.tsx`.
- **Reduced motion**: a blanket `@media (prefers-reduced-motion: reduce)` rule in `index.css` covers every CSS transition/animation app-wide; JS-driven Framer Motion consumers (`VoiceOrb`, `Waveform`, `ActivityTimeline`, `ChatPage`, `Toast`) each call `useReducedMotion()` individually.

## 2. Service/adapter seams — complete, code-verified inventory

Every seam below follows the exact pattern in §1. `Backend var` is the `import.meta.env` variable that switches it to `core`; every one defaults to `mock` except Voice (`local`, real browser Web Speech API) and Chat (`dev`, the existing development SSE endpoint, not a Core contract).

| Feature | Service file | Backend var | Default | Contract doc |
|---|---|---|---|---|
| Home | `features/home/homeService.ts` | `VITE_HOME_BACKEND` | mock | — (no dedicated doc; aggregates other features' data) |
| Chat | `features/chat/chatService.ts` | `VITE_CHAT_BACKEND` | dev | `CORE_CHAT_CONTRACT_REQUIRED.md` |
| Voice | `features/voice/voiceService.ts` | `VITE_VOICE_BACKEND` | local | `CORE_VOICE_CONTRACT_REQUIRED.md` |
| Automations | `features/automations/automationService.ts` | `VITE_AUTOMATIONS_BACKEND` | mock | `CORE_AUTOMATIONS_CONTRACT_REQUIRED.md` |
| Search | `features/search/searchService.ts` | `VITE_SEARCH_BACKEND` | mock | `CORE_SEARCH_CONTRACT_REQUIRED.md` |
| Knowledge | `features/knowledge/knowledgeService.ts` | `VITE_KNOWLEDGE_BACKEND` | mock | `CORE_KNOWLEDGE_CONTRACT_REQUIRED.md` |
| Intelligence | `features/intelligence/intelligenceService.ts` | `VITE_INTELLIGENCE_BACKEND` | mock | `CORE_INTELLIGENCE_CONTRACT_REQUIRED.md` |
| AI Apps | `features/aiApps/aiAppsService.ts` | `VITE_AI_APPS_BACKEND` | mock | `CORE_AI_APPS_CONTRACT_REQUIRED.md` |
| Notes | `features/notes/notesService.ts` | `VITE_NOTES_BACKEND` | mock | `CORE_NOTES_CONTRACT_REQUIRED.md` |
| Tasks | `features/tasks/tasksService.ts` | `VITE_TASKS_BACKEND` | mock | `CORE_TASKS_CONTRACT_REQUIRED.md` |
| Calendar | `features/calendar/calendarService.ts` | `VITE_CALENDAR_BACKEND` | mock | `CORE_CALENDAR_CONTRACT_REQUIRED.md` |
| Files | `features/files/filesService.ts` | `VITE_FILES_BACKEND` | mock | `CORE_FILES_CONTRACT_REQUIRED.md` |
| Smart Home (+ Device Mgmt) | `features/smartHome/smartHomeService.ts` | `VITE_SMART_HOME_BACKEND` | mock | `CORE_SMART_HOME_CONTRACT_REQUIRED.md` |
| Home Assistant connector | `features/smartHome/smartHomeIntegrationService.ts` | `VITE_HOME_ASSISTANT_BACKEND` | mock | `CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md` |
| MQTT connector | `features/smartHome/smartHomeIntegrationService.ts` | `VITE_MQTT_BACKEND` | mock | `CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md` |
| Memory | `features/memory/memoryService.ts` | `VITE_MEMORY_BACKEND` | mock | `CORE_MEMORY_CONTRACT_REQUIRED.md` |
| Agents | `features/agents/agentService.ts` | `VITE_AGENTS_BACKEND` | mock | `CORE_AGENTS_CONTRACT_REQUIRED.md` |
| Settings | `features/settings/settingsService.ts` | `VITE_SETTINGS_BACKEND` | mock | `CORE_SETTINGS_CONTRACT_REQUIRED.md` |
| Diagnostics | `features/diagnostics/diagnosticsService.ts` | `VITE_DIAGNOSTICS_BACKEND` | mock | `CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md` |
| Developer Mode | (Settings-backed preference, no separate service) | — | — | `CORE_DEVELOPER_MODE_CONTRACT_REQUIRED.md` |

Every `core<Feature>Adapter.ts` is an intentionally unimplemented stub: `ready: false`, throws/rejects a named `Core<Feature>ContractUnavailableError`. None of them guess at an endpoint shape.

## 3. Existing verified Core contracts

Per `docs/JARVIS_CORE_MILESTONES.md` (re-verify before relying on this — it is itself a snapshot):

- **M9 — Runtime & Core Services**: ✅ Complete.
- **M10A — Universal Search & Knowledge Platform**: ✅ Complete in Core.
- **M10B — Intelligence Layer**: ✅ Complete in Core.
- **M10.5 — MCP & Integration Platform**: ✅ Complete in Core.
- **M10 — AI Orchestrator**: 🟡 Active — a real `AgentOrchestrator` exists in Core (intent/context/planning/tool-selection/permission/execution/critic stages) and conversational routing exists so Chat/Voice can reach it. **This is the highest-priority integration target** — the frontend's Chat/Voice/Agents seams are all built to plug into this one orchestrator.
- **M12 — Smart Home & IoT Platform**: 🟡 Active — Smart Home Core, Connectivity Layer, Home Assistant connector, and MQTT connector are shipped in Core; M12 overall is not complete.
- The one live, non-mock frontend dependency today: Chat's `dev` backend hits the real, already-running development endpoint `POST /api/chat/stream` (an Emergent-compatible FastAPI backend, not JARVIS Core, not a mock).

## 4. Missing/pending Core contracts

Everything in the seam table (§2) except Chat's dev-endpoint path is pending a verified Core contract. In Core-milestone terms, most-to-least mature:

1. M10 AI Orchestrator (Chat, Voice, Agents) — Core capability exists, frontend↔Core wiring does not yet.
2. M10A/M10B/M10.5 (Search, Knowledge, Intelligence, AI Apps) — Core capability marked complete in the milestone snapshot; frontend↔Core wiring not yet verified/built.
3. M12 (Smart Home, Device Management, Home Assistant, MQTT) — Core capability partially shipped; frontend↔Core wiring not yet built, and the exact device/command schema needs verification against Core, not assumed from the frontend's normalized `Device`/`Room`/`Scene` shapes.
4. M11 (Notes, Tasks, Calendar, Files) — Core milestone itself not fully closed; contracts pending on the Core side, not just the frontend side.
5. M13B (Diagnostics/Self-Healing & Observability) — Core has not started this milestone at all; `getCoreHealth()` is an honest permanent "unavailable" response, not a stub waiting on wiring.
6. Memory, Automations (M7), Settings, Developer Mode — no confirmed Core milestone number for Memory; Automations' M7 is marked Active/Partial; Settings/Developer Mode are cross-cutting and depend on whatever settings/preferences surface Core eventually exposes.

## 5. Mock adapters that must eventually be replaced

All 19 `mock<Feature>Adapter.ts` files listed in §2 — every one is in-memory, resets on page reload, and is explicitly disclosed as simulated in its own UI (banners/copy calling out "simulated," "local to this browser tab," etc.). None should be deleted before its Core replacement is verified working; the adapter interface (the `XService` type) is the seam to keep stable so swapping `mock→core` is a one-line env var change, not a rewrite.

## 6. Authentication dependencies

**None exist in this frontend today.** There is no login screen, no session token, no user object beyond a single hardcoded display name ("Tony") in `AppLayout.tsx`'s greeting and `Avatar` fallback. Any real auth work is entirely new — Core must define the contract first (session model, token storage/refresh, logout) before frontend work starts; do not guess a shape.

## 7. RBAC dependencies

**None exist.** `Audience` (`everyone|advanced|developer`) in `app/modules.tsx` is a **local, client-side visibility toggle only** (Developer Mode gates the Command Palette's "Go to" group) — it is not a permission system, enforces nothing server-side, and must not be mistaken for RBAC. Real RBAC needs a Core contract before any frontend enforcement is meaningful (client-side-only gating is always bypassable).

## 8. Credential/API-key dependencies

The only credential-shaped UI in the frontend is the Home Assistant/MQTT connector "secret" field (`ConnectorDetailDrawer.tsx`) — a `type="password"` input that is validated non-empty, passed once to the mock adapter, and never stored, logged, read back, or displayed again (verified in this step's security audit; also covered by an existing test: "never displays the entered secret anywhere after connecting"). No real credential storage, encryption, or API-key management exists anywhere in the frontend. A future Credential Manager (per the roadmap's next-phase list) is a Core/backend concern; the frontend's job will be presenting a form and never persisting the raw value client-side, which the existing `ConnectorDetailDrawer` pattern already demonstrates correctly.

## 9. Agent dependencies

`features/agents/` is **observability + local enable/disable only** — no run/execute action exists anywhere in the UI, and there is exactly one `AgentOrchestrator` concept in this whole system (Core's), never a second one built in React. Each "agent" the frontend shows is a fictional named role the real orchestrator could adopt, not an independent service. Integration means: real agent-role list, real activity history, and — if Core supports it — a real enable/disable call, from the *same* orchestrator Chat/Voice already need wiring to.

## 10. Automation dependencies

`features/automations/` is a full CRUD frontend (create/edit/delete/enable/pause-resume, trigger/condition/action authoring) over an in-memory mock — **nothing it creates actually executes**. Core must supply real scheduling/execution and persistence (M7). The frontend's `Automation`/`AutomationTrigger`/`AutomationCondition`/`AutomationAction`/`AutomationExecution` types are a reasonable starting contract shape but were invented by the frontend, not verified against Core — treat them as a proposal, not a spec.

## 11. Memory/Knowledge dependencies

- **Memory** (`features/memory/`): read-only recall list + detail + forget. No create/edit-content UI exists — a memory is modeled as something JARVIS itself forms, never user-authored here. No semantic/vector search implemented (would be entirely Core-side). No confirmed Core milestone number yet.
- **Knowledge** (`features/knowledge/`): read-only browse/consume, since Core owns ingestion (M10A). No upload/create/edit/delete method exists in the service interface at all.
- **Intelligence** (`features/intelligence/`): read-only display of a static, hand-seeded insight list — zero client-side scoring/NLP, per the explicit "do not recreate Intelligence logic in React" rule.

## 12. Smart Home/device dependencies

`features/smartHome/` (Command Center + Device Management + Home Assistant/MQTT Integrations) is the single largest mock surface: normalized `Room`/`Device`/`Scene` entities, inline device controls, scene triggering, device rename/room-reassignment/pairing/removal, and a light realtime seam (`subscribeToDeviceState`, a simulated sensor-drift interval gated on active subscribers). **No vendor-specific UI, no real discovery protocol, no real Home Assistant/MQTT handshake exists** — connecting a connector in the UI never contacts a real instance/broker. Real integration needs: Core's actual device/room/scene schema (may not match the frontend's normalized shape 1:1), a real command-execution contract, and real connector connect/disconnect + entity-discovery + entity-to-device-promotion flows.

## 13. Realtime dependencies

The only realtime-shaped code today is Smart Home's `subscribeToDeviceState(deviceId, callback) → unsubscribe` — a callback-based, client-side-only simulation (a `setInterval` in the mock adapter, not a WebSocket/SSE connection to anything). No real transport (WebSocket, SSE, polling contract) is wired to any backend. When Core defines a realtime contract, this is the one seam already shaped like a subscription API, but its transport is 100% mock.

## 14. Diagnostics dependencies

`features/diagnostics/` (`DiagnosticsService`) does two structurally different things: (a) **honestly introspects every other feature's own real adapter status** (mock vs. core, ready or not) — this needs no Core contract, it already reflects real frontend state; (b) `getCoreHealth()` — an explicit, permanent `unavailable` response, since Core has not started M13B (Self-Healing & Observability) at all. Performance metrics (`performanceMetrics.ts`) are real, live browser-Performance-API reads with zero Core dependency. Nothing here should be "wired up" until M13B actually exists in Core — there is no partial contract to integrate against yet.

## 15. Android integration dependencies

**Out of scope for this frontend entirely.** This checkpoint is the web/desktop frontend only; it contains no Android code and makes no assumptions about an Android client. Any Android↔Core contract work is independent of this handoff — do not infer Android requirements from this frontend's shape.

## 16. Home/firmware integration dependencies

**Out of scope for this frontend entirely**, same as Android. Smart Home (§12) is this frontend's *presentation* of device state — it is not, and must not become, the Home/firmware integration layer itself. Real Home/firmware↔Core wiring happens outside this repository.

## 17. Security requirements

- No credential is ever persisted client-side today (§8) — preserve this property when real auth/credentials arrive; do not introduce `localStorage`/`sessionStorage` credential storage as a shortcut.
- `SettingsService`'s only real persisted preferences (`notificationsEnabled`, `developerModeEnabled`) live in `localStorage` — fine for non-sensitive UI preferences, wrong for anything credential- or session-shaped.
- No secret/token/credential value reaches Universal Search's index, Diagnostics' system-status view, or the browser console anywhere in the current codebase (verified this step).
- `Audience: 'developer'` is UI-only (§7) — do not let it stand in for real access control when Core-side permissions arrive.
- When Core introduces auth, the natural integration point is a new top-level provider (mirroring `SettingsProvider`/`ThemeProvider`'s existing pattern) wrapping `AppLayout`, not a per-feature ad hoc check.

## 18. Recommended integration order

Mirrors `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s existing priority list, still accurate:

1. **M10 Chat/Voice/Agents → the real AgentOrchestrator** — highest leverage, since three frontend surfaces (plus Global Command Center's "Ask Jarvis" bridge) all converge on this one Core capability.
2. **M10A Search/Knowledge** — Core marked complete; likely the fastest real win.
3. **M10B Intelligence** — Core marked complete; read-only display surface, low integration risk.
4. **M10.5 AI Apps/Integrations (MCP)** — Core marked complete; needs real OAuth/tool-execution wiring, which is more involved than Search/Knowledge.
5. **M11 Productivity (Notes/Tasks/Calendar/Files)** — Core milestone itself not fully closed; verify Core-side readiness before frontend wiring.
6. **M12 Smart Home/Home Assistant/MQTT** — partially shipped in Core; largest frontend surface area, budget real time for device-schema reconciliation.
7. **M13B Diagnostics/Observability** — do not start until Core actually begins this milestone.
8. **Authentication/RBAC/Credential Manager** — cross-cutting, should land before or alongside whichever of the above needs real user identity (most of them eventually will).

## 19. Known technical debt

See `docs/FRONTEND_TECHNICAL_DEBT_REGISTER.md` for the full classified register. Summary: the frontend has essentially zero *accidental* debt (Step 26's full audit found no leaks, no duplicate listeners, no dead intervals, no unaddressed accessibility gaps) — nearly everything classified there is **intentional, Core-waiting architecture**, not a defect.

## 20. Things that MUST NOT be rebuilt

The authoritative, continuously-maintained list is `docs/FRONTEND_PROGRESS.md` §9 ("What Must NOT Be Rebuilt") — it names every foundation (Single Workspace, TopNav, `StateView`/`ModulePage`/`useAsync`, every feature's own service seam, the design system, Visual Identity's `stateColor`/`Waveform`, Step 25's route-splitting pattern) explicitly, per step. Read it before touching any existing frontend code. In one sentence: **there is exactly one of everything** — one design system, one navigation registry, one orchestrator (Core's), one search index, one Smart Home execution path, one theme engine — never build a second.
