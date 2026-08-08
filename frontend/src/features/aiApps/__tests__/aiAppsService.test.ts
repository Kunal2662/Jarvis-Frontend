import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiAppsService } from '../aiAppsService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its catalog in module-level state,
// mirrors automationService.test.ts).
async function freshMockService(): Promise<AiAppsService> {
  vi.resetModules();
  const mod = await import('../adapters/mockAiAppsAdapter');
  return mod.mockAiAppsService;
}

describe('AI Apps service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getAiAppsService } = await import('../aiAppsService');
    const { mockAiAppsService } = await import('../adapters/mockAiAppsAdapter');
    expect(getAiAppsService()).toBe(mockAiAppsService);
    expect(mockAiAppsService.id).toBe('mock');
    expect(mockAiAppsService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreAiAppsService } = await import('../adapters/coreAiAppsAdapter');
    expect(coreAiAppsService.id).toBe('core');
    expect(coreAiAppsService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreAiAppsService } = await import('../adapters/coreAiAppsAdapter');
    const { CoreAiAppsContractUnavailableError } = await import('../aiAppsService');
    await expect(coreAiAppsService.getApps()).rejects.toBeInstanceOf(CoreAiAppsContractUnavailableError);
    await expect(coreAiAppsService.getApp('x')).rejects.toBeInstanceOf(CoreAiAppsContractUnavailableError);
    await expect(coreAiAppsService.setConnected('x', true)).rejects.toBeInstanceOf(
      CoreAiAppsContractUnavailableError,
    );
  });

  it('seeds a realistic catalog mixing mcp-tool and connector entries', async () => {
    const service = await freshMockService();
    const apps = await service.getApps();
    expect(apps.length).toBeGreaterThanOrEqual(5);
    expect(apps.length).toBeLessThanOrEqual(8);

    const categories = new Set(apps.map((a) => a.category));
    expect(categories).toContain('mcp-tool');
    expect(categories).toContain('connector');

    expect(apps.map((a) => a.name)).toEqual(
      expect.arrayContaining(['Web Search', 'File Access', 'Automations Tool', 'Gmail', 'Google Calendar']),
    );

    // Every entry carries the fields the catalog + detail view depend on.
    for (const app of apps) {
      expect(app.name).toBeTruthy();
      expect(app.description).toBeTruthy();
      expect(app.provider).toBeTruthy();
      expect(Array.isArray(app.capabilities)).toBe(true);
      expect(app.capabilities.length).toBeGreaterThan(0);
      expect(['connected', 'not_connected', 'unavailable']).toContain(app.connectionStatus);
      expect(app.updatedAt).toBeTruthy();
    }
  });

  it('includes at least one entry in each connection status, for honest state coverage', async () => {
    const service = await freshMockService();
    const apps = await service.getApps();
    const statuses = new Set(apps.map((a) => a.connectionStatus));
    expect(statuses).toContain('connected');
    expect(statuses).toContain('not_connected');
    expect(statuses).toContain('unavailable');
  });

  it('getApp returns a single app by id', async () => {
    const service = await freshMockService();
    const app = await service.getApp('web-search');
    expect(app.id).toBe('web-search');
    expect(app.category).toBe('mcp-tool');
  });

  it('getApp rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getApp('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('setConnected(true) connects and setConnected(false) disconnects, mutating in place', async () => {
    const service = await freshMockService();
    const before = await service.getApp('code-sandbox');
    expect(before.connectionStatus).toBe('not_connected');

    const connected = await service.setConnected('code-sandbox', true);
    expect(connected.connectionStatus).toBe('connected');
    expect(new Date(connected.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(before.updatedAt).getTime());

    // The mutation persists across subsequent reads (real in-memory state).
    const reread = await service.getApp('code-sandbox');
    expect(reread.connectionStatus).toBe('connected');

    const disconnected = await service.setConnected('code-sandbox', false);
    expect(disconnected.connectionStatus).toBe('not_connected');
  });

  it('setConnected rejects for an app marked unavailable — cannot connect what is not offered', async () => {
    const service = await freshMockService();
    const app = await service.getApp('microsoft-365');
    expect(app.connectionStatus).toBe('unavailable');
    await expect(service.setConnected('microsoft-365', true)).rejects.toThrow(/not available/i);
  });

  it('setConnected rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.setConnected('does-not-exist', true)).rejects.toThrow(/not found/i);
  });

  it('has no install/uninstall or OAuth-flow method — connect/disconnect is the only mutation', async () => {
    const service = await freshMockService();
    const asRecord = service as unknown as Record<string, unknown>;
    expect(asRecord.install).toBeUndefined();
    expect(asRecord.uninstall).toBeUndefined();
    expect(asRecord.authorize).toBeUndefined();
    expect(asRecord.connectOAuth).toBeUndefined();
  });
});
