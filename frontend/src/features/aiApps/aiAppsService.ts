/**
 * AI Apps data seam — the transport-agnostic contract the AI Apps UI depends
 * on.
 *
 *   AiAppsPage → AI Apps state/presentation → AiAppsService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Search/Knowledge/Intelligence seams
 * (Steps 4-10). "AI Apps" is this frontend's single, user-facing catalog
 * surface for two conceptually different things JARVIS Core owns:
 *
 *  - MCP-style tools the agent can call (e.g. Web Search, File Access) —
 *    Core milestone M10.5 (MCP & Integration Platform).
 *  - Third-party integration connectors (e.g. Gmail, Microsoft 365) — what
 *    the README's roadmap calls "Google Workspace, Microsoft 365, Email".
 *
 * Per the roadmap scope decision for this step, both are represented as
 * entries in ONE catalog (differentiated by `category`), reachable from the
 * single pre-existing `/apps` route — not a second "Integrations" nav
 * destination, and not a Settings → Connections page (Settings itself is a
 * later, separate roadmap item).
 *
 * Swapping the local mock for a real JARVIS Core adapter later is a matter
 * of implementing a new adapter and selecting it here — no UI changes
 * required. We do NOT invent Core endpoints; see
 * docs/CORE_AI_APPS_CONTRACT_REQUIRED.md.
 */

/**
 * What kind of catalog entry this is:
 *  - 'mcp-tool'  → a tool the agent itself can call while assisting you
 *                  (Web Search, File Access, Automations Tool, Code Sandbox).
 *  - 'connector' → a third-party account/service integration (Gmail, Google
 *                  Calendar, Microsoft 365).
 */
export type AiAppCategory = 'mcp-tool' | 'connector';

/**
 * Local/mock connection state only — never a real OAuth session.
 *  - 'connected'     → enabled in this frontend session's local mock state.
 *  - 'not_connected' → available, but not currently enabled.
 *  - 'unavailable'   → not offered for connection in this build yet (shown,
 *                      not hidden, so the catalog stays honest about scope).
 */
export type AiAppConnectionStatus = 'connected' | 'not_connected' | 'unavailable';

export interface AiApp {
  id: string;
  name: string;
  description: string;
  category: AiAppCategory;
  /** Human-readable source, e.g. "JARVIS Core", "Google", "Microsoft". */
  provider: string;
  /** Short bullet list of what this app can do / what access it would need. */
  capabilities: string[];
  connectionStatus: AiAppConnectionStatus;
  /** ISO timestamp — when the connection state last changed. */
  updatedAt: string;
}

/**
 * The contract every AI Apps backend adapter must satisfy. Deliberately
 * small: browse the catalog, view one entry, and flip its local connection
 * state. There is no install/uninstall or OAuth-flow method — this frontend
 * step does not build a plugin marketplace or a real OAuth integration.
 */
export interface AiAppsService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getApps(signal?: AbortSignal): Promise<AiApp[]>;
  getApp(id: string, signal?: AbortSignal): Promise<AiApp>;
  /** Purely local mock toggle — NOT a real OAuth flow. No redirect, no
   *  external URL, just a simulated connection-state mutation. */
  setConnected(id: string, connected: boolean, signal?: AbortSignal): Promise<AiApp>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreAiAppsContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core AI Apps / integration contract is not available yet.') {
    super(message);
    this.name = 'CoreAiAppsContractUnavailableError';
  }
}

import { mockAiAppsService } from './adapters/mockAiAppsAdapter';
import { coreAiAppsService } from './adapters/coreAiAppsAdapter';

/**
 * Which backend feeds AI Apps. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_AI_APPS_BACKEND=core` once
 * Claude Code has implemented + verified a Core AI Apps / integration
 * adapter.
 */
const AI_APPS_BACKEND = (import.meta.env.VITE_AI_APPS_BACKEND as string | undefined) ?? 'mock';

export function getAiAppsService(): AiAppsService {
  return AI_APPS_BACKEND === 'core' ? coreAiAppsService : mockAiAppsService;
}
