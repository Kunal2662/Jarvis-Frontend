# Changelog

All notable changes to Project JARVIS are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com); versioning is [SemVer](https://semver.org).

## [0.2.0] — 2026-06-05 — Phase 2: UI Foundation & Liquid Glass

### Added — Tooling
- Migrated frontend to **Vite 6 + React 18 + TypeScript 5.6** (from CRA).
- Tailwind CSS 3.4 wired entirely to semantic CSS variables (no hardcoded colors).
- ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh).
- Scripts: `start`, `dev`, `build`, `typecheck`, `lint`, `preview`. Dev server bound to `0.0.0.0:3000`.

### Added — Design Tokens & Theme Engine
- `src/styles/tokens.css` — full semantic token set (surfaces, text, borders, accent, status, AI presence, elevation, glass, radius, layout, density) generated from `design-tokens.json`.
- `ThemeProvider` with **dark / light / system**, **comfortable / compact** density, **normal / high** contrast, and **auto / on / off** Liquid Glass, all persisted to `localStorage` and exposed via `useTheme()`.
- Adaptive glass capability detection (backdrop-filter support + device memory/cores + reduced-motion) — real blur on capable devices, solid-surface fallback otherwise.

### Added — Liquid Glass Foundation
- `.glass` component layer (frosted substrate, luminous top edge, reflection sheen, depth tiers `thin/default/thick`) that degrades to opaque surfaces when glass is off.
- `Glass` primitive + `useReducedMotion`, `useMediaQuery`, `useHotkey` hooks.

### Added — Core UI Library
- **Buttons:** Button, IconButton, SplitButton.
- **Inputs:** Input, Password, Search, TextArea, Select, Combobox.
- **Selection:** Checkbox, Radio, Switch/Toggle.
- **Feedback:** Badge, Toast (provider + `useToast`), Progress, Spinner, Skeleton.
- **Display:** Avatar, Card, StatCard, EmptyState, Divider, Kbd, Label, FormField.
- **Navigation:** Tabs (line + segmented), Breadcrumb, Pagination.
- **Overlays:** Modal, Drawer, Tooltip, Popover, Dropdown.
- **Data (readability-first, no glass):** Table, DataGrid (sortable), List, TreeView.

### Added — Window Shell
- Sidebar (collapsible rail + tooltips), TopBar (search trigger), StatusBar, CommandPalette (⌘K, cmdk + Ask-Jarvis branch), SearchOverlay, NotificationCenter, WorkspaceContainer + PageHeader, Dock, WindowFrame, QuickSettings, VoiceOrb (idle/listening/thinking/speaking), AppShell layout.

### Added — Motion & Accessibility
- Framer Motion spring/smooth variants; global `prefers-reduced-motion` reset.
- WCAG AA tokens, always-visible focus rings, keyboard operability, Radix-backed a11y for overlays.

### Added — Validation
- Internal **Design System Showcase** route (`/`) rendering every component and state.
- ✅ `lint`, ✅ `typecheck`, ✅ `build` all pass with zero errors.

### Notes
- No feature pages built in this phase (Dashboard, Chat, Voice, Projects, Notes, Calendar, AI Workspace intentionally deferred).
