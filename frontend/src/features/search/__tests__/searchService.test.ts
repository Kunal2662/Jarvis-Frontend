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
    // "auto" matches the "Automations" page label. None of the seeded
    // automation names/descriptions contain the substring "auto", but the
    // AI Apps catalog (Step 11) legitimately does — "Automations Tool" is an
    // MCP-style tool for triggering automations, so it honestly matches too.
    // Updated from the Step 9 baseline (which asserted exactly one "app"
    // group) the same way Step 10 updated app/__tests__/modules.test.ts when
    // new, legitimate live data was added — this asserts the "app" group's
    // own behavior is unchanged, plus the new "ai-app" group alongside it.
    const groups = await mockSearchService.search('auto');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.map((r) => r.title)).toEqual(['Automations']);
    expect(appGroup?.results[0].path).toBe('/automations');

    const aiAppGroup = groups.find((g) => g.category === 'ai-app');
    expect(aiAppGroup?.results.map((r) => r.title)).toEqual(['Automations Tool']);

    // No other categories spuriously match "auto".
    expect(groups.map((g) => g.category).sort()).toEqual(['ai-app', 'app']);
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

  it('a query matching only a knowledge document title returns a categorized "knowledge" group (Step 10)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('checklist');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('knowledge');
    expect(groups[0].label).toBe('Knowledge');
    expect(groups[0].results.map((r) => r.title)).toContain('Workshop Safety Checklist');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/knowledge');
    expect(groups[0].results[0].navState).toEqual({ knowledgeId: 'know-1' });
  });

  it('a query matching only a knowledge document tag returns a categorized "knowledge" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('procurement');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('knowledge');
    expect(groups[0].results.map((r) => r.title)).toContain('Supplier Contacts — Titanium Alloy');
  });

  it('a query matching the Knowledge nav destination returns a categorized "app" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('knowledge');
    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'Knowledge' && r.path === '/knowledge')).toBe(true);
  });

  it('a query matching only an AI App name returns a categorized "ai-app" group (Step 11)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('sandbox');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('ai-app');
    expect(groups[0].label).toBe('AI Apps');
    expect(groups[0].results.map((r) => r.title)).toContain('Code Sandbox');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/apps');
    expect(groups[0].results[0].navState).toEqual({ aiAppId: 'code-sandbox' });
  });

  it('a query matching only an AI App provider returns a categorized "ai-app" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('microsoft');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('ai-app');
    expect(groups[0].results.map((r) => r.title)).toContain('Microsoft 365');
  });

  it('a query matching the AI Apps nav destination returns a categorized "app" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('ai apps');
    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'AI Apps' && r.path === '/apps')).toBe(true);
  });

  // Regression: adding the AI Apps category must not break any pre-existing
  // search category (Step 8-10). A query that matches results across
  // automations, nav pages, knowledge and AI Apps at once must still return
  // every one of those groups correctly, alongside the new ai-app group.
  it('regression: automations, nav pages, and knowledge search still work correctly after adding the AI Apps category', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );

    const navGroups = await mockSearchService.search('auto');
    expect(navGroups.find((g) => g.category === 'app')?.results.map((r) => r.title)).toEqual(['Automations']);

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );

    // None of the above queries should spuriously surface an AI Apps group.
    expect(automationGroups.some((g) => g.category === 'ai-app')).toBe(false);
    expect(knowledgeGroups.some((g) => g.category === 'ai-app')).toBe(false);
  });

  it('regression: recent chat search still works alongside the new AI Apps category', async () => {
    const { saveMessages } = await import('../../chat/chatStore');
    saveMessages([
      { id: 'm1', role: 'user', content: 'Remind me about the quarterly review' },
      { id: 'm2', role: 'assistant', content: 'Sure thing — quarterly review at 3pm.' },
    ]);
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('quarterly');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('chat');
    expect(groups[0].results[0].title).toContain('quarterly review');
  });
});
