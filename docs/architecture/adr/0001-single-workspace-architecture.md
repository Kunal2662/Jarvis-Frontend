# ADR-0001 — Single Workspace Architecture

**Status:** Accepted
**Date:** 2026-08-06
**Supersedes:** the sidebar-based application shell built in Phases 2–6

---

## Context

Phases 2–6 delivered a competent desktop-application shell: a collapsible left sidebar with 19 routes
across five groups (Overview, Intelligence, Workspace, Integrations, System), a bottom dock, a
right-side notification drawer, a right context-panel slot on every module, and breadcrumbs.

It works, and it is conventional. That is the problem.

Three concrete issues surfaced:

1. **It reads as a web dashboard, not an operating system.** The chrome — rail, dock, drawers,
   breadcrumbs — announces "web app". JARVIS is meant to feel like a system you are *inside*.
2. **The navigation exposed our architecture to end users.** `Memory`, `Knowledge`, `Plugins`,
   `Diagnostics`, `Performance` and `Design System` sat in the sidebar as peers of `Tasks` and
   `Calendar`. A user has no idea what a knowledge graph is and should never have to care. We were
   shipping our implementation diagram as an information architecture.
3. **The AI was decentralised.** With 19 equal destinations, conversation became one tab among many.
   In an AI-first product, the assistant should not compete with a nav item for attention.

Additionally, three structural patterns actively fought the product goal: the right context panel
halved the workspace, the notification drawer hid content behind a slide-out, and the dock duplicated
navigation that already existed in the sidebar.

## Decision

Adopt a **single workspace architecture**:

1. **Three zones only** — Top Bar → Adaptive Workspace → Status Bar.
2. **No sidebars, no drawers, no dock, no hidden nav panels** in the primary user experience.
3. **A flat top bar, capped at ten user-facing items**, named for outcomes rather than systems.
4. **Widgets that expand in place** within the workspace, replacing navigation to separate screens.
   One widget component renders both in the workspace grid and inline in a conversation.
5. **The conversation is the primary surface** and is never more than one interaction away.
6. **All technical concepts move behind Developer Mode**, which is off and completely invisible by
   default. Each internal system gets a plain-language user-facing counterpart, or no surface at all.
7. **Nothing reusable is deleted.** Demoted components stay in the library and are re-homed in
   Developer Mode, mobile breakpoints, or the future desktop shell.

## Consequences

### Positive

- The interface stops resembling a dashboard and starts resembling a system.
- Users are never exposed to vector databases, embeddings, graphs or prompt management.
- The conversation regains primacy without losing access to features.
- Navigation shrinks from 19 destinations to 10, which is inside working-memory limits.
- The widget contract (one component, two placements) is what makes AI output feel native rather
  than bolted on.
- ~77% of the component library is untouched — this is a composition change, which is exactly what
  the design system was structured to absorb.

### Negative / costs

- `AppShell`, `TopBar`, `WorkspaceContainer`, `NotificationCenter`, `CommandPalette` and the module
  registry all change. Six components, one breaking prop change, several route renames.
- Six components leave the primary UX and risk bit-rot; they must stay covered by tests and stories.
- Route renames require permanent redirects.
- The widget system is genuinely new work and is on the critical path for Home.
- Discoverability of rarely-used capabilities now depends on `⌘K` and on JARVIS itself. If either is
  weak, features become unreachable. **This is the main risk.**

### Mitigations

- A registry invariant test enforces the ≤10 cap, the audience rule and the vocabulary ban in CI, so
  the architecture cannot silently drift back.
- Demoted components keep their stories and smoke tests and gain a real consumer in Developer Mode.
- The "Ask Jarvis" fallback in the command palette is treated as a protected behaviour.

## Alternatives considered

**Keep the sidebar, just reorganise it.** Rejected: the exposure problem is about *what* is in
navigation, but the "feels like a web app" problem is about *having* a structural nav rail at all.
Reorganising fixes half the problem.

**Collapse the sidebar to icons by default.** Rejected: hidden navigation is explicitly what we are
trying to eliminate. An icon rail is a nav rail with worse affordances.

**Chat-only interface, no navigation.** Rejected: overcorrection. Calendars, files and task lists are
genuinely better as direct-manipulation surfaces than as conversation. Widgets are the middle path.

**Ship Developer Mode as a separate application.** Rejected: too expensive, and developers need the
internals *in context* with the running app.

## References

- [UI-ARCHITECTURE.md](../UI-ARCHITECTURE.md) — the specification
- [NAVIGATION.md](../NAVIGATION.md) — taxonomy and migration map
- [WIDGET-SYSTEM.md](../WIDGET-SYSTEM.md) — the widget contract
- [DEVELOPER-MODE.md](../DEVELOPER-MODE.md) — what gets hidden and how
- [COMPONENT-PLAN.md](../COMPONENT-PLAN.md) — per-component disposition
- [MIGRATION-PLAN.md](../MIGRATION-PLAN.md) — execution path
