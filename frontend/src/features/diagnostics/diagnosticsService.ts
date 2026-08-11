/**
 * Diagnostics data seam (roadmap item 20) — the transport-agnostic contract
 * the Diagnostics UI depends on.
 *
 *   DiagnosticsPage → diagnostics state/presentation → DiagnosticsService → adapter → (mock | JARVIS Core)
 *
 * Per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s own row for Diagnostics
 * ("M13B/future observability | 🔴/future | Do not pretend future Core
 * exists") and `docs/JARVIS_CORE_MILESTONES.md` (M13B — Self-Healing &
 * Observability — 🔴 Not Started / Future capability), this is different
 * from every prior Step 13-19 seam: those features' underlying Core
 * milestones already existed in some form (partial/active/verify). M13B does
 * not exist at all yet. So this seam deliberately does NOT fabricate Core
 * health data the way, say, mockAgentAdapter fabricates plausible agent
 * roles — `getSystemStatus` instead introspects this frontend's OWN,
 * already-real adapter registry (every other feature's `id`/`label`/`ready`,
 * the same real fields `features/settings/sections/AboutSection.tsx` already
 * reads), and `getCoreHealth` honestly reports that Core-side health/
 * self-healing telemetry is not available rather than inventing CPU/memory/
 * uptime numbers. We do NOT invent a Core Diagnostics endpoint; see
 * docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md.
 *
 * Frontend-only performance metrics (page load, memory, resource counts) are
 * deliberately NOT part of this adapter-swappable seam — they come straight
 * from this browser tab's own `performance` global (see
 * `performanceMetrics.ts`), which has no "mock vs. Core" distinction, the
 * same way `AboutSection` reads `pkg.version` directly rather than through a
 * service.
 */

/** One row of the "system status" list — a real snapshot of another
 *  feature's own service seam, never fabricated data. */
export interface SystemComponentStatus {
  /** Stable key for this row, e.g. 'chat'. */
  key: string;
  /** Human-readable surface name, e.g. 'Chat / Voice orchestrator'. */
  name: string;
  /**
   * Which backend that feature's own service seam currently selects.
   * Usually `'mock' | 'core'`, but a few seams use their own id vocabulary
   * (e.g. Chat's `'dev' | 'core'`, Voice's `'local' | 'core'`) — kept as a
   * plain string here rather than narrowing to a union every other seam
   * would need to match.
   */
  backendId: string;
  backendLabel: string;
  /** Whether that feature's currently selected backend is functional. */
  ready: boolean;
}

/** Core-reported system health (CPU/memory/uptime/self-healing events) —
 *  always `available: false` until JARVIS Core ships M13B. Never fabricated. */
export interface CoreHealthSnapshot {
  available: boolean;
  /** The Core milestone this capability depends on. */
  milestone: string;
  message: string;
}

/**
 * The contract every Diagnostics backend adapter must satisfy.
 */
export interface DiagnosticsService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getSystemStatus(signal?: AbortSignal): Promise<SystemComponentStatus[]>;
  getCoreHealth(signal?: AbortSignal): Promise<CoreHealthSnapshot>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreDiagnosticsContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core diagnostics contract is not available yet.') {
    super(message);
    this.name = 'CoreDiagnosticsContractUnavailableError';
  }
}

import { mockDiagnosticsService } from './adapters/mockDiagnosticsAdapter';
import { coreDiagnosticsService } from './adapters/coreDiagnosticsAdapter';

/**
 * Which backend feeds Diagnostics. Defaults to the frontend mock (which is
 * itself honest introspection of real local adapters — see module doc). Set
 * `VITE_DIAGNOSTICS_BACKEND=core` once Claude Code has implemented + verified
 * a Core diagnostics adapter (JARVIS Core M13B).
 */
const DIAGNOSTICS_BACKEND = (import.meta.env.VITE_DIAGNOSTICS_BACKEND as string | undefined) ?? 'mock';

export function getDiagnosticsService(): DiagnosticsService {
  return DIAGNOSTICS_BACKEND === 'core' ? coreDiagnosticsService : mockDiagnosticsService;
}
