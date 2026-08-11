import { CoreAgentContractUnavailableError, type AgentService } from '../agentService';

/**
 * Core adapter stub for Agents. Intentionally unimplemented — `ready:
 * false`. No Core Agents endpoint has been invented; see
 * docs/CORE_AGENTS_CONTRACT_REQUIRED.md. Every method rejects with
 * `CoreAgentContractUnavailableError` rather than silently returning fake
 * data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreAgentContractUnavailableError());
}

export const coreAgentService: AgentService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  getAgents: unavailable,
  getAgent: unavailable,
  getRuns: unavailable,
  setEnabled: unavailable,
};
