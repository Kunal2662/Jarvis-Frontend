import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutomationInput, AutomationService } from '../automationService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its dataset in module-level state).
async function freshMockService(): Promise<AutomationService> {
  vi.resetModules();
  const mod = await import('../adapters/mockAutomationAdapter');
  return mod.mockAutomationService;
}

const sampleInput: AutomationInput = {
  name: 'Test automation',
  description: 'Created in a test',
  trigger: { type: 'schedule', summary: 'Every hour', schedule: '0 * * * *' },
  conditions: [{ id: 'c1', summary: 'Only on weekdays' }],
  actions: [{ id: 'a1', type: 'notify', summary: 'Send a notification' }],
};

describe('automation service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getAutomationService } = await import('../automationService');
    const { mockAutomationService } = await import('../adapters/mockAutomationAdapter');
    expect(getAutomationService()).toBe(mockAutomationService);
    expect(mockAutomationService.id).toBe('mock');
    expect(mockAutomationService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreAutomationService } = await import('../adapters/coreAutomationAdapter');
    expect(coreAutomationService.id).toBe('core');
    expect(coreAutomationService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreAutomationService } = await import('../adapters/coreAutomationAdapter');
    const { CoreAutomationContractUnavailableError } = await import('../automationService');
    await expect(coreAutomationService.getAutomations()).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.getAutomation('x')).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.createAutomation(sampleInput)).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.deleteAutomation('x')).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.setEnabled('x', true)).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.pauseResume('x', 'pause')).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
    await expect(coreAutomationService.getExecutionHistory('x')).rejects.toBeInstanceOf(
      CoreAutomationContractUnavailableError,
    );
  });

  it('seeds 5 realistic automations with varied statuses', async () => {
    const service = await freshMockService();
    const automations = await service.getAutomations();
    expect(automations).toHaveLength(5);
    expect(automations.map((a) => a.name)).toEqual([
      'Morning Brief',
      'Daily System Health Check',
      'Smart Home Evening Routine',
      'Weekly Work Summary',
      'Backup Reminder',
    ]);
    const statuses = new Set(automations.map((a) => a.status));
    expect(statuses).toContain('active');
    expect(statuses).toContain('paused');
    expect(statuses).toContain('failed');
  });

  it('getAutomation returns a single automation with execution history', async () => {
    const service = await freshMockService();
    const automation = await service.getAutomation('auto-1');
    expect(automation.name).toBe('Morning Brief');
    expect(automation.executionHistory.length).toBeGreaterThan(0);
  });

  it('getAutomation rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getAutomation('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('getExecutionHistory returns the execution log for an automation', async () => {
    const service = await freshMockService();
    const history = await service.getExecutionHistory('auto-4');
    expect(history.some((e) => e.status === 'failed')).toBe(true);
  });

  it('createAutomation adds a new automation that is immediately enabled and active', async () => {
    const service = await freshMockService();
    const created = await service.createAutomation(sampleInput);
    expect(created.name).toBe('Test automation');
    expect(created.enabled).toBe(true);
    expect(created.status).toBe('active');
    expect(created.executionHistory).toEqual([]);

    const all = await service.getAutomations();
    expect(all.find((a) => a.id === created.id)).toBeTruthy();
    expect(all).toHaveLength(6);
  });

  it('updateAutomation overwrites the editable fields without touching history', async () => {
    const service = await freshMockService();
    const before = await service.getAutomation('auto-1');
    const updated = await service.updateAutomation('auto-1', {
      ...sampleInput,
      name: 'Morning Brief (updated)',
    });
    expect(updated.name).toBe('Morning Brief (updated)');
    expect(updated.executionHistory).toEqual(before.executionHistory);
  });

  it('deleteAutomation removes the automation from subsequent listings', async () => {
    const service = await freshMockService();
    const created = await service.createAutomation(sampleInput);
    await service.deleteAutomation(created.id);
    const all = await service.getAutomations();
    expect(all.find((a) => a.id === created.id)).toBeUndefined();
    expect(all).toHaveLength(5);
  });

  it('setEnabled(false) disables and setEnabled(true) reactivates', async () => {
    const service = await freshMockService();
    const disabled = await service.setEnabled('auto-1', false);
    expect(disabled.enabled).toBe(false);
    expect(disabled.status).toBe('disabled');

    const reenabled = await service.setEnabled('auto-1', true);
    expect(reenabled.enabled).toBe(true);
    expect(reenabled.status).toBe('active');
  });

  it('pauseResume toggles between paused and active', async () => {
    const service = await freshMockService();
    const paused = await service.pauseResume('auto-1', 'pause');
    expect(paused.status).toBe('paused');
    expect(paused.enabled).toBe(false);

    const resumed = await service.pauseResume('auto-1', 'resume');
    expect(resumed.status).toBe('active');
    expect(resumed.enabled).toBe(true);
  });
});
