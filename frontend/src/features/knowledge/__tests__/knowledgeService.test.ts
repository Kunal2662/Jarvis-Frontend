import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('knowledge service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getKnowledgeService } = await import('../knowledgeService');
    const { mockKnowledgeService } = await import('../adapters/mockKnowledgeAdapter');
    expect(getKnowledgeService()).toBe(mockKnowledgeService);
    expect(mockKnowledgeService.id).toBe('mock');
    expect(mockKnowledgeService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreKnowledgeService } = await import('../adapters/coreKnowledgeAdapter');
    expect(coreKnowledgeService.id).toBe('core');
    expect(coreKnowledgeService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreKnowledgeService } = await import('../adapters/coreKnowledgeAdapter');
    const { CoreKnowledgeContractUnavailableError } = await import('../knowledgeService');
    await expect(coreKnowledgeService.getKnowledgeItems()).rejects.toBeInstanceOf(
      CoreKnowledgeContractUnavailableError,
    );
    await expect(coreKnowledgeService.getKnowledgeItem('x')).rejects.toBeInstanceOf(
      CoreKnowledgeContractUnavailableError,
    );
  });

  it('seeds a read-only set of knowledge items covering every source type', async () => {
    const { mockKnowledgeService } = await import('../adapters/mockKnowledgeAdapter');
    const items = await mockKnowledgeService.getKnowledgeItems();
    expect(items.length).toBeGreaterThanOrEqual(5);
    const sourceTypes = new Set(items.map((i) => i.sourceType));
    expect(sourceTypes).toContain('file');
    expect(sourceTypes).toContain('note');
    expect(sourceTypes).toContain('web');
    expect(sourceTypes).toContain('chat-memory');
    // Every item carries the fields the list + detail views depend on.
    for (const item of items) {
      expect(item.title).toBeTruthy();
      expect(item.snippet).toBeTruthy();
      expect(item.content).toBeTruthy();
      expect(item.updatedAt).toBeTruthy();
      expect(Array.isArray(item.tags)).toBe(true);
    }
  });

  it('getKnowledgeItem returns a single item by id', async () => {
    const { mockKnowledgeService } = await import('../adapters/mockKnowledgeAdapter');
    const item = await mockKnowledgeService.getKnowledgeItem('know-1');
    expect(item.id).toBe('know-1');
    expect(item.title).toBeTruthy();
  });

  it('getKnowledgeItem rejects for an unknown id', async () => {
    const { mockKnowledgeService } = await import('../adapters/mockKnowledgeAdapter');
    await expect(mockKnowledgeService.getKnowledgeItem('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('has no create/update/delete methods — Knowledge is read-only (Core owns ingestion)', async () => {
    const { mockKnowledgeService } = await import('../adapters/mockKnowledgeAdapter');
    expect((mockKnowledgeService as unknown as Record<string, unknown>).createKnowledgeItem).toBeUndefined();
    expect((mockKnowledgeService as unknown as Record<string, unknown>).updateKnowledgeItem).toBeUndefined();
    expect((mockKnowledgeService as unknown as Record<string, unknown>).deleteKnowledgeItem).toBeUndefined();
  });
});
