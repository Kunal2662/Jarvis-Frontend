# JARVIS Frontend — Design System (Phase 2)

Production foundation for every JARVIS screen: design tokens, theme engine, core UI library, window shell, and the Liquid Glass foundation.

> ### ⚠️ Architecture change — 2026-08-06
> JARVIS now follows a **single workspace architecture**: Top Bar → Adaptive Workspace → Status Bar.
> **No sidebars, no drawers, no dock, no hidden nav panels.** Widgets expand in place. All technical
> concepts live behind Developer Mode.
>
> **Read [`../docs/architecture/`](../docs/architecture/) before writing UI code.** The shell
> described below (`patterns/` window shell, sidebar composition) is the **v1 layout** and is being
> replaced in Phase 7 — the *components* are preserved, the *composition* changes.

> Authority on **visual language** (tokens, color, type, motion): [`../docs/jarvis-design-system/`](../docs/jarvis-design-system/).
> Authority on **layout, navigation and information architecture**: [`../docs/architecture/`](../docs/architecture/).
> This package **implements** both — it does not redefine them.

## Stack
- **Vite 6** + **React 18** + **TypeScript 5.6**
- **Tailwind CSS 3.4** mapped to semantic CSS variables (`src/styles/tokens.css`)
- **Radix UI** (accessible overlay/control primitives), **cmdk** (command palette)
- **Framer Motion** (spring/ambient motion), **lucide-react** (icons)

## Scripts
```bash
yarn start       # dev server on 0.0.0.0:3000 (supervised)
yarn build       # tsc -b && vite build
yarn typecheck   # tsc --noEmit (app + node configs)
yarn lint        # eslint (flat config)
```

## Architecture
```
src/
├── styles/tokens.css            # semantic CSS variables: dark / light / high-contrast / density
├── index.css                    # Tailwind layers + Liquid Glass foundation + reduced-motion
└── design-system/
    ├── lib/cn.ts                # class merge helper
    ├── foundations/motion.ts    # shared Framer Motion variants
    ├── theme/ThemeProvider.tsx  # theme / density / contrast / glass + useTheme()
    ├── hooks/                   # useMediaQuery, useReducedMotion, useHotkey
    ├── primitives/              # atoms (Button, Input, Glass, Badge, …)
    ├── composites/              # molecules (Card, FormField, Tabs, Toast, …)
    ├── data/                    # readability-first Table / DataGrid / List / TreeView
    ├── patterns/                # window shell organisms (Sidebar, TopBar, CommandPalette, …)
    ├── layouts/                 # AppShell
    └── index.ts                 # public API barrel
```

## Consuming the system
```tsx
import { ThemeProvider, ToastProvider, TooltipProvider } from '@/design-system';
// wrap the app once (see src/main.tsx), then import any component from '@/design-system'.
```

### Rules
- **Semantic tokens only** — never hardcode a hex/px in a component. Use Tailwind classes that resolve to CSS variables (`bg-surface-base`, `text-content`, `border-line`, `bg-accent`, …).
- **Glass** is opt-in via `.glass` / `<Glass>` and only on floating/overlay surfaces. Data-dense reading surfaces stay solid.
- **Accent (blue) and the cyan AI aura** are signals — spend them on primary actions and AI presence only.
- New building blocks extend the system through tokens and new patterns, never by overriding primitives.

## Showcase
`src/showcase/` + `src/App.tsx` render an internal **Design System Showcase** (the app's `/` route) exercising every component and state. It is a validation surface, not a product feature page.
