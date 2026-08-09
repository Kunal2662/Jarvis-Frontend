# Required from JARVIS Core — AI Apps / Integration Contract

**Status:** ⛔ Not available yet. The AI Apps UI is wired to a pluggable
`AiAppsService` seam (`frontend/src/features/aiApps/aiAppsService.ts`). The
default adapter is an **in-memory frontend mock**
(`adapters/mockAiAppsAdapter.ts`) — a fixed, hand-seeded catalog of MCP-style
tools and third-party connectors standing in for a real Core MCP &
Integration Platform (M10.5). Nothing is persisted server-side, no MCP tool
call is actually made through this UI, and no third-party account is ever
actually linked — `setConnected` only flips a local boolean. A `core` adapter
stub exists (`adapters/coreAiAppsAdapter.ts`) but is intentionally
unimplemented — **no Core AI Apps / integration endpoint has been
invented.**

Once Claude Code ships the real Core AI Apps / integration API, implement
each method on `coreAiAppsService`, set `ready: true`, and select it with
`VITE_AI_APPS_BACKEND=core`. **No AiAppsPage/UI changes will be required** —
the page renders entirely against the `AiApp` / `AiAppCategory` /
`AiAppConnectionStatus` types already defined in `aiAppsService.ts`.

## Scope of this frontend surface

Per the roadmap (Phase 4, item 8) and the README's Phase 11 note ("Google
Workspace, Microsoft 365, Email → Settings → Connections. Plugin system and
MCP → user-facing as AI Apps, raw registries in Developer Mode"), this step
intentionally combines two conceptually different Core capabilities into
**one** catalog surface, differentiated by the `category` field:

- `'mcp-tool'` — a tool the agent itself can call while assisting you (e.g.
  Web Search, File Access, Automations Tool, Code Sandbox). Owned by Core's
  MCP/tool-execution layer.
- `'connector'` — a third-party account/service integration (e.g. Gmail,
  Google Calendar, Microsoft 365). Owned by Core's integration/OAuth layer.

This frontend does **not** build a Settings → Connections page (Settings
itself, roadmap item 19, is a separate, not-yet-built surface) and does
**not** build a real OAuth flow, plugin installer, or marketplace. A
"Developer Mode raw registry" view (the README's "raw registries in
Developer Mode" note) was considered for this step and deliberately
**omitted**: the module registry (`app/modules.tsx`) already defines an
`audience: 'developer'` concept and a `/design` route gated that way, but no
`Developer Mode` toggle/context is actually wired into any consuming UI
anywhere in this checkpoint today (`AppLayout.tsx`, the command palette, etc.
never read `developerModules`/`commandModules(devMode)`). Building a gated
raw-registry section for AI Apps would have meant inventing that gating
infrastructure from scratch, which is out of scope for this step. When
Developer Mode is wired up in a future step, a raw tool/connector registry
view (schemas, MCP server list, permission scopes as returned by Core) is the
natural next addition to this feature.

## What the frontend adapter needs to map (`AiAppsService` interface)

- `getApps(signal?) → AiApp[]`
- `getApp(id, signal?) → AiApp`
- `setConnected(id, connected: boolean, signal?) → AiApp`

Each `AiApp` carries: `category` (`mcp-tool | connector`), `provider`
(human-readable source, e.g. "JARVIS Core", "Google", "Microsoft"),
`capabilities` (a short list of what the app can do / what access it would
need), `connectionStatus` (`connected | not_connected | unavailable`), and
`updatedAt` (when the connection state last changed).

## Exact questions Claude Code must answer

1. **Endpoint(s)**: REST path(s) (or other transport) for listing the
   catalog, retrieving a single entry, and changing connection state — e.g.
   `GET /api/v1/ai-apps`, `POST /api/v1/ai-apps/{id}/connect`? Are MCP tools
   and connectors returned from the same endpoint or two separate ones that
   the frontend would merge into one catalog?
2. **MCP tool registry shape**: what does Core actually expose per tool —
   name, description, input/output schema, which agent(s)/contexts it is
   available to? Is tool availability itself user-toggleable, or is that a
   system/admin-level setting the frontend should not expose as a "connect"
   control at all?
3. **Connector / OAuth boundary**: for connector-type entries (Gmail, Google
   Calendar, Microsoft 365, etc.), does Core own the entire OAuth handshake
   (frontend only triggers a redirect and polls/receives a callback), or does
   the frontend need to embed a provider SDK? What scopes are requested per
   connector, and can the frontend display them before the user connects (the
   current mock's `capabilities` field assumes this is possible)?
4. **Permission/scope model**: is there a structured permission-scope object
   per app (e.g. `read:email`, `write:calendar`) distinct from the free-text
   `capabilities` list this mock currently uses? If so, the frontend should
   render the real scope list, not free text.
5. **Connect/disconnect semantics**: is disconnecting a connector synchronous
   (immediate revoke) or does it require a confirmation/async job (e.g.
   revoking a real OAuth token can fail or be delayed)? How should a failed
   disconnect be surfaced?
6. **Unavailable vs. not-yet-built**: does Core have its own concept of an
   entry that exists but cannot currently be connected (e.g. a connector
   pending admin approval), matching the frontend's `'unavailable'` status,
   or should that state be removed once Core is the source of truth?
7. **Real-time updates**: should the frontend poll, or does Core push
   connection-state changes (e.g. a token expiring, a connector being revoked
   externally) so the catalog can reflect that without a manual reload?
8. **Ownership/multi-user**: are connections scoped per user/session, and
   what auth is required on the AI Apps endpoints?
9. **Error taxonomy**: structured error codes vs. free-text, and which are
   safe to surface directly in the page's error state (e.g. "insufficient
   permission to connect this integration" vs. a generic failure)?
10. **Relationship to the plugin/tool registry Developer Mode note**: once
    Developer Mode is wired up (see the "Scope of this frontend surface"
    section above), what raw registry data should it display — the same
    `AiApp` objects, or a separate, more technical schema (tool JSON schemas,
    MCP server connection details) that this consumer-facing catalog
    intentionally does not expose?

Until these are provided, the in-memory mock adapter remains the only
verified frontend behavior and stays the default. Do not present it as
production Core AI Apps / integrations — nothing connected through this UI
today actually calls an MCP tool or links a real third-party account.
