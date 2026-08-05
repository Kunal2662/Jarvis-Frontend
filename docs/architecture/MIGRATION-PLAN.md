# JARVIS — Migration Plan (v1 shell → v2 single workspace)

**Status:** Ready to execute. No code has been changed yet — this document specifies exactly what to change.

The v1 shell (sidebar + 19 grouped routes) ships and works. This plan replaces its **composition**
without touching the design system's visual language, the backend, or the storage seams.

---

## Guiding constraint

> **Reorganize composition. Preserve everything reusable.**
> No component is deleted. No token changes. No backend changes. No folder restructuring outside the
> additive `widgets/`, `features/startup/` and `features/developer/` directories.

---

## Stage 0 — Preconditions

- [ ] `yarn lint && yarn typecheck && yarn test && yarn build` green on `main`
- [ ] Read [UI-ARCHITECTURE.md](./UI-ARCHITECTURE.md), [NAVIGATION.md](./NAVIGATION.md), [COMPONENT-PLAN.md](./COMPONENT-PLAN.md)
- [ ] Branch: `feat/v2-single-workspace`

---

## Stage 1 — Registry and routing (no visual change yet)

**Goal:** encode the new taxonomy in code while the old shell still renders. Ships safely on its own.

### 1.1 Rewrite `frontend/src/app/modules.tsx`

Adopt the `Surface` / `Audience` shape from [NAVIGATION.md §6](./NAVIGATION.md#6-the-new-module-registry).

- Replace `group: string` with `surface` + `audience`.
- Delete `moduleGroups` (a flat registry has no groups).
- Add `redirectFrom` for every v1 path.
- Add the missing **Notes** module (`/notes`) — this also fixes `Dock`'s existing dead link.
- Add derived selectors: `topBarModules`, `settingsModules`, `developerModules`, `commandModules(devMode)`.

### 1.2 Add a registry invariant test

`frontend/src/app/__tests__/modules.test.ts`:

```
✓ topBarModules.length <= 10
✓ every topbar module has audience === 'everyone'
✓ no topbar label matches the forbidden-vocabulary list
✓ every v1 path appears in exactly one redirectFrom
✓ no duplicate paths
```

This test is the enforcement mechanism for the whole philosophy. **Write it in this stage** — it is
what stops the architecture from drifting back.

### 1.3 Route redirects

In `App.tsx`, every v1 path redirects rather than 404s:

| From | To |
|---|---|
| `/memory`, `/knowledge` | `/settings/advanced` *(or Developer Mode when enabled)* |
| `/agents`, `/plugins` | `/apps` |
| `/automation` | `/automations` |
| `/projects` | `/tasks` |
| `/browser` | `/automations` |
| `/google`, `/microsoft` | `/settings/connections` |
| `/diagnostics`, `/performance`, `/design` | `/settings/developer` *(or `/settings` when off)* |

```tsx
{modules.flatMap(m => (m.redirectFrom ?? []).map(from => (
  <Route key={from} path={from} element={<Navigate to={m.path} replace />} />
)))}
```

**Exit criteria:** app behaves identically; the sidebar now renders from `topBarModules` + a
temporary "More" group. Tests green.

---

## Stage 2 — The new shell

**Goal:** replace sidebar navigation with the top bar. This is the visible change.

### 2.1 `AppShell` — make `sidebar` optional

Per [COMPONENT-PLAN.md §2](./COMPONENT-PLAN.md#2-layouts-1). Mark deprecated; do not remove — Developer
Mode will use it.

### 2.2 Build `TopNav` and extend `TopBar`

New `design-system/patterns/TopNav/TopNav.tsx`; `TopBar` gains a `nav` slot. Overflow beyond the
visible width is reachable via `⌘K`, **never a dropdown**.

### 2.3 Rewrite `AppLayout.tsx`

- Remove the `Sidebar` composition entirely (the component stays in the library).
- Remove `Dock` from the overlay layer.
- Remove `Breadcrumb` from `TopBar` leading content.
- Keep: `CommandPalette`, `VoiceOverlay`, `VoiceOrb`, `QuickSettings`, `StatusBar`, greeting/clock.
- `NotificationCenter` moves from `Drawer` to `Popover`, anchored to the bell.

### 2.4 `WorkspaceContainer` — drop the right panel

Remove `rightPanel` / `rightPanelOpen`. No current caller passes them, so this is a clean removal.

**Exit criteria:** no sidebar, no drawer, no dock anywhere in the primary UX. All 10 surfaces reachable
from the top bar. `yarn build` green.

---

## Stage 3 — The widget system

**Goal:** make the workspace adaptive.

### 3.1 Promote the widget shell

Move the local `Widget` helper from `features/home/HomeWidgets.tsx` (lines 33–51) into
`design-system/widgets/Widget/Widget.tsx` and extend it with `peek`/`open`/`focused`, per
[WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md). Add `WidgetGrid` and `useWidgetState`. Export from the barrel.

### 3.2 Convert Home

`Home.tsx` becomes: conversation surface + `WidgetGrid`. The existing `HomeWidgets` content becomes
individual domain widgets. **Keep the mock data** until the real APIs land — do not delete widgets to
avoid mock data.

### 3.3 Enable conversation placement

`ChatPage` renders `<Widget placement="conversation">` for structured assistant output.

**Exit criteria:** widgets expand in place; nothing opens a panel; the same widget renders in the grid
and in a thread.

---

## Stage 4 — Settings and Developer Mode

**Goal:** give the demoted surfaces a real home.

- Build `/settings` as a sectioned surface: **General · Jarvis · Connections · Advanced · About**.
- Build the user-facing counterparts (Things Jarvis remembers, Response style, Connections, Activity)
  per [DEVELOPER-MODE.md §4](./DEVELOPER-MODE.md#4-the-user-facing-counterparts).
- Build `useDeveloperMode` + `DeveloperShell` — **the one sanctioned use of `Sidebar`**.
- Move `/design`, `/diagnostics`, `/performance` under Developer Mode; lazy-load the whole chunk.
- Gate the palette's `Developer` group.

**Exit criteria:** zero technical vocabulary anywhere outside Developer Mode. Developer Mode invisible
when off.

---

## Stage 5 — Startup animation

Only after Stages 2–3, so the sequence materialises the **real** shell geometry.
Full spec and definition of done: [STARTUP-ANIMATION.md](./STARTUP-ANIMATION.md).

---

## Breaking changes

| Change | Impact | Mitigation |
|---|---|---|
| `AppShell.sidebar` required → optional | Type-level only | Deprecated, still renders |
| `WorkspaceContainer.rightPanel` removed | None — no caller uses it | — |
| `ModuleDef.group` → `surface` + `audience` | `AppLayout` only | Rewritten in the same stage |
| `moduleGroups` removed | `AppLayout` only | Same |
| Route renames (`/automation`→`/automations`, `/agents`→`/apps`) | Bookmarks | Redirects, permanently |
| `NotificationCenter` Drawer → Popover | Internal | Public props unchanged |

**Unchanged and safe:** every design token, the theme engine, all 4 data components, 21 of 24
primitives, 7 of 8 composites, the SSE protocol, all `localStorage` keys and store modules, the
backend.

---

## Rollout

Stages 1 → 5 are independently shippable, in order. Each ends green on
`yarn lint && yarn typecheck && yarn test && yarn build`.

Recommended: one PR per stage. Stage 2 is the only one with a large visual diff — pair it with
screenshots of Home, Chat and a focused widget in dark, light and reduced-motion.

---

## What NOT to do during this migration

- ❌ Delete `Sidebar`, `Dock`, `Drawer`, `Breadcrumb`, `SearchOverlay` or `WindowFrame`
- ❌ Change design tokens, the theme engine, or the visual language
- ❌ Restructure folders beyond the additive new directories
- ❌ Touch the backend, the SSE protocol, or `localStorage` key names
- ❌ Delete placeholder modules — re-home them per the migration map
- ❌ Remove mock data without a real API to replace it
- ❌ Introduce a global state library (see the README's state-management guidance)
- ❌ "Temporarily" add a sidebar back for one module
