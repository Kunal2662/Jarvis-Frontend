import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('intelligence service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getIntelligenceService } = await import('../intelligenceService');
    const { mockIntelligenceService } = await import('../adapters/mockIntelligenceAdapter');
    expect(getIntelligenceService()).toBe(mockIntelligenceService);
    expect(mockIntelligenceService.id).toBe('mock');
    expect(mockIntelligenceService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreIntelligenceService } = await import('../adapters/coreIntelligenceAdapter');
    expect(coreIntelligenceService.id).toBe('core');
    expect(coreIntelligenceService.ready).toBe(false);
  });

  it('the core adapter rejects with the unavailable error', async () => {
    const { coreIntelligenceService } = await import('../adapters/coreIntelligenceAdapter');
    const { CoreIntelligenceContractUnavailableError } = await import('../intelligenceService');
    await expect(coreIntelligenceService.getInsights()).rejects.toBeInstanceOf(
      CoreIntelligenceContractUnavailableError,
    );
  });

  it('serves a static, pre-seeded list of insights (no client-side scoring)', async () => {
    const { mockIntelligenceService } = await import('../adapters/mockIntelligenceAdapter');
    const first = await mockIntelligenceService.getInsights();
    const second = await mockIntelligenceService.getInsights();
    // Same seeded content on every call — nothing is computed/ranked from
    // other live frontend state (e.g. the Automations dataset).
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(4);
    for (const insight of first) {
      expect(insight.title).toBeTruthy();
      expect(insight.description).toBeTruthy();
      expect(['info', 'suggestion', 'warning']).toContain(insight.tone);
      expect(insight.generatedAt).toBeTruthy();
    }
  });

  it('has no dismiss/acknowledge/create method — Intelligence is read-only display', async () => {
    const { mockIntelligenceService } = await import('../adapters/mockIntelligenceAdapter');
    const svc = mockIntelligenceService as unknown as Record<string, unknown>;
    expect(svc.dismissInsight).toBeUndefined();
    expect(svc.acknowledgeInsight).toBeUndefined();
    expect(svc.createInsight).toBeUndefined();
  });
});
