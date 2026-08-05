# JARVIS — Developer Mode

**Status:** Planned (Phase 7-C). Companion to [UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md).

Developer Mode is where every technical concept lives. It exists so that the normal interface can
stay free of infrastructure without JARVIS losing any capability.

---

## 1. The principle

> **Users interact with features. Developers interact with infrastructure.**
> A user should never learn a database concept to use an assistant.

JARVIS has a large technical surface — vector storage, embeddings, a knowledge graph, prompt
management, MCP servers, tool registries, provider routing, context assembly. **All of it is real and
all of it is hidden.** Hiding it is not a limitation; it is the product.

```
User:    "Remember my passport expires next year."
Jarvis:  "Done. I'll remember that."
```

The user sees a promise kept. The developer, with Developer Mode on, can see the chunk, the
embedding, the namespace, and the retrieval score.

---

## 2. Gating

**Off by default. Hidden until explicitly enabled.**

| Property | Value |
|---|---|
| Location | `Settings → Advanced → Developer Mode` |
| Default | `false` |
| Storage | `jarvis.developer.enabled` (via a store module, never raw `localStorage`) |
| Exposure when off | **Zero.** No menu item, no greyed-out row, no palette entry, no tooltip. |
| Enabling | A single switch with a plain-language warning |
| Effect | Adds a `Developer` group to `⌘K` and a `Developer` section in Settings |

**Developer Mode never adds anything to the top bar.** Even enabled, it does not change the primary
navigation — it unlocks a Settings section and a palette group.

### The enable copy

> **Developer Mode**
> Shows the technical internals behind how Jarvis works — memory storage, connected tools, logs and
> diagnostics. Useful if you're building on Jarvis. You can turn this off at any time.

No warnings about danger, no "advanced users only" gatekeeping. Plain and calm.

---

## 3. What lives inside

| Tool | Replaces (v1) | Purpose |
|---|---|---|
| **Memory Browser** | `/memory` | Inspect stored memories, chunks, namespaces, retrieval scores |
| **Knowledge Graph Viewer** | `/knowledge` | Entities, relations, graph traversal |
| **Vector Database Inspector** | — | Collections, dimensions, index health, raw similarity search |
| **Embeddings Explorer** | — | Embedding model, dimensions, nearest-neighbour probe |
| **Prompt Inspector / Library** | — | System prompts, per-surface prompts, versioning, diffing |
| **Context Manager** | — | What was actually sent to the model this turn; token budget breakdown |
| **Tool Registry** | — | Registered tools, schemas, invocation history |
| **MCP Management** | — | MCP servers, connection state, exposed capabilities |
| **Plugins (raw)** | `/plugins` | Installed plugins, manifests, permissions, sandbox state |
| **AI Providers** | — | Provider routing, model selection, fallbacks, cost |
| **API Keys** | — | Key management (see [security](#5-security-rules)) |
| **Debug Console** | — | Live event stream, request/response inspection |
| **Logs** | — | Application and agent logs with filtering |
| **Performance Monitor** | `/performance` | Render timings, bundle stats, memory, FPS |
| **Diagnostics** | `/diagnostics` | Health checks, connectivity, storage integrity |
| **Experimental Features** | — | Feature flags for unreleased work |
| **Developer Utilities** | — | Cache clear, storage reset, seed data, state export |
| **Design System Showcase** | `/design` | Every component in every state |

---

## 4. The user-facing counterparts

Several internal systems have a **plain-language feature** that stays visible to everyone. This is
the pattern to follow whenever infrastructure needs a user-facing face:

| Internal tool (Developer Mode) | User-facing counterpart (Settings → Advanced) | Shows |
|---|---|---|
| Memory Browser, Vector DB, Embeddings | **Things Jarvis remembers** | Plain sentences. "Your passport expires in March 2027." Delete / correct. Never a chunk, score or namespace. |
| Prompt Library, Prompt Inspector | **Response style** | "Concise / Balanced / Detailed", tone, what Jarvis should know about you. Never a raw prompt. |
| Tool Registry, MCP, Plugins | **AI Apps** *(top bar)* | Things Jarvis can do, described as outcomes. On/off switches. Never a schema. |
| AI Providers, model routing | **Settings → Jarvis** | "Speed / Balanced / Best quality". Never a model ID. |
| Connected integrations | **Settings → Connections** | "Google connected." Never an OAuth scope list. |
| Logs, Debug Console | **Settings → Activity** | "Jarvis updated your calendar, 2h ago." Never a stack trace. |

**Rule:** every internal tool must answer *"what does the ordinary user see instead?"* If the answer
is "nothing", that is a valid and common answer.

---

## 5. Security rules

Developer Mode is a **visibility** toggle, never a **permission** toggle.

1. **Never a security boundary.** Anything gated on Developer Mode must also be enforced server-side.
   A user flipping a `localStorage` flag must not gain access to anything.
2. **API keys are write-only in the UI.** Display masked (`sk-…4f2a`); never render, log or copy the
   full value. Entering keys is a Settings action, not a Developer Mode one.
3. **Logs and the Debug Console must redact secrets** before render — keys, tokens, auth headers,
   and message content flagged sensitive.
4. **No destructive action without confirmation.** "Clear all memory" and "Reset storage" require a
   typed confirmation.
5. **Developer Mode state is per-device, not per-account.** It never syncs.

---

## 6. UX rules inside Developer Mode

Developer Mode is the **one place** where the ordinary rules relax — because the audience is
different and the data is dense:

| Rule | Primary UX | Developer Mode |
|---|---|---|
| Technical vocabulary | Forbidden | **Required** — say `embedding`, not "memory dust" |
| Sidebars / drawers | Forbidden | **Permitted** — a tool list rail is appropriate here |
| Data-dense tables | Discouraged | **Encouraged** — use `DataGrid`, `TreeView` |
| Glass surfaces | Floating chrome only | Avoid entirely — readability wins |
| Raw IDs, JSON, timestamps | Forbidden | **Expected** |

This is why the `Sidebar`, `Drawer` and `Dock` components are **kept in the library** rather than
deleted — Developer Mode is their new home. See [COMPONENT-PLAN.md](./COMPONENT-PLAN.md).

---

## 7. Implementation sketch

```tsx
// features/developer/useDeveloperMode.ts
export function useDeveloperMode(): { enabled: boolean; setEnabled: (v: boolean) => void };

// Gating a palette group
const groups = useMemo(() => [
  ...userGroups,
  ...(devMode ? [{ heading: 'Developer', items: developerItems }] : []),
], [devMode]);

// Gating a route — redirect, never render a teaser
<Route path="/settings/developer/*" element={devMode ? <Developer /> : <Navigate to="/settings" replace />} />
```

Developer tools are **lazy-loaded** (`React.lazy`) so they cost nothing in the default bundle. This
is also the first real use of route-level code splitting — see the performance items in
[ROADMAP.md](../../ROADMAP.md).
