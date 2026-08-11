import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  Component,
  FolderOpen,
  House,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  SquareCheck,
  StickyNote,
  Workflow,
} from 'lucide-react';

/**
 * Where a surface is reachable from.
 * - 'topbar'    → the lean PRIMARY nav strip (current / live surfaces only)
 * - 'secondary' → surfaces reached via ⌘K instead of the primary strip. Can be
 *                 either 'planned' (future, clearly marked "Soon") or 'live'
 *                 (a real page — e.g. Knowledge/Intelligence, Step 10) once
 *                 built; see the `liveSecondaryModules`/`comingSoonModules`
 *                 selectors below for how the two are told apart downstream.
 * - 'settings'  → top-bar right cluster (gear)
 * - 'developer' → Developer Mode only
 *
 * 'contextual' is reserved for a future context-sensitive surface placement
 * (e.g. surfaced inline next to relevant content rather than in a fixed nav
 * location). No selector, layout, or component currently reads this value —
 * it is an unused placeholder in the type union today, not a wired surface.
 */
export type Surface = 'topbar' | 'secondary' | 'settings' | 'developer' | 'contextual';

/** Who is allowed to see it. 'developer' requires Developer Mode enabled. */
export type Audience = 'everyone' | 'advanced' | 'developer';

/**
 * Honest Core-capability status for this surface (see docs/JARVIS_CORE_FRONTEND_MAPPING.md).
 * - 'live'    → real, working frontend surface today
 * - 'planned' → placeholder UI; Core contract not yet integrated. MUST be shown
 *               as unfinished (never presented as production-ready).
 */
export type CapabilityStatus = 'live' | 'planned';

export interface ModuleDef {
  path: string;
  /** The USER-FACING name — never a system name. */
  label: string;
  icon: LucideIcon;
  surface: Surface;
  audience: Audience;
  /** Honest capability status — drives "Soon"/unavailable markers in the UI. */
  status: CapabilityStatus;
  /** Owning JARVIS Core milestone, for alignment/terminology (metadata only). */
  core?: string;
  /** Whether a real built page exists (vs. the shared placeholder). */
  ready?: boolean;
  badge?: string;
  /** Overlay/action instead of navigation. */
  action?: 'voice';
  /** Old v1 paths that should redirect here. */
  redirectFrom?: string[];
}

/**
 * Single source of truth for navigation. A FLAT registry — no groups.
 * `surface` + `audience` + `status` encode placement and Core-alignment;
 * derived selectors (below) drive the top bar, command palette and settings.
 *
 * PRIMARY nav (surface 'topbar') is deliberately lean: only surfaces that are
 * actually live today (M10 Chat/Voice + Home). Everything the Core has not yet
 * wired to the frontend stays 'secondary' + 'planned' so the UI never implies a
 * capability is production-ready. Every renamed/demoted v1 route lists itself in
 * a `redirectFrom` so nothing 404s.
 */
export const modules: ModuleDef[] = [
  // ── PRIMARY top bar — current / live surfaces only ──
  { path: '/', label: 'Home', icon: LayoutDashboard, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M8', ready: true },
  { path: '/chat', label: 'Chat', icon: MessageSquare, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M10', ready: true, badge: 'live' },
  { path: '/voice', label: 'Voice', icon: Mic, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M10', ready: true, action: 'voice' },
  { path: '/automations', label: 'Automations', icon: Workflow, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M7', ready: true, redirectFrom: ['/automation', '/browser'] },

  // ── SECONDARY — live surfaces (⌘K "Go to", not the primary strip) ──
  { path: '/knowledge', label: 'Knowledge', icon: BookOpen, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M10A', ready: true },
  { path: '/intelligence', label: 'Intelligence', icon: Lightbulb, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M10B', ready: true },
  { path: '/apps', label: 'AI Apps', icon: Sparkles, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M10.5', ready: true, redirectFrom: ['/plugins'] },
  { path: '/notes', label: 'Notes', icon: StickyNote, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M11', ready: true },
  { path: '/tasks', label: 'Tasks', icon: SquareCheck, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M11', ready: true, redirectFrom: ['/projects'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M11', ready: true },
  { path: '/files', label: 'Files', icon: FolderOpen, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M11', ready: true },
  { path: '/smart-home', label: 'Smart Home', icon: House, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M12', ready: true },
  { path: '/memory', label: 'Memory', icon: Brain, surface: 'secondary', audience: 'everyone', status: 'live', ready: true },
  { path: '/agents', label: 'Agents', icon: Bot, surface: 'secondary', audience: 'everyone', status: 'live', core: 'M10', ready: true },
  { path: '/diagnostics', label: 'Diagnostics', icon: Activity, surface: 'secondary', audience: 'everyone', status: 'live', ready: true, redirectFrom: ['/performance'] },

  // (Device Management and Home Assistant + MQTT, roadmap items 14-15,
  // stayed sub-routes reached from within Smart Home's own entry points
  // rather than separate module entries here — see SmartHomePage.tsx's
  // header actions. No remaining 'secondary' + 'planned' placeholder
  // surfaces as of Step 16 — every secondary module above is live. Memory
  // has no confirmed Core milestone number yet (`core` intentionally
  // omitted — see docs/CORE_MEMORY_CONTRACT_REQUIRED.md), unlike every
  // other entry here which cites one. Agents (Step 17) reuses Chat/Voice's
  // M10 — see docs/CORE_AGENTS_CONTRACT_REQUIRED.md: it exposes the same
  // AgentOrchestrator, never a second one. The old v1 `/agents → /chat`
  // redirect was removed now that `/agents` has its own real page.
  // Diagnostics (Step 20) also omits `core` — it maps to M13B (Self-Healing
  // & Observability), which JARVIS_CORE_MILESTONES.md marks 🔴 Not
  // Started/future, so no in-progress Core milestone applies yet; see
  // docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md. It absorbs the old
  // `/performance` redirect too — Diagnostics + Performance is one combined
  // roadmap item (20) and one page.)

  // ── Settings (right cluster, not the main strip) ──
  // Step 19: a real page now exists — configures existing systems only
  // (Appearance/ThemeProvider, Voice/AgentService/etc.), never a second
  // copy of them. See docs/CORE_SETTINGS_CONTRACT_REQUIRED.md. The old
  // `/diagnostics` and `/performance` redirects moved to the new
  // Diagnostics module (Step 20) now that it has its own real page.
  { path: '/settings', label: 'Settings', icon: Settings, surface: 'settings', audience: 'everyone', status: 'live', core: 'System', ready: true, redirectFrom: ['/google', '/microsoft'] },

  // ── Developer Mode (hidden by default) ──
  { path: '/design', label: 'Design System', icon: Component, surface: 'developer', audience: 'developer', status: 'live', ready: true },
];

// ── Derived selectors (never hand-written) ──
/** The lean primary top-bar strip. */
export const topBarModules = modules.filter((m) => m.surface === 'topbar');
/** All non-primary surfaces reachable via ⌘K — both live and planned. */
export const secondaryModules = modules.filter((m) => m.surface === 'secondary');
/** Secondary surfaces that are real, built pages (e.g. Knowledge, Intelligence)
 *  — surfaced in the command palette's "Go to" group, not "Coming soon". */
export const liveSecondaryModules = secondaryModules.filter((m) => m.status === 'live');
/** Secondary surfaces still pending Core integration — the "Coming soon" group. */
export const comingSoonModules = secondaryModules.filter((m) => m.status === 'planned');
export const settingsModules = modules.filter((m) => m.surface === 'settings');
export const developerModules = modules.filter((m) => m.surface === 'developer');

/** Everything the command palette can reach, gated on Developer Mode. */
export const commandModules = (devMode: boolean) =>
  modules.filter((m) => devMode || m.audience !== 'developer');

export const aiIcon = Bot;

export function moduleByPath(path: string): ModuleDef | undefined {
  return modules.find((m) => m.path === path);
}
