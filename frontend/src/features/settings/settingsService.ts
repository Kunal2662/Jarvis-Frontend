/**
 * Settings data seam — the transport-agnostic contract the Settings UI
 * depends on.
 *
 *   SettingsPage → settings state/presentation → SettingsService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Memory/Agents seams (Steps 16-17). This is the ONLY
 * preference genuinely owned by this seam — everything else the Settings
 * page shows (appearance, voice, notifications history, connections, AI
 * Apps, Smart Home, Memory, Agents, Automations) reads an *existing*
 * feature's own service directly rather than duplicating it here (see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md's "Scope of this frontend
 * surface"). Appearance in particular is deliberately NOT modeled here —
 * it stays owned by `design-system/theme/ThemeProvider.tsx`, the existing,
 * already-shipped theme engine.
 *
 * No verified Core settings/preferences contract exists anywhere in this
 * checkpoint (confirmed via an explicit repository search before
 * implementation) — none was invented; see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md.
 */

/**
 * The full set of preferences this seam owns. Kept intentionally small —
 * only settings with a genuine, verifiable effect on the running app
 * belong here (see the module doc). Grows one honest field at a time.
 */
export interface AppSettings {
  /** Gates AppLayout's NotificationCenter bell + unread badge. */
  notificationsEnabled: boolean;
}

/** The documented, restorable defaults — what `resetSettings()` returns to. */
export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
};

/**
 * The contract every Settings backend adapter must satisfy. Deliberately
 * small — read, partial update, reset. Components never mutate settings
 * directly; they always go through this seam (see SettingsProvider.tsx).
 */
export interface SettingsService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getSettings(signal?: AbortSignal): Promise<AppSettings>;
  updateSettings(patch: Partial<AppSettings>, signal?: AbortSignal): Promise<AppSettings>;
  /** Restores `DEFAULT_SETTINGS`. Never touches Memory, Files, Tasks,
   *  Automations, Smart Home devices, or Agent history — those are each
   *  owned by their own service and are not settings. */
  resetSettings(signal?: AbortSignal): Promise<AppSettings>;
}

/** Thrown when a not-yet-implemented Core adapter is invoked. */
export class CoreSettingsContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core settings contract is not available yet.') {
    super(message);
    this.name = 'CoreSettingsContractUnavailableError';
  }
}

import { mockSettingsService } from './adapters/mockSettingsAdapter';
import { coreSettingsService } from './adapters/coreSettingsAdapter';

/**
 * Which backend feeds Settings. Defaults to the frontend `localStorage`
 * mock (no Core API is required for this step). Set
 * `VITE_SETTINGS_BACKEND=core` once Claude Code has implemented + verified
 * a real Core settings adapter.
 */
const SETTINGS_BACKEND = (import.meta.env.VITE_SETTINGS_BACKEND as string | undefined) ?? 'mock';

export function getSettingsService(): SettingsService {
  return SETTINGS_BACKEND === 'core' ? coreSettingsService : mockSettingsService;
}
