import { beforeEach, describe, expect, it } from 'vitest';
import { saveMessages } from '../../chat/chatStore';

describe('search service seam', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to the mock adapter', async () => {
    const { getSearchService } = await import('../searchService');
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    expect(getSearchService()).toBe(mockSearchService);
    expect(mockSearchService.id).toBe('mock');
    expect(mockSearchService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreSearchService } = await import('../adapters/coreSearchAdapter');
    expect(coreSearchService.id).toBe('core');
    expect(coreSearchService.ready).toBe(false);
  });

  it('the core adapter rejects with the unavailable error', async () => {
    const { coreSearchService } = await import('../adapters/coreSearchAdapter');
    const { CoreSearchContractUnavailableError } = await import('../searchService');
    await expect(coreSearchService.search('anything')).rejects.toBeInstanceOf(
      CoreSearchContractUnavailableError,
    );
  });

  it('a blank query returns no groups', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    expect(await mockSearchService.search('')).toEqual([]);
    expect(await mockSearchService.search('   ')).toEqual([]);
  });

  it('a query matching only automation name/description returns a categorized "automation" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('morning');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('automation');
    expect(groups[0].label).toBe('Automations');
    expect(groups[0].results.map((r) => r.title)).toContain('Morning Brief');
    // Every result carries a real navigable path — never a fabricated one.
    expect(groups[0].results[0].path).toBe('/automations');
    expect(groups[0].results[0].navState).toEqual({ automationId: 'auto-1' });
  });

  it('a query matching a live nav destination returns a categorized "app" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    // "auto" matches the "Automations" page label but none of the seeded
    // automation names/descriptions contain the substring "auto".
    const groups = await mockSearchService.search('auto');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('app');
    expect(groups[0].results.map((r) => r.title)).toEqual(['Automations']);
    expect(groups[0].results[0].path).toBe('/automations');
  });

  it('the Voice destination result carries a voice action instead of a placeholder route', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('voice');
    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results[0]).toMatchObject({ title: 'Voice', action: 'voice' });
  });

  it('a query matching only a recent chat message returns a categorized "chat" group (real local data, not fabricated)', async () => {
    saveMessages([
      { id: 'm1', role: 'user', content: 'Remind me about the quarterly review' },
      { id: 'm2', role: 'assistant', content: 'Sure thing — quarterly review at 3pm.' },
    ]);
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('quarterly');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('chat');
    // Only the user's own message matches — the assistant reply is not
    // treated as searchable chat history.
    expect(groups[0].results).toHaveLength(1);
    expect(groups[0].results[0].title).toContain('quarterly review');
    expect(groups[0].results[0].path).toBe('/chat');
  });

  it('a query with no matches anywhere returns no groups', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('zzzznomatchxyz');
    expect(groups).toEqual([]);
  });
});
