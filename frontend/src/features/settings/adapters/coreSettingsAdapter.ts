import { CoreSettingsContractUnavailableError, type SettingsService } from '../settingsService';

/**
 * Core adapter stub for Settings. Intentionally unimplemented — `ready:
 * false`. No Core Settings endpoint has been invented; see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md. Every method rejects with
 * `CoreSettingsContractUnavailableError` rather than silently returning
 * fake data.
 */
function unavailable(): Promise<never> {
  return Promise.reject(new CoreSettingsContractUnavailableError());
}

export const coreSettingsService: SettingsService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,
  getSettings: unavailable,
  updateSettings: unavailable,
  resetSettings: unavailable,
};
