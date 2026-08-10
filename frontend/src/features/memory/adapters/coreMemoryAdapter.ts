import { CoreMemoryContractUnavailableError, type MemoryService } from '../memoryService';

/**
 * Core adapter stub for Memory. Intentionally unimplemented — `ready:
 * false`. No Core Memory endpoint has been invented; see
 * docs/CORE_MEMORY_CONTRACT_REQUIRED.md. Every method rejects with
 * `CoreMemoryContractUnavailableError` rather than silently returning fake
 * data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreMemoryContractUnavailableError());
}

export const coreMemoryService: MemoryService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  getMemories: unavailable,
  getMemory: unavailable,
  forgetMemory: unavailable,
};
