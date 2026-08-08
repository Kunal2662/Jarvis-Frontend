/**
 * Automations data seam — the transport-agnostic contract the Automations UI
 * depends on.
 *
 *   AutomationsPage → automation state/presentation → AutomationService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home seams (Steps 4–5, 8). The UI never talks to a
 * backend directly — it only knows this interface. Swapping the in-memory mock
 * for a real JARVIS Core automation API later is a matter of implementing a new
 * adapter and selecting it here — no UI changes required. We do NOT invent Core
 * endpoints; see docs/CORE_AUTOMATIONS_CONTRACT_REQUIRED.md.
 */

export type AutomationStatus = 'active' | 'paused' | 'failed' | 'disabled';

export type AutomationTriggerType = 'schedule' | 'event';

export interface AutomationTrigger {
  type: AutomationTriggerType;
  /** Human-readable summary, e.g. "Every day at 7:00 AM" or "On new email". */
  summary: string;
  /** Cron-like expression for schedule triggers (display-only in this phase). */
  schedule?: string;
  /** Event name for event triggers (display-only in this phase). */
  event?: string;
}

export interface AutomationCondition {
  id: string;
  /** Human-readable condition, e.g. "Only on weekdays". */
  summary: string;
}

export type AutomationActionType = 'notify' | 'run-agent' | 'device' | 'integration';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  /** Human-readable action, e.g. "Send a morning brief notification". */
  summary: string;
}

export type ExecutionStatus = 'success' | 'failed' | 'running';

export interface AutomationExecution {
  id: string;
  timestamp: string;
  status: ExecutionStatus;
  durationMs: number;
  /** Result summary on success, or error message on failure. */
  result?: string;
  error?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  nextRun?: string;
  lastRun?: string;
  lastResult?: 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
  executionHistory: AutomationExecution[];
}

/** Fields the create/edit form collects. */
export interface AutomationInput {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export type PauseResumeAction = 'pause' | 'resume';

/**
 * The contract every automation backend adapter must satisfy.
 */
export interface AutomationService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getAutomations(signal?: AbortSignal): Promise<Automation[]>;
  getAutomation(id: string, signal?: AbortSignal): Promise<Automation>;
  createAutomation(input: AutomationInput, signal?: AbortSignal): Promise<Automation>;
  updateAutomation(id: string, input: AutomationInput, signal?: AbortSignal): Promise<Automation>;
  deleteAutomation(id: string, signal?: AbortSignal): Promise<void>;
  setEnabled(id: string, enabled: boolean, signal?: AbortSignal): Promise<Automation>;
  pauseResume(id: string, action: PauseResumeAction, signal?: AbortSignal): Promise<Automation>;
  getExecutionHistory(id: string, signal?: AbortSignal): Promise<AutomationExecution[]>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreAutomationContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core automation contract is not available yet.') {
    super(message);
    this.name = 'CoreAutomationContractUnavailableError';
  }
}

import { mockAutomationService } from './adapters/mockAutomationAdapter';
import { coreAutomationService } from './adapters/coreAutomationAdapter';

/**
 * Which backend feeds Automations. Defaults to the frontend in-memory mock
 * (Core APIs are not required for this step). Set `VITE_AUTOMATIONS_BACKEND=core`
 * once Claude Code has implemented + verified a Core automations adapter.
 */
const AUTOMATIONS_BACKEND =
  (import.meta.env.VITE_AUTOMATIONS_BACKEND as string | undefined) ?? 'mock';

export function getAutomationService(): AutomationService {
  return AUTOMATIONS_BACKEND === 'core' ? coreAutomationService : mockAutomationService;
}
