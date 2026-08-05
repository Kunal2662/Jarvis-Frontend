# JARVIS — Architecture Documentation

The architectural source of truth for JARVIS. **Read this before writing UI code.**

As of **2026-08-06**, JARVIS follows a **single workspace architecture**. The sidebar-based shell
shipped in Phases 2–6 is superseded. See [ADR-0001](./adr/0001-single-workspace-architecture.md).

---

## Read in this order

| # | Document | Read it for |
|---|---|---|
| 1 | **[UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md)** | The philosophy, the three-zone layout, the ten principles, the abstraction rule. **Start here.** |
| 2 | **[NAVIGATION.md](./NAVIGATION.md)** | What is user-facing vs. internal, the v1→v2 migration map, the new module registry |
| 3 | **[WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md)** | How widgets replace navigation; the widget contract |
| 4 | **[DEVELOPER-MODE.md](./DEVELOPER-MODE.md)** | Where every technical concept lives, and how it stays hidden |
| 5 | **[COMPONENT-PLAN.md](./COMPONENT-PLAN.md)** | Disposition of all 48 existing components + what to build |
| 6 | **[MIGRATION-PLAN.md](./MIGRATION-PLAN.md)** | The staged execution path |
| 7 | **[STARTUP-ANIMATION.md](./STARTUP-ANIMATION.md)** | ⬜ Pending required milestone — the boot sequence |
| 8 | **[adr/0001](./adr/0001-single-workspace-architecture.md)** | Why, including the alternatives rejected |

**Visual language** — color, type, motion, spacing, tokens — remains in
[`../jarvis-design-system/JARVIS-DESIGN-SYSTEM.md`](../jarvis-design-system/JARVIS-DESIGN-SYSTEM.md).
These documents govern **layout, navigation and information architecture**; that one governs **how
things look**. Where they disagree on structure, these win.

---

## The one-minute version

```
Top Bar  →  Adaptive Workspace  →  Status Bar
```

- **No sidebars. No drawers. No dock. No hidden nav panels.**
- **Ten user-facing items, maximum**, named for outcomes: Home · Chat · Voice · Notes · Calendar ·
  Tasks · Files · AI Apps · Automations · Settings.
- **The conversation is the primary surface.** It is never more than one interaction away.
- **Widgets expand in place**, and the same widget renders inline in a conversation.
- **Every technical concept lives behind Developer Mode**, off and invisible by default.
- Users must never see the words *vector database*, *embedding*, *knowledge graph*, *prompt*, *MCP*,
  *tool registry* or *context window*.

> User: "Remember my passport expires next year."
> Jarvis: "Done. I'll remember that."

---

## Before you build anything

- [ ] Does it add a sidebar, drawer, or second navigation surface? → **Stop.**
- [ ] Does it open a panel instead of expanding in place? → **Stop.**
- [ ] Does its name or copy use technical vocabulary? → **Rename, or move to Developer Mode.**
- [ ] Does an existing component already do this? → Check `design-system/index.ts` (48 exist).
- [ ] Would a user need to understand infrastructure to use it? → **Redesign.**

---

## Status

| Area | State |
|---|---|
| Architecture decision | ✅ Accepted |
| Documentation | ✅ Complete |
| Stage 1 — Registry & routing | ⬜ Not started |
| Stage 2 — New shell | ⬜ Not started |
| Stage 3 — Widget system | ⬜ Not started |
| Stage 4 — Settings & Developer Mode | ⬜ Not started |
| Stage 5 — Startup animation | ⬜ Not started |

**No application code has been changed yet.** The v1 sidebar shell is still what runs.
[MIGRATION-PLAN.md](./MIGRATION-PLAN.md) specifies exactly what to change, stage by stage.
