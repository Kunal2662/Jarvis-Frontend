import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('agent service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getAgentService } = await import('../agentService');
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    expect(getAgentService()).toBe(mockAgentService);
    expect(mockAgentService.id).toBe('mock');
    expect(mockAgentService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreAgentService } = await import('../adapters/coreAgentAdapter');
    expect(coreAgentService.id).toBe('core');
    expect(coreAgentService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreAgentService } = await import('../adapters/coreAgentAdapter');
    const { CoreAgentContractUnavailableError } = await import('../agentService');
    await expect(coreAgentService.getAgents()).rejects.toBeInstanceOf(CoreAgentContractUnavailableError);
    await expect(coreAgentService.getAgent('x')).rejects.toBeInstanceOf(CoreAgentContractUnavailableError);
    await expect(coreAgentService.getRuns('x')).rejects.toBeInstanceOf(CoreAgentContractUnavailableError);
    await expect(coreAgentService.setEnabled('x', true)).rejects.toBeInstanceOf(CoreAgentContractUnavailableError);
  });

  it('seeds a set of agents covering every status', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const agents = await mockAgentService.getAgents();
    expect(agents.length).toBeGreaterThanOrEqual(5);

    const statuses = new Set(agents.map((a) => a.status));
    expect(statuses).toContain('active');
    expect(statuses).toContain('idle');
    expect(statuses).toContain('disabled');

    for (const agent of agents) {
      expect(agent.name).toBeTruthy();
      expect(agent.description).toBeTruthy();
      expect(Array.isArray(agent.capabilities)).toBe(true);
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });

  it('every seeded agent is fictional local-development content, never a real secret/credential', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const agents = await mockAgentService.getAgents();
    const runsAll = (await Promise.all(agents.map((a) => mockAgentService.getRuns(a.id)))).flat();
    const secretPattern = /password|api[_-]?key|token|secret|credit card|ssn|social security/i;
    for (const agent of agents) {
      expect(agent.description).not.toMatch(secretPattern);
    }
    for (const run of runsAll) {
      expect(run.summary).not.toMatch(secretPattern);
    }
  });

  it('getAgent returns a single agent by id and rejects for an unknown id', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const agent = await mockAgentService.getAgent('agent-research');
    expect(agent.id).toBe('agent-research');
    expect(agent.name).toBe('Research Agent');
    await expect(mockAgentService.getAgent('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('getRuns returns only that agent\'s history, newest first, and rejects for an unknown agent id', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const runs = await mockAgentService.getRuns('agent-research');
    expect(runs.length).toBeGreaterThanOrEqual(2);
    expect(runs.every((r) => r.agentId === 'agent-research')).toBe(true);
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i - 1].startedAt >= runs[i].startedAt).toBe(true);
    }
    await expect(mockAgentService.getRuns('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('a disabled agent honestly has zero runs, exercising the empty-history state', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const runs = await mockAgentService.getRuns('agent-smarthome');
    expect(runs).toEqual([]);
    const agent = await mockAgentService.getAgent('agent-smarthome');
    expect(agent.status).toBe('disabled');
  });

  it('setEnabled(false) disables an agent, and setEnabled(true) re-enables it to idle', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const disabled = await mockAgentService.setEnabled('agent-research', false);
    expect(disabled.status).toBe('disabled');

    const reenabled = await mockAgentService.setEnabled('agent-research', true);
    expect(reenabled.status).toBe('idle');

    const persisted = await mockAgentService.getAgent('agent-research');
    expect(persisted.status).toBe('idle');
  });

  it('setEnabled rejects for an unknown agent id', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    await expect(mockAgentService.setEnabled('does-not-exist', true)).rejects.toThrow(/not found/i);
  });

  it('has no run/execute method — this frontend never simulates agent execution (Core owns it)', async () => {
    const { mockAgentService } = await import('../adapters/mockAgentAdapter');
    const svc = mockAgentService as unknown as Record<string, unknown>;
    expect(svc.runAgent).toBeUndefined();
    expect(svc.executeAgent).toBeUndefined();
    expect(svc.createAgent).toBeUndefined();
  });
});
