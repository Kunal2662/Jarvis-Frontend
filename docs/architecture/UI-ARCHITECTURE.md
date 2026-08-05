# JARVIS — UI Architecture (v2: Single Workspace)

**Status:** Active — supersedes the sidebar-based shell shipped in Phases 2–6.
**Adopted:** 2026-08-06
**Applies to:** all future UI work. See [ADR-0001](./adr/0001-single-workspace-architecture.md) for the decision record.

> **This document is binding.** Where it disagrees with `docs/jarvis-design-system/JARVIS-DESIGN-SYSTEM.md`
> on *layout, navigation or information architecture*, this document wins. The design system remains
> the authority on **visual language** — tokens, color, type, motion, spacing, component styling.

---

## 1. Core philosophy

JARVIS is **not a dashboard and not a web app**. It is an **AI Operating System**: a single
intelligent workspace where everything important is reachable without navigating away from what you
are doing.

The interface has one job — keep the user in conversation with an intelligence that can do things —
and every structural decision serves that.

### The ten design principles

1. **AI-first interface.** The conversation is the centre of gravity. Everything else supports it.
2. **Single workspace experience.** One frame. Content changes inside it; the frame does not.
3. **Minimal navigation.** Navigation is a thin top strip, not a structural element.
4. **No unnecessary sidebars.** No left rail, no right rail, no sliding drawers in the primary UX.
5. **No hidden complexity.** If a user has to find it, it is badly placed.
6. **Technical concepts stay inside Developer Mode.** Infrastructure is not a feature.
7. **End users interact with features, not infrastructure.**
8. **Widgets expand in place** instead of opening additional panels.
9. **The interface feels like an operating system**, not a website with a menu.
10. **Simplicity beats completeness.** Not every capability deserves a surface.

---

## 2. The single workspace layout

```
┌───────────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                              │
│  ◆ Jarvis   Home  Chat  Voice  Notes  Calendar  Tasks  Files          │
│                    AI Apps  Automations              ⌘K   ◐  ⚙  (TS)  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                       ADAPTIVE WORKSPACE                              │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │                                                             │    │
│   │              CONVERSATION / PRIMARY SURFACE                 │    │
│   │              (always present, always the largest)           │    │
│   │                                                             │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│   │  Widget      │ │  Widget      │ │  Widget      │   ← expand in    │
│   │  (collapsed) │ │  (collapsed) │ │  (collapsed) │     place        │
│   └──────────────┘ └──────────────┘ └──────────────┘                 │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  STATUS BAR      ● All systems nominal      ⌘K · ⌘J        12:04      │
└───────────────────────────────────────────────────────────────────────┘
```

**Three zones. That is the whole application.**

| Zone | Height | Contains | Never contains |
|---|---|---|---|
| **Top Bar** | fixed, ~56px | Brand, primary navigation, command trigger, AI presence, settings, account | Module trees, nested menus, technical tooling |
| **Adaptive Workspace** | fills remaining | The active surface + its widgets | Any persistent side rail |
| **Status Bar** | fixed, ~28px | System state, hints, clock | Navigation, actions |

### What "adaptive" means

The workspace is not a page container — it is a **layout that reflows around what the user is doing**:

- **Conversational mode** (default, `/` and `/chat`): the thread takes the full width; widgets sit
  below it as a collapsed strip and can be pulled up.
- **Focus mode** (a widget expanded, e.g. Notes editing): the expanded widget takes the workspace;
  the conversation compresses to a persistent composer at the bottom edge.
- **Grid mode** (`Home` overview): widgets tile the workspace; the composer stays pinned.

**Mode changes are layout transitions inside the same frame — never route changes to a new screen
with different chrome.**

---

## 3. Navigation architecture

Full taxonomy in [NAVIGATION.md](./NAVIGATION.md). The rules:

- **One level.** The top bar is flat. No dropdown trees, no nested menus, no mega-menus.
- **Ten items maximum.** If an eleventh is needed, something else is not user-facing.
- **Named for outcomes, not systems.** `Notes`, not `Document Store`. `AI Apps`, not `Plugin Registry`.
- **⌘K reaches everything**, including surfaces that are not in the top bar. The command palette is
  the power path; the top bar is the discoverable path.
- **Breadcrumbs are discouraged.** A flat information architecture should not need them.

### Forbidden in the primary user experience

| Pattern | Why | Instead |
|---|---|---|
| Left sidebar / nav rail | Structural navigation competes with content | Top bar |
| Right sidebar / context panel | Splits attention; halves the workspace | Expand the widget in place |
| Sliding drawer | Hidden navigation; requires discovery | Popover, or expand in place |
| Nested / expandable nav menus | Hierarchy the user must model | Flat top bar + ⌘K |
| Bottom dock | Duplicates the top bar | Top bar |
| Modal for routine actions | Blocks the workspace | Inline expansion |

**These components are not deleted** — see [COMPONENT-PLAN.md](./COMPONENT-PLAN.md). They remain in
the design system for Developer Mode, mobile breakpoints, and genuine edge cases. They are removed
from the *default* composition.

---

## 4. AI-first rules

1. **The composer is never more than one interaction away.** In every mode, on every surface, the
   user can talk to JARVIS without navigating.
2. **AI presence is continuous.** The `VoiceOrb` and the cyan aura persist across mode changes so the
   intelligence never appears to leave.
3. **JARVIS acts on widgets, widgets do not replace JARVIS.** "Add this to my tasks" must work from
   the conversation. The Tasks widget is a *view* of the same data, not a separate application.
4. **Results render as widgets.** When JARVIS produces something structured — a schedule, a file
   list, a task set — it materialises as an inline widget in the thread, using the same widget
   components as the workspace. One widget system, two placements.
5. **Voice is a first-class input everywhere** (`⌘J`), not a destination.

---

## 5. The abstraction rule

> **Users must never encounter the mechanism.**

Users should never need to know what a vector database is, what an embedding is, what a knowledge
graph is, how memory is stored, or how prompts are managed.

```
User:    "Remember my passport expires next year."
Jarvis:  "Done. I'll remember that."
```

Not: *"Embedded and indexed to the vector store (namespace: personal.documents, 1 chunk, 384-dim)."*

### Vocabulary rules

| Never show a user | Say instead |
|---|---|
| Vector database, embeddings, index | "Jarvis remembers this" |
| Knowledge graph, entities, relations | "Connections" — or nothing at all |
| Prompt / system prompt / prompt library | "How Jarvis responds" |
| MCP, tool registry, function calling | "What Jarvis can do" |
| Context window, tokens, truncation | "Jarvis has a lot of history here" |
| Plugin, provider, model, API key | "AI Apps", "Jarvis settings" |
| Memory store / retrieval / recall | "Jarvis remembers" / "Jarvis forgot" |

Everything on the right of this table is a **feature**. Everything on the left is **infrastructure**,
and lives behind Developer Mode — see [DEVELOPER-MODE.md](./DEVELOPER-MODE.md).

### The one exception

Users may be shown **what** JARVIS remembered and be allowed to correct or delete it — that is a
feature ("Things Jarvis remembers", inside Settings). They are never shown **how** it was stored.

---

## 6. Layer model

The three-layer separation from v1 is unchanged and still load-bearing:

```
design-system/   generic, product-agnostic, zero business logic
    ↑
features/        domain logic + domain components
    ↑
app/ + pages/    shell composition and surface entry points
```

What changes is the **shell composition** in `app/`, and the addition of a **widget tier** to the
design system:

```
design-system/
  primitives/   atoms                          (unchanged)
  composites/   molecules                      (unchanged)
  data/         tables, lists, trees           (unchanged)
  widgets/      ★ NEW — the widget contract and shell
  patterns/     shell organisms                (reduced: sidebar/dock/drawer demoted)
  layouts/      AppShell                       (rewritten: sidebar slot removed)
```

The widget tier sits between `data` and `patterns`: widgets compose composites and data components,
and are composed *by* the workspace. See [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md).

---

## 7. Responsive behaviour

The no-sidebar rule is about **information architecture**, not about pixel widths. On narrow
viewports the top bar collapses to a scrollable strip plus a `⌘K` trigger — **it does not become a
hamburger drawer.**

| Breakpoint | Top bar | Workspace |
|---|---|---|
| ≥ 1280px | All items visible | Widgets tile 3-up |
| 768–1279px | Items scroll horizontally; overflow reachable via ⌘K | Widgets tile 2-up |
| < 768px | Brand + ⌘K + orb only; nav becomes a bottom tab strip of the top 5 items | Widgets stack 1-up, conversation full-bleed |

A bottom tab strip on mobile is a platform convention, not a sidebar — it is permitted.

---

## 8. What this does not change

- The design token pipeline, theme engine, density/contrast axes, and Liquid Glass foundation.
- The visual language defined in `JARVIS-DESIGN-SYSTEM.md`.
- All 48 existing components remain in the library.
- The three-layer code separation, naming conventions, and coding standards.
- The backend, SSE protocol, and storage seams.

**This is a composition and information-architecture change, not a rewrite.**

---

## Related documents

| Document | Covers |
|---|---|
| [NAVIGATION.md](./NAVIGATION.md) | Navigation taxonomy, user-facing vs. internal surfaces, the new module registry |
| [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md) | Widget contract, expansion model, component planning |
| [DEVELOPER-MODE.md](./DEVELOPER-MODE.md) | What gets hidden, how it is gated, its own UX rules |
| [COMPONENT-PLAN.md](./COMPONENT-PLAN.md) | Disposition of every existing component + new components required |
| [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) | Phased implementation path from the current shell |
| [ADR-0001](./adr/0001-single-workspace-architecture.md) | Why this decision was made |
