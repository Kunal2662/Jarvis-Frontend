/**
 * Agents data seam — the transport-agnostic contract the Agents UI depends
 * on.
 *
 *   AgentsPage → agent state/presentation → AgentService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Automations/Memory seams (Steps 8, 16). Per
 * docs/JARVIS_CORE_FRONTEND_MAPPING.md's own note for Agents ("Expose
 * existing orchestration; no second agent framework") and
 * docs/CORE_AGENTS_CONTRACT_REQUIRED.md, this is an observability +
 * lightweight state-management surface over the SAME AgentOrchestrator
 * that already powers Chat/Voice (Steps 4-5) — never a second orchestrator,
 * never an execution/planning engine. There is intentionally no
 * create/run/execute method on this interface: "running an agent" is
 * already modeled as a Core-owned consequence an Automation can trigger
 * (see `AutomationActionType`'s `'run-agent'`), not something this surface
 * hands the user a button to fire directly. Swapping the in-memory mock for
 * a real JARVIS Core Agents API later is a matter of implementing a new
 * adapter and selecting it here — no UI changes required. We do NOT invent
 * a Core Agents endpoint; see docs/CORE_AGENTS_CONTRACT_REQUIRED.md.
 */

export type AgentStatus = 'active' | 'idle' | 'disabled';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  /** Short bullet list of what this agent role does — mirrors AiApp.capabilities. */
  capabilities: string[];
  /** ISO timestamp of this agent's most recent activity, if any. */
  lastRunAt?: string;
}

export type AgentRunStatus = 'completed' | 'failed';

/** A single past activity entry — always already-resolved history, never a
 *  live run this UI itself initiated (see module doc). */
export interface AgentRun {
  id: string;
  agentId: string;
  status: AgentRunStatus;
  startedAt: string;
  completedAt: string;
  /** Human-readable summary, e.g. "Completed a market brief." */
  summary: string;
}

/**
 * The contract every Agents backend adapter must satisfy. Deliberately no
 * create/run/execute method — see module doc.
 */
export interface AgentService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getAgents(signal?: AbortSignal): Promise<Agent[]>;
  getAgent(id: string, signal?: AbortSignal): Promise<Agent>;
  /** Newest first. */
  getRuns(agentId: string, signal?: AbortSignal): Promise<AgentRun[]>;
  /** A local state toggle in the mock — never a real Core call. */
  setEnabled(id: string, enabled: boolean, signal?: AbortSignal): Promise<Agent>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreAgentContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core agents contract is not available yet.') {
    super(message);
    this.name = 'CoreAgentContractUnavailableError';
  }
}

import { mockAgentService } from './adapters/mockAgentAdapter';
import { coreAgentService } from './adapters/coreAgentAdapter';

/**
 * Which backend feeds Agents. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_AGENTS_BACKEND=core` once
 * Claude Code has implemented + verified a Core agents adapter.
 */
const AGENTS_BACKEND = (import.meta.env.VITE_AGENTS_BACKEND as string | undefined) ?? 'mock';

export function getAgentService(): AgentService {
  return AGENTS_BACKEND === 'core' ? coreAgentService : mockAgentService;
}
