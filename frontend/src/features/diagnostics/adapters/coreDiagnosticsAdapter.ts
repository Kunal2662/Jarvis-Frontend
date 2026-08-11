import { CoreDiagnosticsContractUnavailableError, type DiagnosticsService } from '../diagnosticsService';

/**
 * Core adapter stub for Diagnostics. Intentionally unimplemented — `ready:
 * false`. No Core Diagnostics/self-healing endpoint has been invented; see
 * docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md. Every method rejects with
 * `CoreDiagnosticsContractUnavailableError` rather than silently returning
 * fake data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreDiagnosticsContractUnavailableError());
}

export const coreDiagnosticsService: DiagnosticsService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  getSystemStatus: unavailable,
  getCoreHealth: unavailable,
};
