import {
  CoreAutomationContractUnavailableError,
  type Automation,
  type AutomationExecution,
  type AutomationInput,
  type AutomationService,
  type PauseResumeAction,
} from '../automationService';

/**
 * JARVIS Core automation adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core automation contract (list/create/update/delete/enable/
 * pause/resume + execution history, owned by JARVIS Core) is not yet available.
 * Per project rules we do NOT invent an endpoint. This adapter is the plug
 * point: once the Core automation contract is verified, implement each method
 * here (map Core → Automation types), set `ready: true`, and select it via
 * `VITE_AUTOMATIONS_BACKEND=core`. No AutomationsPage/UI change is needed.
 *
 * See docs/CORE_AUTOMATIONS_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreAutomationContractUnavailableError().message);
  }
  throw new CoreAutomationContractUnavailableError();
}

export const coreAutomationService: AutomationService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getAutomations(): Promise<Automation[]> {
    return unavailable();
  },
  async getAutomation(): Promise<Automation> {
    return unavailable();
  },
  async createAutomation(_input: AutomationInput): Promise<Automation> {
    return unavailable();
  },
  async updateAutomation(_id: string, _input: AutomationInput): Promise<Automation> {
    return unavailable();
  },
  async deleteAutomation(): Promise<void> {
    return unavailable();
  },
  async setEnabled(): Promise<Automation> {
    return unavailable();
  },
  async pauseResume(_id: string, _action: PauseResumeAction): Promise<Automation> {
    return unavailable();
  },
  async getExecutionHistory(): Promise<AutomationExecution[]> {
    return unavailable();
  },
};
