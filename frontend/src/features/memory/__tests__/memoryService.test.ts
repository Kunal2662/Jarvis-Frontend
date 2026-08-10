import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('memory service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getMemoryService } = await import('../memoryService');
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    expect(getMemoryService()).toBe(mockMemoryService);
    expect(mockMemoryService.id).toBe('mock');
    expect(mockMemoryService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreMemoryService } = await import('../adapters/coreMemoryAdapter');
    expect(coreMemoryService.id).toBe('core');
    expect(coreMemoryService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreMemoryService } = await import('../adapters/coreMemoryAdapter');
    const { CoreMemoryContractUnavailableError } = await import('../memoryService');
    await expect(coreMemoryService.getMemories()).rejects.toBeInstanceOf(CoreMemoryContractUnavailableError);
    await expect(coreMemoryService.getMemory('x')).rejects.toBeInstanceOf(CoreMemoryContractUnavailableError);
    await expect(coreMemoryService.forgetMemory('x')).rejects.toBeInstanceOf(CoreMemoryContractUnavailableError);
  });

  it('seeds a set of memories covering every type, both sources, and every importance level', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    const memories = await mockMemoryService.getMemories();
    expect(memories.length).toBeGreaterThanOrEqual(9);

    const types = new Set(memories.map((m) => m.type));
    expect(types).toContain('Preference');
    expect(types).toContain('Context');
    expect(types).toContain('Device');
    expect(types).toContain('Routine');
    expect(types).toContain('Instruction');

    const sources = new Set(memories.map((m) => m.source));
    expect(sources).toContain('chat');
    expect(sources).toContain('voice');

    const importances = new Set(memories.map((m) => m.importance));
    expect(importances).toContain('low');
    expect(importances).toContain('medium');
    expect(importances).toContain('high');

    // Every memory carries the fields the list + detail views depend on.
    for (const memory of memories) {
      expect(memory.content).toBeTruthy();
      expect(memory.createdAt).toBeTruthy();
    }
  });

  it('every seeded memory is fictional local-development content, never a real secret/credential', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    const memories = await mockMemoryService.getMemories();
    const secretPattern = /password|api[_-]?key|token|secret|credit card|ssn|social security/i;
    for (const memory of memories) {
      expect(memory.content).not.toMatch(secretPattern);
    }
  });

  it('getMemory returns a single memory by id and rejects for an unknown id', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    const memory = await mockMemoryService.getMemory('mem-1');
    expect(memory.id).toBe('mem-1');
    expect(memory.content).toBeTruthy();
    await expect(mockMemoryService.getMemory('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('forgetMemory removes the memory so it no longer appears in getMemories/getMemory', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    await mockMemoryService.forgetMemory('mem-1');
    await expect(mockMemoryService.getMemory('mem-1')).rejects.toThrow(/not found/i);
    const memories = await mockMemoryService.getMemories();
    expect(memories.some((m) => m.id === 'mem-1')).toBe(false);
  });

  it('forgetMemory rejects for an unknown id', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    await expect(mockMemoryService.forgetMemory('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('has no create/update/edit-content methods — a memory is never user-authored here (Core owns formation)', async () => {
    const { mockMemoryService } = await import('../adapters/mockMemoryAdapter');
    const svc = mockMemoryService as unknown as Record<string, unknown>;
    expect(svc.createMemory).toBeUndefined();
    expect(svc.updateMemory).toBeUndefined();
    expect(svc.editMemory).toBeUndefined();
  });
});
