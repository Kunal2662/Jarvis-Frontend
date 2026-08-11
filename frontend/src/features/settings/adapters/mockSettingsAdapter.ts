import { DEFAULT_SETTINGS, type AppSettings, type SettingsService } from '../settingsService';

/**
 * Frontend `localStorage` mock adapter for Settings. Unlike most other
 * mock adapters in this checkpoint (which hold state only in memory for
 * the current tab), preferences genuinely persist across reloads here —
 * that is real, honest client-side behavior, not a simulation of a Core
 * capability. Nothing here is ever synced to another device or to JARVIS
 * Core.
 */

const STORAGE_KEY = 'jarvis.settings';

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 250): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

function read(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function write(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const mockSettingsService: SettingsService = {
  id: 'mock',
  label: 'Local device storage',
  ready: true,

  async getSettings(signal?: AbortSignal): Promise<AppSettings> {
    return withAbort(signal, read());
  },

  async updateSettings(patch: Partial<AppSettings>, signal?: AbortSignal): Promise<AppSettings> {
    const next = { ...read(), ...patch };
    write(next);
    return withAbort(signal, next);
  },

  async resetSettings(signal?: AbortSignal): Promise<AppSettings> {
    const next = { ...DEFAULT_SETTINGS };
    write(next);
    return withAbort(signal, next);
  },
};
