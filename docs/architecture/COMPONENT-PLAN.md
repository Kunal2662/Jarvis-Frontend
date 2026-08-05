# JARVIS — Component Plan

**Status:** Active. Companion to [UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md).

Disposition of all **48 existing components** under the single-workspace architecture, plus the new
components required.

> **Nothing in the library is deleted.** Components that leave the primary user experience are
> *demoted*, not removed — they remain exported, tested and documented, and most acquire a new home
> in Developer Mode, mobile breakpoints, or the desktop shell.

---

## 1. Disposition legend

| Mark | Meaning |
|---|---|
| ✅ **Keep** | Unchanged. Core to the new architecture. |
| 🔧 **Modify** | Stays, but its API or default composition changes. |
| ⬇️ **Demote** | Removed from the primary UX; stays in the library for Developer Mode / mobile / desktop. |
| 🆕 **New** | Must be built. |

---

## 2. Layouts (1)

| Component | Disposition | Change |
|---|---|---|
| `AppShell` | 🔧 **Modify** | **Breaking.** The `sidebar` prop is currently **required** — it becomes optional and deprecated. New shape: `{ topbar, children, statusbar, overlay }`. A `sidebar` passed by legacy callers still renders, so Developer Mode can use it. |

```tsx
export interface AppShellProps {
  topbar?: ReactNode;
  children: ReactNode;
  statusbar?: ReactNode;
  overlay?: ReactNode;
  /** @deprecated Not part of the primary UX. Developer Mode / desktop only. */
  sidebar?: ReactNode;
  className?: string;
}
```

---

## 3. Patterns (11)

| Component | Disposition | Rationale / change |
|---|---|---|
| `TopBar` | 🔧 **Modify** | **Becomes the only navigation surface.** Gains a `nav` slot rendering `topBarModules`, overflow handling, and a mobile tab-strip variant. Today it only has `leading`/`trailing`/`onSearchClick`. |
| `StatusBar` | ✅ **Keep** | Already correct — zone 3 of the new layout. |
| `CommandPalette` | 🔧 **Modify** | Gains Developer-Mode group gating. **Preserve the "Ask Jarvis" fallback branch** — it is the most important behaviour in the palette. |
| `VoiceOrb` | ✅ **Keep** | Central to AI-first presence. Also drives the startup sequence (`offline` → `idle`). |
| `WorkspaceContainer` | 🔧 **Modify** | **Remove `rightPanel` / `rightPanelOpen`.** A right context panel is exactly the forbidden pattern. Props are deprecated then dropped; content moves into an expanded widget. |
| `NotificationCenter` | 🔧 **Modify** | **Currently a right-side `Drawer` — forbidden.** Re-implement over `Popover`, anchored to the top-bar bell. Item/group API is unchanged, so callers need no edits. |
| `QuickSettings` | ✅ **Keep** | Already a popover anchored in the top bar. Correct by construction. |
| `WindowFrame` | ⬇️ **Demote** | Not used in the web shell. Retained for the desktop phase (custom title bar). |
| `SearchOverlay` | ⬇️ **Demote** | Redundant with `CommandPalette`, which already searches. Keeping two search surfaces is hidden complexity. Retained but unused in the default composition. |
| `Sidebar` (+ `SidebarGroup`, `SidebarItem`) | ⬇️ **Demote** | **Removed from the primary UX.** New home: the Developer Mode tool rail, where a dense nav rail is appropriate. Fully preserved. |
| `Dock` | ⬇️ **Demote** | Duplicates the top bar; a second nav surface violates "minimal navigation". Retained for a possible desktop-shell dock. *(Also fixes its current dead links to `/notes` and `/graph`.)* |

---

## 4. Primitives (24)

**21 of 24 are unaffected.** They are generic atoms with no navigational opinion:

`Avatar` · `Badge` · `Button` · `IconButton` · `SplitButton` · `Input` · `TextArea` · `Select` ·
`Combobox` · `Checkbox` · `Radio` · `Switch` · `Spinner` · `Skeleton` · `Progress` · `Divider` ·
`Kbd` · `Label` · `Tooltip` · `Popover` · `Dropdown` — all ✅ **Keep**.

| Component | Disposition | Rationale |
|---|---|---|
| `Popover` | ✅ **Keep** *(elevated)* | Becomes the default overlay mechanism. Notifications, quick settings, widget menus all land here. |
| `Drawer` | ⬇️ **Demote** | Sliding drawers are forbidden in the primary UX. Retained for Developer Mode and the mobile sheet variant. `NotificationCenter` stops using it. |
| `Modal` | 🔧 **Modify** *(policy, not code)* | No API change. **Policy:** modals are for destructive confirmations only — never routine actions, which expand in place. |
| `Glass` | ✅ **Keep** | Unchanged. Also used by startup beat 7. |

---

## 5. Composites (8)

| Component | Disposition | Rationale |
|---|---|---|
| `Card` / `CardHeader` / `CardContent` / `CardTitle` | ✅ **Keep** *(elevated)* | The substrate the `Widget` shell is built on. |
| `StatCard` | ✅ **Keep** | Widget summary content. |
| `EmptyState` | ✅ **Keep** *(elevated)* | Now **mandatory** for any widget with no data. |
| `Tabs` | ✅ **Keep** | In-place content switching — exactly the right pattern for expanded widgets. |
| `FormField` | ✅ **Keep** | Settings and Developer Mode. |
| `Toast` | ✅ **Keep** | Non-blocking feedback fits AI-first. |
| `Pagination` | ✅ **Keep** | Data surfaces and Developer Mode. |
| `Breadcrumb` | ⬇️ **Demote** | Implies hierarchical navigation that a flat IA does not have. Retained for Developer Mode drill-downs. Removed from `TopBar`'s default composition. |

---

## 6. Data (4)

| Component | Disposition | Rationale |
|---|---|---|
| `Table` · `DataGrid` · `List` · `TreeView` | ✅ **Keep** | Unchanged, and now doubly important: they are the content of focused widgets and the backbone of Developer Mode. The existing "readability-first, no glass" rule stands. |

---

## 7. New components required

### 7.1 Widget tier — `design-system/widgets/` 🆕

| Component | Purpose | Phase |
|---|---|---|
| `Widget` | The shell: header, `peek`/`open`/`focused` states, transitions, conversation placement | 7-A |
| `WidgetHeader` | Title, summary, actions, state control | 7-A |
| `WidgetGrid` | Responsive grid, focus management, layout persistence | 7-A |
| `useWidgetState` | State machine + deep-link sync | 7-A |

Full contract in [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md).

> **Do not write these from scratch.** The local `Widget` helper in
> `frontend/src/features/home/HomeWidgets.tsx` (lines 33–51) is the working prototype — promote it.

### 7.2 Shell — `design-system/patterns/` 🆕

| Component | Purpose | Phase |
|---|---|---|
| `TopNav` | The flat navigation strip inside `TopBar`: overflow, active state, mobile tab variant | 7-A |

### 7.3 Domain widgets — `features/<domain>/` 🆕

`RecentChatsWidget` · `NotesWidget` · `TasksWidget` · `CalendarWidget` · `FilesWidget` ·
`AutomationsWidget` · `AIAppsWidget` · `SystemStatusWidget` · `AISuggestionsWidget` — Phase 7-A/7-B.

### 7.4 Developer Mode — `features/developer/` 🆕

`DeveloperShell` (the one place `Sidebar` is used) · `useDeveloperMode` · individual tool surfaces —
Phase 7-C. See [DEVELOPER-MODE.md](./DEVELOPER-MODE.md).

### 7.5 Startup — `features/startup/` 🆕

`StartupSequence` · `AmbientGlow` · `EnergyWave` · `ParticleField` · `useStartupSequence` ·
`useStartupAudio` — Phase 7-D. See [STARTUP-ANIMATION.md](./STARTUP-ANIMATION.md).

---

## 8. Summary

| Disposition | Count | Components |
|---|---|---|
| ✅ Keep unchanged | **37** | All data components, most primitives and composites, `StatusBar`, `VoiceOrb`, `QuickSettings` |
| 🔧 Modify | **6** | `AppShell`, `TopBar`, `CommandPalette`, `WorkspaceContainer`, `NotificationCenter`, `Modal` *(policy only)* |
| ⬇️ Demote | **5** | `Sidebar`, `Dock`, `Drawer`, `Breadcrumb`, `SearchOverlay`, `WindowFrame` *(6 modules across 5 pattern entries)* |
| 🆕 New | **~20** | Widget tier (4), `TopNav` (1), domain widgets (9), Developer Mode (3+), Startup (6) |

**~77% of the library is untouched.** Six components change, none are deleted. This is a composition
change, which is precisely why the design system was built with a public barrel and no business
logic inside it.

---

## 9. Review checklist for any new component

- [ ] Does an existing component already do this? *(Check `design-system/index.ts` first — 48 exist.)*
- [ ] Can an existing component be extended with a variant or prop instead?
- [ ] Is it in the right tier? (primitive → composite → data → **widget** → pattern → layout)
- [ ] Does it introduce a sidebar, drawer, or second navigation surface? *(If yes: stop.)*
- [ ] Does it open a panel instead of expanding in place? *(If yes: stop.)*
- [ ] Does its name or copy use forbidden vocabulary? *(See [UI-ARCHITECTURE.md §5](./UI-ARCHITECTURE.md#5-the-abstraction-rule).)*
- [ ] Uses only semantic tokens — no hardcoded values?
- [ ] Exported from `design-system/index.ts`?
- [ ] Story + smoke test + `data-testid`s?
