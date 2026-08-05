# JARVIS — Navigation Architecture

**Status:** Active. Companion to [UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md).

---

## 1. The navigation model

There is exactly **one** navigation surface in the primary user experience: a **flat top bar**.

```
◆ Jarvis  │  Home  Chat  Voice  Notes  Calendar  Tasks  Files  AI Apps  Automations  │  ⌘K  ◐  ⚙  (TS)
```

Three access paths, in order of discoverability:

| Path | For | Reaches |
|---|---|---|
| **Top bar** | Everyone | The 10 user-facing surfaces |
| **⌘K command palette** | Power users | Everything, including Settings sub-surfaces and (when enabled) Developer Mode tools |
| **Conversation** | Everyone | Anything JARVIS can do — the real navigation layer |

**The conversation is the primary navigation mechanism.** "Show me last week's notes" should always
beat clicking. The top bar exists for orientation and for users who prefer pointing.

---

## 2. User-facing surfaces (the only things in the top bar)

| # | Label | Route | What it is to the user |
|---|---|---|---|
| 1 | **Home** | `/` | The workspace. Conversation + widgets. |
| 2 | **Chat** | `/chat` | Full-height conversation with history. |
| 3 | **Voice** | `⌘J` (overlay, not a route) | Talk to Jarvis. |
| 4 | **Notes** | `/notes` | Write and find things. |
| 5 | **Calendar** | `/calendar` | Schedule. |
| 6 | **Tasks** | `/tasks` | Things to do. |
| 7 | **Files** | `/files` | Documents Jarvis can read and act on. |
| 8 | **AI Apps** | `/apps` | Capabilities you can turn on — agents, skills, connectors. |
| 9 | **Automations** | `/automations` | Things Jarvis does on its own. |
| 10 | **Settings** | `/settings` | Preferences, connections, memory, account. *(Top-bar right cluster, not the main strip.)* |

**Ten is the ceiling.** Adding an eleventh user-facing surface requires removing one or demonstrating
it is not infrastructure.

### Naming rules

- Name the **outcome**, not the system. `Notes` not `Document Store`. `AI Apps` not `Plugin Registry`.
- Use the word a non-technical person would use unprompted.
- Plural for collections (`Notes`, `Tasks`, `Files`), singular for activities (`Chat`, `Voice`).
- No jargon, no acronyms, no product-internal codenames.

---

## 3. Surfaces that are NOT navigation

These exist but are reached contextually — never as a top-bar item:

| Surface | Reached via | Why not in the top bar |
|---|---|---|
| **Projects** | A grouping *inside* Tasks, Notes and Files | An organising concept, not a destination. Users think "my work", not "the projects module". |
| **Search** | `⌘K` | Search is an action, not a place. |
| **Notifications** | Top-bar bell → **popover** (not a drawer) | Ambient, transient. |
| **Quick settings** | Top-bar gear → popover | Theme/density toggles are adjustments, not a destination. |
| **Google Workspace / Microsoft 365** | Settings → Connections | Account configuration, not a feature. |
| **Browser automation** | A capability inside Automations | Users automate *outcomes*; the browser is the mechanism. |
| **Design System Showcase** | Developer Mode | Internal validation surface. |

---

## 4. Internal systems — hidden by default

The following are **implementation details**. They must never appear in the top bar, and must never
appear anywhere at all unless Developer Mode is explicitly enabled.

**Settings → Advanced** *(power users, plain language)*
- Things Jarvis remembers *(user-facing view of memory — content only, never mechanism)*
- Response style *(user-facing view of prompt configuration)*
- Connected accounts
- Data & privacy controls

**Settings → Developer Mode** *(hidden until enabled — see [DEVELOPER-MODE.md](./DEVELOPER-MODE.md))*
- Memory Manager / Memory Browser
- Knowledge Graph viewer
- Vector Database inspector
- Embeddings explorer
- Prompt Library / Prompt Inspector
- MCP management
- Plugins (raw registry)
- AI Providers
- Tool Registry
- API Keys
- Context Manager
- Debug Console
- Logs
- Performance Monitor
- Diagnostics
- Experimental Features
- Developer Utilities
- Design System Showcase

**Rule:** if a surface's name contains a word from the [vocabulary table](./UI-ARCHITECTURE.md#vocabulary-rules),
it belongs here.

---

## 5. Migration map — old registry → new

Every current route has an explicit destination. **Nothing is deleted.**

| Current (v1) | New home (v2) | Disposition |
|---|---|---|
| `/` Home | `/` **Home** | Kept — becomes the adaptive workspace |
| `/chat` AI Chat | `/chat` **Chat** | Kept — renamed |
| `/voice` Voice | `⌘J` overlay | Kept — was already an overlay action |
| `/memory` Memory | Settings → Advanced → *Things Jarvis remembers* **+** Dev Mode → Memory Browser | Split: content is a feature, mechanism is a tool |
| `/knowledge` Knowledge | Dev Mode → Knowledge Graph | Demoted — pure infrastructure |
| `/agents` Agents | `/apps` **AI Apps** | Merged — agents are AI Apps to a user |
| `/automation` Automation | `/automations` **Automations** | Kept — pluralised |
| `/projects` Projects | Grouping inside Tasks / Notes / Files | Demoted from destination to organising concept |
| `/tasks` Tasks | `/tasks` **Tasks** | Kept |
| `/calendar` Calendar | `/calendar` **Calendar** | Kept |
| `/files` Files | `/files` **Files** | Kept |
| `/browser` Browser | Capability inside Automations | Demoted — mechanism, not outcome |
| `/google` Google Workspace | Settings → Connections | Demoted — account config |
| `/microsoft` Microsoft 365 | Settings → Connections | Demoted — account config |
| `/plugins` Plugins | `/apps` **AI Apps** + Dev Mode → Tool Registry | Split by audience |
| `/diagnostics` Diagnostics | Dev Mode → Diagnostics | Demoted |
| `/performance` Performance | Dev Mode → Performance Monitor | Demoted |
| `/settings` Settings | `/settings` **Settings** | Kept — becomes a real, sectioned surface |
| `/design` Design System | Dev Mode → Design System | Demoted — internal tool |
| — | `/notes` **Notes** | **NEW** — fixes the existing dead `/notes` link in `Dock` |

Old routes must **redirect**, never 404. See [MIGRATION-PLAN.md](./MIGRATION-PLAN.md#route-redirects).

---

## 6. The new module registry

`frontend/src/app/modules.tsx` remains the single source of truth for navigation — its **shape**
changes to encode audience and surface placement.

```tsx
export type Surface = 'topbar' | 'settings' | 'developer' | 'contextual';
export type Audience = 'everyone' | 'advanced' | 'developer';

export interface ModuleDef {
  path: string;
  label: string;               // the USER-FACING name — never a system name
  icon: LucideIcon;
  /** Where this surface is reachable from. Only 'topbar' renders in the top nav. */
  surface: Surface;
  /** Who is allowed to see it. 'developer' requires Developer Mode enabled. */
  audience: Audience;
  /** Built vs. planned. */
  ready?: boolean;
  badge?: string;
  /** Overlay/action instead of navigation. */
  action?: 'voice' | 'command';
  /** Old v1 path that should redirect here. */
  redirectFrom?: string[];
}
```

**Derived, never hand-written:**

```tsx
export const topBarModules   = modules.filter(m => m.surface === 'topbar');
export const settingsModules = modules.filter(m => m.surface === 'settings');
export const developerModules= modules.filter(m => m.surface === 'developer');

/** Everything the palette can reach, gated on Developer Mode. */
export const commandModules = (devMode: boolean) =>
  modules.filter(m => devMode || m.audience !== 'developer');
```

**Invariants — enforce these in review (and ideally in a unit test):**

1. `topBarModules.length <= 10`
2. Every `topbar` module has `audience: 'everyone'`
3. No `topbar` label contains a term from the forbidden vocabulary list
4. Every v1 path appears in exactly one `redirectFrom`
5. `moduleGroups` is gone — a flat registry has no groups

---

## 7. Command palette behaviour

The palette is the one place where the flat top bar and the full surface list meet.

- **Default:** shows the 10 user-facing surfaces plus actions ("New note", "Start voice session",
  "Ask Jarvis…").
- **Developer Mode on:** appends a `Developer` group with the internal tools.
- **Never** surfaces a developer tool to a user who has not enabled Developer Mode — not even as a
  disabled or greyed-out row.
- **"Ask Jarvis" stays the fallback branch:** any query with no match is offered to the conversation.
  This is the single most important behaviour in the palette and must be preserved.

---

## 8. Anti-patterns

Do not, under any circumstance:

- Re-introduce a left nav rail "just for this one module"
- Add a right context panel "because there's space at 1440px"
- Put a hamburger menu on mobile
- Add a second navigation level ("Tasks → Boards → List")
- Show a developer tool with an "upgrade to see" or "enable to use" teaser
- Name a top-bar item after a system (`Vector Store`, `MCP`, `Providers`)
- Use a modal where an inline expansion would do
