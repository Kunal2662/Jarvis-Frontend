import { beforeEach, describe, expect, it } from 'vitest';

describe('settings service seam', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to the mock adapter', async () => {
    const { getSettingsService } = await import('../settingsService');
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    expect(getSettingsService()).toBe(mockSettingsService);
    expect(mockSettingsService.id).toBe('mock');
    expect(mockSettingsService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreSettingsService } = await import('../adapters/coreSettingsAdapter');
    expect(coreSettingsService.id).toBe('core');
    expect(coreSettingsService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreSettingsService } = await import('../adapters/coreSettingsAdapter');
    const { CoreSettingsContractUnavailableError } = await import('../settingsService');
    await expect(coreSettingsService.getSettings()).rejects.toBeInstanceOf(CoreSettingsContractUnavailableError);
    await expect(coreSettingsService.updateSettings({})).rejects.toBeInstanceOf(CoreSettingsContractUnavailableError);
    await expect(coreSettingsService.resetSettings()).rejects.toBeInstanceOf(CoreSettingsContractUnavailableError);
  });

  it('getSettings returns the documented defaults when nothing is persisted yet', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const { DEFAULT_SETTINGS } = await import('../settingsService');
    expect(await mockSettingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('updateSettings persists a partial patch and getSettings reflects it afterward', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const updated = await mockSettingsService.updateSettings({ notificationsEnabled: false });
    expect(updated.notificationsEnabled).toBe(false);

    const fetched = await mockSettingsService.getSettings();
    expect(fetched.notificationsEnabled).toBe(false);
  });

  it('updateSettings round-trips developerModeEnabled independently of notificationsEnabled', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const updated = await mockSettingsService.updateSettings({ developerModeEnabled: true });
    expect(updated.developerModeEnabled).toBe(true);
    expect(updated.notificationsEnabled).toBe(true);

    const fetched = await mockSettingsService.getSettings();
    expect(fetched.developerModeEnabled).toBe(true);
  });

  it('resetSettings restores the documented defaults', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const { DEFAULT_SETTINGS } = await import('../settingsService');
    await mockSettingsService.updateSettings({ notificationsEnabled: false, developerModeEnabled: true });

    const reset = await mockSettingsService.resetSettings();
    expect(reset).toEqual(DEFAULT_SETTINGS);
    expect(reset.developerModeEnabled).toBe(false);
    expect(await mockSettingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists developerModeEnabled as a plain boolean in the same jarvis.settings key — no new storage key, nothing sensitive', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    await mockSettingsService.updateSettings({ developerModeEnabled: true });

    expect(localStorage.length).toBe(1);
    const raw = localStorage.getItem('jarvis.settings');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(Object.keys(parsed).sort()).toEqual(['developerModeEnabled', 'notificationsEnabled']);
    expect(parsed.developerModeEnabled).toBe(true);
  });

  it('survives corrupted localStorage content by falling back to defaults', async () => {
    localStorage.setItem('jarvis.settings', '{not valid json');
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const { DEFAULT_SETTINGS } = await import('../settingsService');
    expect(await mockSettingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
