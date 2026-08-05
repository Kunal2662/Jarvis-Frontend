# JARVIS — Widget System

**Status:** Planned (Phase 7-A). Companion to [UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md).

Widgets are how JARVIS replaces navigation. Instead of *going to* Tasks, the user *opens* Tasks
where they already are.

---

## 1. What a widget is

> A **widget** is a self-contained, collapsible view of one domain that expands **in place** inside
> the workspace and can also render **inline in a conversation**.

A widget is **not** a card, a page, a panel, or a modal:

| | Card | Widget | Page |
|---|---|---|---|
| Self-contained data source | ✗ | ✓ | ✓ |
| Has collapsed + expanded states | ✗ | ✓ | ✗ |
| Expands without navigation | ✗ | ✓ | ✗ |
| Renders inside a chat thread | ✗ | ✓ | ✗ |
| Owns the whole workspace | ✗ | only when expanded | ✓ |

The existing local `Widget` helper inside `frontend/src/features/home/HomeWidgets.tsx` is the
**prototype for this system** — it is promoted into the design system rather than reinvented.

---

## 2. The three states

```
┌────────────────────┐    ┌────────────────────┐    ┌──────────────────────────────┐
│ ▪ Tasks       3 ▾  │ →  │ ▪ Tasks         ▴  │ →  │ ▪ Tasks            ⤢  ✕      │
│ ────────────────── │    │ ──────────────────  │    │ ──────────────────────────── │
│ 3 due today        │    │ ☐ Complete report  │    │ [full task surface: filters, │
└────────────────────┘    │ ☐ Reply to emails  │    │  grouping, bulk edit, detail]│
   PEEK                   │ ☐ Workout          │    │                              │
   summary only           │ + Add task         │    │                              │
   1 grid cell            └────────────────────┘    └──────────────────────────────┘
                             OPEN                       FOCUSED
                             interactive, in grid        fills workspace
                             2 grid cells                composer docks to bottom
```

| State | Size | Interaction | Conversation |
|---|---|---|---|
| **peek** | 1 cell | Read-only summary + primary action | Full thread visible |
| **open** | 2 cells | Fully interactive, common actions | Full thread visible |
| **focused** | Full workspace | Everything, including detail views | Composer docks to bottom edge |

**Transitions are animated layout changes, never route changes.** `focused` updates the URL for
deep-linking and back-button support, but the shell never remounts.

---

## 3. The widget contract

```tsx
// design-system/widgets/Widget/Widget.tsx
export type WidgetState = 'peek' | 'open' | 'focused';

export interface WidgetProps {
  /** Stable id — used for layout persistence and deep links. */
  id: string;
  /** User-facing title. Never a system name. */
  title: string;
  icon?: ReactNode;
  state: WidgetState;
  onStateChange: (state: WidgetState) => void;
  /** Count/status shown in the header while collapsed. */
  summary?: ReactNode;
  /** Header actions — max 2 in peek, max 4 in open. */
  actions?: ReactNode;
  /** Rendered per state. Falling back to `children` is allowed for simple widgets. */
  children: ReactNode | ((state: WidgetState) => ReactNode);
  /** Inline-in-conversation rendering suppresses focus/expand affordances. */
  placement?: 'workspace' | 'conversation';
  className?: string;
}
```

### Rules for widget authors

1. **A widget owns its data.** It fetches, caches and refreshes independently. The workspace never
   passes it data.
2. **A widget must render usefully in all three states.** If it only makes sense focused, it is a
   page, and pages are not allowed.
3. **A widget must never open a modal, drawer or side panel.** Detail views expand *within* the
   focused state.
4. **A widget must be composable into a conversation.** No `position: fixed`, no viewport
   assumptions, no dependence on being in the grid.
5. **A widget must degrade to `EmptyState`** when it has no data — never render an empty box.
6. **A widget is built only from `@/design-system` exports.** No bespoke primitives.
7. **Loading uses `Skeleton`**, shaped like the eventual content. No spinners in the grid.

---

## 4. Planned widgets

| Widget | Domain | peek shows | Phase |
|---|---|---|---|
| **Recent Chats** | Chat | Last 3 threads | 7-A |
| **Notes** | Notes | 3 most recent, quick-capture field | 7-A |
| **Tasks** | Tasks | Count due today + checkboxes | 7-A |
| **Calendar** | Calendar | Next 3 events | 7-A |
| **Files** | Files | 3 recent + drop target | 7-B |
| **Automations** | Automations | Active count + last run | 7-B |
| **AI Apps** | Apps | Running agents + status | 7-B |
| **System Status** | System | Health dot + one metric | 7-B |
| **AI Suggestions** | AI | One proactive suggestion | 7-A |

**Already prototyped** in `HomeWidgets.tsx` (as static mock cards): Today's Schedule, Tasks, AI
Suggestions, Recent Notifications, Active Agents. These become real widgets — the markup is reusable,
the mock data is not.

---

## 5. The workspace grid

```tsx
// design-system/widgets/WidgetGrid/WidgetGrid.tsx
export interface WidgetGridProps {
  children: ReactNode;
  /** Persisted per user; the focused widget escapes the grid. */
  layout?: WidgetLayout;
  onLayoutChange?: (layout: WidgetLayout) => void;
}
```

- **Responsive columns:** 3 (≥1280px) / 2 (768–1279px) / 1 (<768px).
- **One focused widget at a time.** Focusing a second returns the first to `open`.
- **Layout persists** to `jarvis.workspace.layout` (following the existing store-module pattern —
  never touch `localStorage` directly).
- **Reordering is drag-and-drop** in a later phase; v1 ships a fixed sensible order.

---

## 6. Widgets in conversation

When JARVIS produces structured output, it renders the **same widget component** inline:

```
Jarvis
  Here's what's on your plate today.

  ┌────────────────────────────────┐
  │ ▪ Tasks                    ▾   │   ← <Widget placement="conversation" state="open">
  │ ☐ Complete report              │
  │ ☐ Reply to emails              │
  └────────────────────────────────┘

  Want me to move the report to tomorrow?
```

Rules for conversation placement:
- `peek` and `open` only — **never `focused`** inside a thread.
- No expand-to-fullscreen control; the user opens the real widget from the top bar instead.
- Actions inside the widget are real and mutate real data.
- Must survive being scrolled out of view and re-rendered (no layout-dependent state).

**This is the single most important property of the widget system:** one component, two placements.
It is what makes the interface feel like an operating system rather than a chat app with attachments.

---

## 7. Where widgets live in the codebase

```
frontend/src/design-system/widgets/
├── Widget/
│   ├── Widget.tsx           ← the shell: header, states, transitions
│   ├── Widget.stories.tsx
│   └── WidgetHeader.tsx
├── WidgetGrid/
│   └── WidgetGrid.tsx       ← responsive grid + focus management
├── useWidgetState.ts        ← state machine + deep-link sync
└── index.ts                 ← re-exported from design-system/index.ts

frontend/src/features/<domain>/
└── <Domain>Widget.tsx       ← the domain implementation, built on Widget
```

**The generic shell is design-system. The domain content is a feature.** This split is what allows a
Tasks widget to appear in the workspace, in a conversation, and (later) on a mobile home screen
without duplicating anything.

---

## 8. Widget authoring checklist

- [ ] Renders correctly in `peek`, `open`, and `focused`
- [ ] Renders correctly with `placement="conversation"`
- [ ] Owns its own data fetching and refresh
- [ ] Shows `EmptyState` when empty, `Skeleton` when loading
- [ ] Opens no modal, drawer or side panel
- [ ] Uses only `@/design-system` exports and semantic tokens
- [ ] Has `data-testid` on interactive elements
- [ ] Has a Storybook story covering all three states
- [ ] Title uses user-facing vocabulary (checked against the forbidden-terms list)
- [ ] Respects `useReducedMotion()` for expand/collapse
