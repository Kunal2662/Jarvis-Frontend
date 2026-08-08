import {
  Bot,
  Calendar,
  Component,
  FolderOpen,
  LayoutDashboard,
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
 * - 'secondary' → future / placeholder surfaces (reachable via ⌘K, clearly marked)
 * - 'settings'  → top-bar right cluster (gear)
 * - 'developer' → Developer Mode only
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
  { path: '/chat', label: 'Chat', icon: MessageSquare, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M10', ready: true, badge: 'live', redirectFrom: ['/agents'] },
  { path: '/voice', label: 'Voice', icon: Mic, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M10', ready: true, action: 'voice' },
  { path: '/automations', label: 'Automations', icon: Workflow, surface: 'topbar', audience: 'everyone', status: 'live', core: 'M7', ready: true, redirectFrom: ['/automation', '/browser'] },

  // ── SECONDARY — future / placeholder surfaces (⌘K, clearly marked "Soon") ──
  { path: '/notes', label: 'Notes', icon: StickyNote, surface: 'secondary', audience: 'everyone', status: 'planned', core: 'M11' },
  { path: '/tasks', label: 'Tasks', icon: SquareCheck, surface: 'secondary', audience: 'everyone', status: 'planned', core: 'M11', redirectFrom: ['/projects'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, surface: 'secondary', audience: 'everyone', status: 'planned', core: 'M11' },
  { path: '/files', label: 'Files', icon: FolderOpen, surface: 'secondary', audience: 'everyone', status: 'planned', core: 'M11' },
  { path: '/apps', label: 'AI Apps', icon: Sparkles, surface: 'secondary', audience: 'everyone', status: 'planned', core: 'M10.5', redirectFrom: ['/plugins'] },

  // ── Settings (right cluster, not the main strip) ──
  { path: '/settings', label: 'Settings', icon: Settings, surface: 'settings', audience: 'everyone', status: 'planned', core: 'System', redirectFrom: ['/memory', '/knowledge', '/google', '/microsoft', '/diagnostics', '/performance'] },

  // ── Developer Mode (hidden by default) ──
  { path: '/design', label: 'Design System', icon: Component, surface: 'developer', audience: 'developer', status: 'live', ready: true },
];

// ── Derived selectors (never hand-written) ──
/** The lean primary top-bar strip. */
export const topBarModules = modules.filter((m) => m.surface === 'topbar');
/** Future/placeholder surfaces — palette + clearly-marked secondary area. */
export const secondaryModules = modules.filter((m) => m.surface === 'secondary');
export const settingsModules = modules.filter((m) => m.surface === 'settings');
export const developerModules = modules.filter((m) => m.surface === 'developer');

/** Everything the command palette can reach, gated on Developer Mode. */
export const commandModules = (devMode: boolean) =>
  modules.filter((m) => devMode || m.audience !== 'developer');

export const aiIcon = Bot;

export function moduleByPath(path: string): ModuleDef | undefined {
  return modules.find((m) => m.path === path);
}
