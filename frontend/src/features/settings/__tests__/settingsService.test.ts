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

  it('resetSettings restores the documented defaults', async () => {
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const { DEFAULT_SETTINGS } = await import('../settingsService');
    await mockSettingsService.updateSettings({ notificationsEnabled: false });

    const reset = await mockSettingsService.resetSettings();
    expect(reset).toEqual(DEFAULT_SETTINGS);
    expect(await mockSettingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('survives corrupted localStorage content by falling back to defaults', async () => {
    localStorage.setItem('jarvis.settings', '{not valid json');
    const { mockSettingsService } = await import('../adapters/mockSettingsAdapter');
    const { DEFAULT_SETTINGS } = await import('../settingsService');
    expect(await mockSettingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
