import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('diagnostics service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getDiagnosticsService } = await import('../diagnosticsService');
    const { mockDiagnosticsService } = await import('../adapters/mockDiagnosticsAdapter');
    expect(getDiagnosticsService()).toBe(mockDiagnosticsService);
    expect(mockDiagnosticsService.id).toBe('mock');
    expect(mockDiagnosticsService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented M13B contract)', async () => {
    const { coreDiagnosticsService } = await import('../adapters/coreDiagnosticsAdapter');
    expect(coreDiagnosticsService.id).toBe('core');
    expect(coreDiagnosticsService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreDiagnosticsService } = await import('../adapters/coreDiagnosticsAdapter');
    const { CoreDiagnosticsContractUnavailableError } = await import('../diagnosticsService');
    await expect(coreDiagnosticsService.getSystemStatus()).rejects.toBeInstanceOf(
      CoreDiagnosticsContractUnavailableError,
    );
    await expect(coreDiagnosticsService.getCoreHealth()).rejects.toBeInstanceOf(
      CoreDiagnosticsContractUnavailableError,
    );
  });

  it('getSystemStatus reports real status for every other feature seam, never fabricated rows', async () => {
    const { mockDiagnosticsService } = await import('../adapters/mockDiagnosticsAdapter');
    const rows = await mockDiagnosticsService.getSystemStatus();

    // Every currently-shipped frontend feature seam is represented.
    const keys = rows.map((r) => r.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        'home',
        'chat',
        'voice',
        'automations',
        'knowledge',
        'intelligence',
        'ai-apps',
        'notes',
        'tasks',
        'calendar',
        'files',
        'smart-home',
        'home-assistant',
        'mqtt',
        'memory',
        'agents',
        'settings',
        'search',
      ]),
    );
    // No duplicate rows.
    expect(new Set(keys).size).toBe(keys.length);

    for (const row of rows) {
      expect(row.name).toBeTruthy();
      // Most seams use 'mock' | 'core', but a few use their own vocabulary
      // (Chat's 'dev', Voice's 'local') — assert it's a real, non-empty id
      // rather than over-narrowing to a union every seam would need to match.
      expect(row.backendId).toBeTruthy();
      expect(row.backendLabel).toBeTruthy();
      expect(typeof row.ready).toBe('boolean');
    }
  });

  it('every default-mode component reports ready (all features default to their own local/mock adapter)', async () => {
    const { mockDiagnosticsService } = await import('../adapters/mockDiagnosticsAdapter');
    const rows = await mockDiagnosticsService.getSystemStatus();
    expect(rows.every((r) => r.ready)).toBe(true);
    // None default to the (unimplemented) 'core' backend.
    expect(rows.every((r) => r.backendId !== 'core')).toBe(true);
  });

  it('getCoreHealth honestly reports M13B is unavailable, never fabricating CPU/memory numbers', async () => {
    const { mockDiagnosticsService } = await import('../adapters/mockDiagnosticsAdapter');
    const health = await mockDiagnosticsService.getCoreHealth();
    expect(health.available).toBe(false);
    expect(health.milestone).toBe('M13B');
    expect(health.message).toBeTruthy();
  });

  it('supports AbortSignal cancellation without throwing a false error downstream', async () => {
    const { mockDiagnosticsService } = await import('../adapters/mockDiagnosticsAdapter');
    const controller = new AbortController();
    const promise = mockDiagnosticsService.getSystemStatus(controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
