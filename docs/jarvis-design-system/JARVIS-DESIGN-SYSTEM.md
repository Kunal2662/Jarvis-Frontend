# Jarvis — Master Design System

> **Jarvis** is an **AI Operating Companion** — a complete AI Operating System, not a chatbot.
> This document is the single source of truth for every Jarvis screen. It is written to scale past **100+ screens** without visual drift.

**Version:** 1.0.0
**Theme priority:** Dark-first (light theme is a first-class peer)
**Accent model:** Neutral graphite base + a single, disciplined blue accent
**Icon system:** Lucide
**Density model:** Adaptive (Compact ↔ Comfortable)
**Companion file:** [`design-tokens.json`](./design-tokens.json) — machine-readable tokens for build pipelines (Style Dictionary / Tailwind / CSS vars).

**Design DNA:** JARVIS (Iron Man) × Windows 11 Fluent × Apple VisionOS × Arc × Linear × Notion × Raycast.
**Explicitly NOT:** cyberpunk, gaming UI, neon overload, or heavy skeuomorphic glass. The feel is **premium, minimal, calm, and AI-first**.

---

## 1. Design Philosophy

Jarvis behaves like an intelligent operator standing quietly beside the user. The interface should feel like *presence, not decoration*.

**Five principles**

1. **Calm intelligence.** The UI is quiet by default. Color, motion, and glow are spent only where intelligence is actually happening (AI thinking, listening, results appearing). Everything else is neutral graphite.
2. **Surface over chrome.** Structure comes from layered surfaces and spacing, not from heavy borders or boxes. Fewer lines, more air.
3. **One accent, used with intent.** Blue is a signal — it marks the primary action, the active state, and AI activity. If everything is blue, nothing is. Aim for **≤ 10% accent coverage** on any screen.
4. **Content is the interface.** Notes, tasks, graphs, and files are the heroes. Navigation recedes; content advances.
5. **Adaptive, not rigid.** The same system serves a data-dense diagnostics table and a spacious writing surface via the density model — never two competing design languages.

**JARVIS "presence" cues** (used sparingly): a soft cyan aura on the AI orb, concentric ambient rings while listening, and a gentle breathing glow while thinking. These are ambient, never loud.

---

## 2. Color Palette

Graphite is the world; blue is the intelligence. Semantic tokens are the only thing product screens should reference — never raw primitives.

### Primitive ramps
- **Graphite** `0 → 1000` — the neutral spine of everything (backgrounds, text, borders).
- **Blue** `50 → 900` — the single accent. `500` is the dark-theme anchor, `600` the light-theme anchor.
- **Cyan Glow** — reserved *exclusively* for AI presence (orb, listening rings, active AI aura). Never used for buttons or generic UI.
- **Status:** Green (success), Amber (warning), Red (danger), Blue (info), Violet (AI "thinking" only), Teal (rare data categorical).

### Semantic roles (theme-resolved)
| Role | Purpose |
|---|---|
| `bg.canvas` | The deepest app background |
| `bg.base` → `bg.overlay` | Rising surface layers (panels, cards, popovers, modals) |
| `text.primary / secondary / tertiary / disabled` | Text hierarchy |
| `border.subtle / default / strong / focus` | Separation, only where surface layering isn't enough |
| `accent.solid / soft / text / ring / glow` | The blue signal |
| `status.*` + `*Soft` | Semantic feedback with tinted background pairs |
| `ai.aura / listening / thinking / speaking` | Reserved AI-presence colors |

**Rules**
- Never hardcode hex in product code — reference semantic tokens.
- Status colors always ship as a **pair** (foreground + `*Soft` background) for accessible badges/banners.
- The cyan glow is a *presence* color, not a *brand* color — do not use it on CTAs.
- Categorical data (charts) uses an ordered sequence; see §29.

---

## 3. Typography

- **Primary / Display:** `Geist` (fallback `Inter`). Clean, neutral, engineered — the Linear/Vercel register.
- **Mono:** `Geist Mono` (fallback `JetBrains Mono`) for code, logs, IDs, telemetry, diagnostics.
- **Numeric:** tabular figures enabled for tables, metrics, and monitoring dashboards.

**Type scale** (see tokens for exact values)

| Token | Size | Weight | Use |
|---|---|---|---|
| `displayXl / Lg / Md` | 48 / 38 / 30 | 600 | Marketing, onboarding, big empty states |
| `h1 / h2 / h3` | 24 / 20 / 17 | 600 | Page and section titles |
| `bodyLg / body / bodySm` | 16 / 14 / 13 | 400 | Reading + UI text (14 is the workhorse) |
| `label` | 13 | 500 | Form labels, buttons |
| `caption` | 12 | 500 | Meta, timestamps, helper text |
| `overline` | 11 | 600, uppercase, tracked | Section eyebrows, nav group headers |
| `mono` | 13 | 400 | Code, logs, IDs |

**Rules:** headings use tight negative tracking (`-0.02em`); body stays at `0`; never more than 3 weights on a screen (400/500/600). Line length target **60–75ch** for reading surfaces (Notes, Chat).

---

## 4. Spacing System

4px base unit. Scale: `0, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128`.

**Guidance**
- **Component internal padding:** 8–16px. **Section rhythm:** 24–48px. **Page margins:** 24–32px.
- Prefer *generous* spacing — apply ~2× the padding that first feels right, especially on reading and dashboard surfaces.
- Use the **8px grid** for layout; 4px increments only for fine control tuning.
- Space is the primary separator. Reach for a border only when two adjacent surfaces share the same elevation.

---

## 5. Border Radius System

`xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20 · 3xl 28 · pill`

**Role mapping:** control/input `8` · popover `12` · card `16` · panel/modal `20` · sheet `24` · chip/avatar `pill`.

Radii **nest**: a child's radius = parent radius − its padding, so corners stay concentric. Never mix sharp and round within one component.

---

## 6. Elevation

Elevation is expressed **primarily through surface color**, and only secondarily through shadow — this is what keeps the dark theme clean instead of muddy.

| Level | Meaning | Dark surface | Shadow |
|---|---|---|---|
| 0 | Canvas / inline | graphite-900 | none |
| 1 | Card / list row | graphite-850 | 1px ambient |
| 2 | Popover / dropdown / floating panel | graphite-800 | soft |
| 3 | Drawer / sheet | graphite-750 | medium |
| 4 | Modal / command palette | graphite-700 | large |

In **dark**, higher = lighter surface. In **light**, higher = same white surface + stronger shadow. Never raise elevation with a border alone.

---

## 7. Shadows

Dark shadows are deep and low-saturation (blacks), never colored — except the dedicated **AI glow**.

- **Ambient set:** levels 1–4 pair with elevation (see tokens `elevation.*.shadow`).
- **Focus ring:** 2px offset gap + 2px accent ring (`shadow.focusRing`) — always visible, never removed.
- **AI glow** (`shadow.aiGlow.sm/md/lg`): soft cyan halo, used only on the AI orb, active voice states, and streaming AI responses.
- **Inner top highlight** (`shadow.innerTop`): a 1px inner light line on raised dark surfaces to imply a Fluent-style light source.

Avoid stacking >1 shadow per element (glow + ambient is the only allowed pair).

---

## 8. Icon Style

- **Library:** Lucide (`lucide-react`), line-based, geometric — matches the clean register.
- **Stroke:** `1.75` default, `2` for emphasis/active, `1.5` hairline for dense tables.
- **Sizes:** `14 / 16 / 20 / 24 / 32`; `20` is the default UI size, `16` for inline-with-text.
- **Color:** inherit `text.secondary`; active/selected → `accent.text`; never multicolor.
- **Alignment:** optically centered on a 24px box; pair with an 8px gap to labels.
- One icon family only — never mix Lucide with another set. Custom marks (logo, AI orb) are the sole exceptions.

---

## 9. Animation Language

Motion communicates **causality and intelligence**, never spectacle.

- **Personality:** confident, quick, slightly springy on user-initiated actions; smooth and ambient on AI/system states.
- **Signature moments:** command palette rise, AI response streaming, voice orb activation, panel/route transitions.
- **Durations:** micro `80–140ms`, standard `220ms`, panels/routes `320ms`, ambient loops `2.4s`.
- **Easing:** `standard` (0.2,0,0,1) for most; `spring` for playful confirmations; `decelerate` for entrances.
- **Golden rule:** animate `opacity` and `transform` only — never `transition: all`, never animate layout-affecting properties on hot paths.

---

## 10. Motion Guidelines

- **Entrances:** fade + 8px rise, `decelerate`, 220ms. Lists **stagger** children 20–30ms.
- **Exits:** fade + 4px, `accelerate`, 140ms (faster than entrance).
- **Hover:** 140ms background/scale (≤1.02); **Press:** instant scale 0.98.
- **Route change:** outgoing fade-down, incoming fade-up, shared-axis feel; ≤320ms.
- **AI streaming:** tokens fade in per chunk; a soft cyan caret pulses at the tail.
- **Ambient loops** (voice rings, thinking glow): infinite, ≤4s, low-amplitude opacity/scale only.
- **Accessibility:** honor `prefers-reduced-motion` — replace movement with instant/crossfade, keep ≤120ms; disable all ambient loops.

---

## 11. Component Hierarchy

Three tiers keep the library scalable across 100+ screens.

- **Primitives (atoms):** Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Badge, Chip, Tag, Avatar, Tooltip, Kbd, Divider, Spinner, ProgressBar, Icon.
- **Composites (molecules):** MenuItem, ListRow, Card, StatCard, Toolbar, Tabs, Breadcrumbs, SearchField, FormField, Dropdown, Popover, DatePicker, Toast, Accordion, SegmentedControl, Pagination.
- **Patterns (organisms):** Sidebar, TopBar, CommandPalette, ChatThread, ChatComposer, VoiceOverlay, DataTable, KanbanBoard, GraphCanvas, FileExplorer, SettingsPanel, NotificationCenter, Modal, Drawer, RightPanel, EmptyState, PageHeader.

Rule: patterns compose composites; composites compose primitives. No pattern re-implements a primitive.

---

## 12. Responsive Grid System

- **Columns:** 4 (xs) → 8 (sm/md) → 12 (lg+).
- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 · 3xl 1920`.
- **Gutters:** 16 (mobile) → 24 (desktop). **Margins:** 16 → 32.
- **Max content width:** 1440px on wide screens; reading surfaces cap at ~720–760px.
- **App shell** is fluid (sidebar + content + optional right panel); **content grids** use the 12-col system.
- **Adaptive shell:** right panel collapses first (<1280), sidebar becomes a rail (<1024), then an overlay drawer (<768).

---

## 13. Navigation Architecture

A **three-zone shell** on desktop:

```
┌───────┬─────────────────────────────┬──────────┐
│ Side  │  TopBar (context + search)  │  Right   │
│ bar   ├─────────────────────────────┤  Panel   │
│ (nav) │  Content Area               │ (context/│
│       │                             │  AI)     │
└───────┴─────────────────────────────┴──────────┘
```

- **Sidebar** = primary spatial nav (modules & workspaces).
- **TopBar** = local context (breadcrumb, view controls, universal search entry, profile).
- **Right Panel** = ephemeral context (AI assistant, item details, activity).
- **Command Palette** = keyboard-first *action* layer (⌘K), spanning everything.
- **Voice** = an ambient layer invocable from anywhere.

Navigation is **module → workspace → view → item**. Deep links resolve to that path; breadcrumbs mirror it.

---

## 14. Dashboard Layout ("Command Center")

The default home. A calm operations overview, not a wall of widgets.

- **PageHeader:** greeting + date, global status pill (systems nominal), primary "Ask Jarvis" entry.
- **Row 1 — Vitals:** 3–4 `StatCard`s (active agents, tasks due, memory items, system health) using tabular numerics.
- **Row 2 — Focus:** left = "Today" (tasks, calendar, priority notes); right = "Jarvis Suggests" (AI-surfaced actions).
- **Row 3 — Modules grid:** 12-col cards linking into each module with a live micro-metric.
- **Ambient AI orb** docked bottom-right, always reachable.

Uses the 12-col grid; cards reflow 4→2→1 across breakpoints. Comfortable density by default; Compact available.

---

## 15. Sidebar Design

- **Widths:** expanded `260`, collapsed rail `64`. Persists per user.
- **Structure (top→bottom):** workspace switcher → global search trigger (⌘K hint) → **Pinned** → grouped module nav (`overline` group headers) → spacer → system status → user/account.
- **Item:** 20px Lucide icon + label + optional count badge; height follows density (32 compact / 40 comfortable).
- **States:** hover `bg.hover`; active = `bg.selected` + 2px left accent bar + `accent.text` icon.
- **Collapsed rail:** icons only, labels on hover tooltip; groups become dividers.
- **Surface:** `bg.base`, hairline `border.subtle` on the content edge — no heavy divider.
- Fully keyboard navigable; nav groups are collapsible with persisted state.

---

## 16. Top Navigation

- **Height:** 56px, sticky, `bg.base` with bottom hairline; subtle backdrop blur when content scrolls under.
- **Left:** sidebar toggle + breadcrumbs (module → workspace → view).
- **Center:** universal search field (click or ⌘K) — the single most prominent element after content.
- **Right:** view controls (density toggle, filter, sort), notifications bell (with unread dot), theme toggle, avatar menu.
- Contextual **secondary toolbar** may dock directly below per module (e.g., Kanban filters, table column controls).

---

## 17. Command Palette Design (⌘K)

The keyboard heart of Jarvis — Raycast/Linear grade.

- **Invoke:** ⌘K / Ctrl+K anywhere; centered, elevation-4, radius `20`, max-width 640px, offset ~15vh from top.
- **Backdrop:** scrim `opacity.scrim` + `blur.md`.
- **Structure:** search input (large, auto-focused, mode prefix icon) → grouped results (Actions, Navigation, Search results, **Ask Jarvis**) → footer with keyboard hints.
- **Modes via prefix:** `>` commands, `@` people/agents, `#` tags, `/` AI ask, plain = universal search.
- **Row:** icon + primary label + secondary path + trailing shortcut/kbd; selected row = `bg.selected` + accent bar.
- **AI branch:** last group is always "Ask Jarvis: '<query>'" → routes the query to the AI.
- **Motion:** scale 0.98→1 + fade, 220ms `decelerate`; results restagger on query change.
- Full keyboard loop (↑↓ navigate, ⏎ execute, ⌫ back a mode, Esc close).

---

## 18. AI Chat Design

Not a bubble chat — a **document-like intelligence thread**.

- **Layout:** centered column, max ~760px, generous vertical rhythm.
- **User turn:** right-aligned soft `accent.soft` container, `text.primary`.
- **Jarvis turn:** left-aligned, borderless, sits directly on canvas with a small AI orb marker + "Jarvis" label; supports rich blocks (markdown, code with mono + copy, tables, cards, citations, tool-call chips).
- **Streaming:** tokens fade in; pulsing cyan caret; a "Jarvis is thinking…" shimmer row precedes first token.
- **Message actions** (hover): copy, retry, edit, branch, save-to-memory, thumbs.
- **Composer:** docked bottom, auto-grow (56→220px), radius `xl`, attach + tools + mic + send; ⌘⏎ sends; slash-commands and @-mentions inline.
- **Context chips** above composer show attached files/memory/agents in scope.
- **Threads/branches** in a left rail or right panel; sources & citations collapsible.

---

## 19. Voice Assistant UI

The most "JARVIS" moment — restrained, cinematic, calm.

- **Invocation:** wake word or mic; a full-viewport `voiceOverlay` (z 950) with heavy backdrop blur + darkened scrim.
- **Center:** the **AI orb** — a soft cyan sphere with concentric rings. States:
  - *Idle:* gentle breathing glow.
  - *Listening:* concentric rings expand outward in time with input amplitude (waveform-reactive).
  - *Thinking:* violet-tinted slow rotation + inward pulse.
  - *Speaking:* blue-tinted amplitude bars radiating from center.
- **Live transcript** streams below the orb in `bodyLg`; recognized intent/entities highlight in accent.
- **Quick actions** appear as chips as intents resolve.
- **Dismiss:** tap outside, Esc, or "stop"; graceful fade + orb shrink to the docked mini-orb.
- All ambient motion respects reduced-motion (rings become a static glow + text state).

---

## 20. Workspace Layout

Workspaces are containers scoping projects, notes, tasks, files, and agents.

- **Left rail:** workspace tree (projects → sub-items), collapsible.
- **Main:** view switcher (Overview · Board · List · Calendar · Files · Graph) as a `SegmentedControl` in the secondary toolbar.
- **Right panel:** contextual details / AI assistant scoped to the workspace.
- **Overview:** hero header (name, members, description), pinned items, activity, "Jarvis Suggests".
- Consistent PageHeader + secondary toolbar pattern shared with all module screens (this is the reusable "module frame").

---

## 21. File Explorer Layout

- **Dual-mode:** Grid (thumbnails/type icons) ↔ List (name, type, size, modified, owner) via `SegmentedControl`.
- **Left:** folder tree + smart collections (Recent, Shared, AI-tagged, Trash).
- **TopBar:** breadcrumb path, search, view toggle, sort, upload, new folder.
- **Rows/tiles:** Lucide type icon or preview, selection checkbox on hover, quick actions (open, share, rename, AI-summarize, delete).
- **Right panel:** file details — preview, metadata, versions, **AI summary & extracted entities** (fed into the knowledge graph).
- **Interactions:** drag-drop upload with dropzone overlay, multi-select, keyboard nav, contextual right-click menu.

---

## 22. Graph Visualization Style (Knowledge Graph)

- **Canvas:** deep `bg.canvas` with a faint dot-grid; infinite pan/zoom; subtle vignette focus.
- **Nodes:** circular, sized by relevance/degree; color-coded by type (Note, Task, File, Person, Concept, Agent) from a restrained categorical set; label appears at zoom threshold. Selected node → accent ring + soft glow.
- **Edges:** thin, low-opacity graphite curves; labeled/weighted on hover; animated flow pulse only on the active path.
- **Physics:** gentle force-directed layout; nodes settle with spring easing; motion calms after ~1s.
- **Interactions:** click focuses + dims neighbors' opacity, hover reveals a detail card, double-click expands connections; minimap bottom-right; search-to-locate.
- **Legend & filters** dock as a floating glass panel (the one place light glass is welcome).
- Reduced-motion → static layout, no physics animation.

---

## 23. Settings Layout

- **Two-pane master–detail:** left nav (grouped: Account, Appearance, AI & Models, Voice, Privacy & Memory, Integrations, Plugins, MCP, Automation, Diagnostics, Advanced); right detail scrolls.
- **Sections** as `Card`-grouped rows: label + description left, control right (Switch/Select/Input).
- **Sticky sub-header** per section; anchor scroll from left nav.
- **Appearance** page hosts theme (dark/light/system), accent (fixed blue but tunable intensity), and **density toggle** live-previewed.
- Dangerous actions isolated in a red-tinted "Danger zone" card with confirm modals.
- Max detail width ~720px for readability; changes autosave with a subtle toast.

---

## 24. Notification System

- **Toasts (transient):** bottom-right stack, z 900; slide+fade in, auto-dismiss 4–6s (persistent for errors/actions). Variants: info/success/warning/danger + AI. Max 3 stacked; overflow collapses to "+N".
- **Anatomy:** status icon, title, optional body, optional action button, close.
- **Notification Center (persistent):** bell in TopBar → right drawer; grouped by Today/Earlier and by source (System, Agents, Workspace, AI). Unread dot + count badge; mark-all-read; per-item actions.
- **AI/agent notifications** carry the orb marker and can deep-link into the originating context.
- Never block the user; critical confirmations use modals, not toasts.

---

## 25. Modal System

- **Types:** Dialog (centered, focused decisions), Drawer/Sheet (side, contextual detail/forms), Sheet (bottom, mobile).
- **Dialog:** centered, elevation-4, radius `20`, max-width by role (sm 400 / md 520 / lg 720); scrim + `blur.md`.
- **Anatomy:** header (title + optional description + close) · body (scrolls, sticky header/footer) · footer (actions right-aligned, primary rightmost).
- **Behavior:** focus trap, Esc to close (unless destructive-unsaved), restore focus on close, `aria-modal`, scroll lock.
- **Motion:** scale 0.98→1 + fade 220ms; drawer slides on X-axis 320ms `decelerate`.
- One modal at a time; nested flows use steps within a single dialog, not stacked modals.

---

## 26. Form Design

- **FormField:** label (`label` token) · optional helper/description · control · inline validation message + status icon. Vertical stacking by default; two-column only on wide dense forms.
- **Controls** share `control` height (density-aware) and radius `8`; consistent 8px label→field gap.
- **States:** default, hover, focus (accent ring), filled, disabled (0.4), error (red border + `dangerSoft` hint), success (subtle).
- **Validation:** inline on blur/submit, never only-on-submit for long forms; summarize errors at top of long forms.
- **Rules:** always visible labels (placeholders are examples, not labels); logical tab order; group with fieldsets + `overline` legends; primary submit right-aligned, secondary/cancel to its left.
- **AI-assist affordance:** fields that support AI generation show a small orb button inline.

---

## 27. Table Design (DataTable)

For diagnostics, monitoring, agents, files, logs.

- **Structure:** sticky header (`overline`-style labels), zebra-free rows separated by hairline `border.subtle`, sticky first column when scrolling wide.
- **Cells:** numerics right-aligned + tabular; text left; status as `Badge` + `*Soft`; mono for IDs/logs.
- **Density-aware row height** (32 compact / 44 comfortable).
- **Row states:** hover `bg.hover`, selected `bg.selected` + checkbox column, focus ring for keyboard.
- **Features:** sortable columns, resizable/reorderable columns, column show/hide, sticky toolbar (search/filter/bulk actions), pagination or virtualized infinite scroll for large sets.
- **Row actions:** trailing icon-button cluster on hover + overflow menu.
- Empty/loading/error handled via §30–33.

---

## 28. Cards

- **Base:** `bg.base`/`surface`, radius `16`, padding 16–24, elevation-1, hairline border only in light theme.
- **Anatomy:** optional header (title + meta + action), body, optional footer.
- **Variants:** `StatCard` (metric + delta + sparkline), `ModuleCard` (icon + title + live micro-metric + hover lift), `EntityCard` (avatar/icon + title + tags), `AICard` (orb marker + suggestion + accept/dismiss), `MediaCard` (thumbnail top).
- **Interaction:** interactive cards lift (translateY -2px + elevation +1) on hover, 140ms; entire card is the click target with a clear focus ring.
- Keep cards single-purpose; avoid nesting cards inside cards.

---

## 29. Charts

For Performance Monitoring & Diagnostics — calm, data-ink-maximizing, minimal.

- **Style:** thin lines (1.5–2px), soft area fills (accent → transparent), no 3D, no heavy gridlines (hairline horizontals only).
- **Categorical sequence:** blue → teal → violet → amber → green → red (accessible, ordered).
- **Realtime:** smooth left-scroll, `linear` easing, no per-point animation on high-frequency data.
- **Axes/labels:** `caption`, `text.tertiary`, tabular numerics.
- **Tooltip:** elevation-2 popover, crosshair guide, precise values + timestamp.
- **Types:** line/area (time series), bar (comparisons), sparkline (in StatCards), radial gauge (health %), heatmap (activity). Threshold bands use `*Soft` status tints.
- Always include title, unit, and a legend when >1 series; support reduced-motion (no animated draw-in).

---

## 30. Empty States

Empty states are onboarding moments, not dead ends.

- **Anatomy:** centered, calm illustration or a large ghosted Lucide glyph + AI orb, `h2` headline, `body` `text.secondary` description, one primary CTA, optional secondary link.
- **Voice:** action-oriented ("Ask Jarvis to draft your first note"), never blaming.
- **Contextual:** first-run vs. filtered-no-results vs. cleared-all get distinct copy; filtered-empty offers "clear filters".
- Jarvis often offers to populate the space (generate, import, suggest) — the AI-first payoff.

---

## 31. Loading States

- **Hierarchy of choice:** skeletons (structure known) > spinners (indeterminate small) > progress bars (determinate) > shimmer.
- **Buttons:** inline spinner + label swap, keep width stable, disable during action.
- **Page/route:** skeleton of the destination layout (§32), never a blank flash.
- **AI generation:** dedicated "thinking" state — shimmer row + pulsing orb, then stream (§18).
- **Latency etiquette:** <150ms show nothing; 150ms–1s spinner; >1s skeleton/progress with optional status text; >10s show progress + cancel.

---

## 32. Skeleton Loaders

- **Look:** `bg.subtle` blocks, radius matches real content, gentle shimmer sweep (2.4s `linear`, reduced-motion → static).
- **Fidelity:** mirror the real layout (avatar circle, text lines at 100%/80%/60% widths, card grids) so the transition is seamless.
- **Per pattern:** list rows, table rows, card grids, chat message, graph (dim placeholder nodes), file grid.
- Swap skeleton→content with a 140ms crossfade; never layout-shift on load.

---

## 33. Error States

- **Levels:** inline (field/component), section (a panel failed → retry within the panel), page (route failed → full-page state), global (toast for background failures).
- **Anatomy:** clear icon (`text` status danger), plain-language cause, and a recovery action (Retry / Go back / Contact). Never expose raw stack traces to users (log them; offer "copy details").
- **Empty-vs-error distinction** is always explicit.
- **AI/network errors** offer retry and a graceful fallback; partial AI results stay visible with an error chip.
- Tone: honest, brief, non-alarming. Destructive/permanent errors use red; transient use amber.

---

## 34. Accessibility Standards

Non-negotiable, baked into tokens.

- **Contrast:** WCAG 2.2 AA — ≥4.5:1 body text, ≥3:1 large text & UI/icon boundaries. Accent-on-surface pairs are pre-validated in tokens.
- **Focus:** always-visible focus ring (`shadow.focusRing`), logical order, full keyboard operability for every interactive pattern (palette, menus, tables, graph).
- **Motion:** honor `prefers-reduced-motion`; no essential info conveyed by motion alone.
- **Semantics:** proper roles/labels (`aria-*`), live regions for AI streaming and toasts, `aria-modal` + focus trap for overlays.
- **Targets:** ≥40px min in comfortable, ≥32px compact with adequate spacing; touch ≥44px.
- **Color independence:** status always pairs color with icon/text. **Voice/Chat** provide full text equivalents (captions/transcripts).
- **Zoom/scale:** layouts survive 200% zoom and OS font scaling.

---

## 35. Light Theme

- Not an afterthought — a calm, paper-like counterpart. Canvas graphite-50, surfaces white, text graphite-900/600/500.
- Elevation via **shadow strength** (surfaces stay white); hairline borders do more separating work than in dark.
- Accent anchors on blue-`600` for contrast; AI aura softens (blue-tinted, less cyan bloom).
- Glow effects are dialed down; grain/noise overlays are minimal.

---

## 36. Dark Theme

- The default and the "JARVIS" register. Canvas graphite-950, rising surfaces get lighter (950→700).
- Depth from surface color + soft black shadows + a 1px inner top highlight (Fluent light source).
- Accent anchors on blue-`500`; AI cyan glow is at full (still restrained) expression here.
- Optional whisper-quiet grain overlay on canvas to avoid flat banding — never a visible texture.

---

## 37. Theme Tokens

- **Two layers:** primitive (raw ramps) → semantic (roles). Products consume **semantic only**.
- **Switching:** semantic tokens are theme-scoped (`semantic.dark.*`, `semantic.light.*`) and resolve at the theme root (`data-theme` / `.dark`), so a single toggle re-skins everything with no per-component logic.
- **System option:** dark / light / system (follows OS).
- **Guarantee:** every UI value a component needs exists as a semantic token in both themes — no component should ever branch on theme in code.

---

## 38. Design Tokens

- **Source of truth:** [`design-tokens.json`](./design-tokens.json). Structure: `color`, `typography`, `spacing`, `radius`, `elevation`, `shadow`, `blur`, `opacity`, `border`, `motion`, `zIndex`, `breakpoints`, `grid`, `layout`, `size`, `iconography`.
- **Pipeline:** JSON → Style Dictionary → CSS custom properties + Tailwind theme extension. `{color.primitive.blue.500}` style references resolve at build.
- **Naming:** `category.role.variant.state` (e.g., `color.semantic.dark.accent.solidHover`).
- **Governance:** primitives change rarely and via review; semantic roles are the extension point; never introduce a raw hex in product code. Version the token file with semver; document changes in a CHANGELOG.

---

## 39. Component Naming Convention

- **Components:** `PascalCase`, tier-agnostic names (`Button`, `CommandPalette`, `VoiceOrb`, `DataTable`).
- **Props:** `variant` (primary/secondary/ghost/danger/ai), `size` (sm/md/lg), `tone`, `density` (compact/comfortable), `state` (loading/disabled/active).
- **Files:** `ComponentName/ComponentName.tsx`, `.stories.tsx`, `.test.tsx`, `index.ts`.
- **CSS classes (if used):** BEM-ish `jarvis-button`, `jarvis-button--primary`, `jarvis-button__icon`, or Tailwind + `cn()` variants (CVA).
- **Tokens in code:** CSS vars `--jarvis-color-accent-solid`; Tailwind `bg-accent-solid`.
- **Test IDs:** kebab-case, function-descriptive, unique — `data-testid="command-palette-input"`, `data-testid="voice-orb-toggle"`.
- **Booleans:** `is/has/can` prefix (`isLoading`, `hasError`). **Events:** `onXxx`.

---

## 40. Folder Structure for the Frontend Design System

```
frontend/src/design-system/
├── tokens/
│   ├── design-tokens.json        # single source of truth
│   ├── tokens.css                # generated CSS custom properties (dark/light)
│   └── tailwind.tokens.js        # generated Tailwind theme extension
├── foundations/                  # docs + helpers for primitives-of-primitives
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── motion.ts
│   └── elevation.ts
├── primitives/                   # atoms
│   ├── Button/
│   ├── IconButton/
│   ├── Input/
│   ├── Badge/
│   └── ...
├── composites/                   # molecules
│   ├── FormField/
│   ├── Card/
│   ├── Dropdown/
│   ├── Toast/
│   └── ...
├── patterns/                     # organisms
│   ├── Sidebar/
│   ├── TopBar/
│   ├── CommandPalette/
│   ├── ChatThread/
│   ├── VoiceOverlay/
│   ├── DataTable/
│   ├── GraphCanvas/
│   ├── FileExplorer/
│   └── ...
├── layouts/                      # app shells & page frames
│   ├── AppShell/
│   ├── ModuleFrame/              # PageHeader + secondary toolbar + content + right panel
│   └── SettingsLayout/
├── theme/
│   ├── ThemeProvider.tsx         # dark/light/system + density context
│   ├── useTheme.ts
│   └── useDensity.ts
├── hooks/                        # useMediaQuery, useReducedMotion, useHotkey (⌘K)…
├── icons/                        # Lucide re-exports + custom marks (logo, VoiceOrb)
├── utils/                        # cn(), cva variants, a11y helpers
└── index.ts                      # public API barrel
```

**Conventions**
- One folder per component with co-located story + test + index.
- Patterns import from composites; composites from primitives; nothing imports "upward".
- The only styling inputs are tokens (CSS vars / Tailwind theme) — no ad-hoc hex or px in components.

---

### How to use this system
1. Consume **semantic tokens only** from `design-tokens.json`.
2. Build within the **three-tier hierarchy** (§11) and the **module frame** (§20) so every one of the 100+ screens inherits the same skeleton.
3. Spend accent and motion **only on intelligence and primary actions** (§1, §9).
4. Ship **dark and light in parallel** and validate **AA + reduced-motion** on every component (§34).

*This specification is the foundation for every future Jarvis screen. Extend it through semantic tokens and new patterns — never by overriding primitives in product code.*
