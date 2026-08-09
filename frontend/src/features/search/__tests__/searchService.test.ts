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
    // Step 12 adds one more legitimate match: a seeded note's own content
    // mentions "the automation trigger registry", so it honestly matches as
    // well. Updated from the Step 9 baseline (which asserted exactly one
    // "app" group) the same way Step 10/11 updated their own tests when new,
    // legitimate live data was added — this asserts the "app" group's own
    // behavior is unchanged, plus the "ai-app" and "note" groups alongside it.
    const groups = await mockSearchService.search('auto');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.map((r) => r.title)).toEqual(['Automations']);
    expect(appGroup?.results[0].path).toBe('/automations');

    const aiAppGroup = groups.find((g) => g.category === 'ai-app');
    expect(aiAppGroup?.results.map((r) => r.title)).toEqual(['Automations Tool']);

    // No other categories spuriously match "auto".
    expect(groups.map((g) => g.category).sort()).toEqual(['ai-app', 'app', 'note']);
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

  // Step 12 — Notes + Tasks search categories.

  it('a query matching only a note title returns a categorized "note" group (Step 12)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('orb');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('note');
    expect(groups[0].label).toBe('Notes');
    expect(groups[0].results.map((r) => r.title)).toContain('Ideas for Voice Orb redesign');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/notes');
    expect(groups[0].results[0].navState).toEqual({ noteId: 'note-1' });
  });

  it('a query matching only a note tag returns a categorized "note" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('meetings');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('note');
    expect(groups[0].results.map((r) => r.title)).toContain('Standup notes — Aug 5');
  });

  it('a query matching only a task title returns a categorized "task" group (Step 12)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('roadmap');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('task');
    expect(groups[0].label).toBe('Tasks');
    expect(groups[0].results.map((r) => r.title)).toContain('Draft Q3 roadmap review');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/tasks');
    expect(groups[0].results[0].navState).toEqual({ taskId: 'task-1' });
  });

  it('a query matching only a task project tag returns a categorized "task" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('polish');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('task');
    expect(groups[0].results.map((r) => r.title)).toContain('Fix Voice Overlay animation glitch');
  });

  it('the Notes and Tasks nav destinations are searchable as "app" group results', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const notesGroups = await mockSearchService.search('notes');
    expect(notesGroups.find((g) => g.category === 'app')?.results.some((r) => r.title === 'Notes' && r.path === '/notes')).toBe(
      true,
    );

    const tasksGroups = await mockSearchService.search('tasks');
    expect(tasksGroups.find((g) => g.category === 'app')?.results.some((r) => r.title === 'Tasks' && r.path === '/tasks')).toBe(
      true,
    );
  });

  // Regression: adding the Notes + Tasks categories must not break any
  // pre-existing search category (Step 8-11). A query that previously
  // returned exactly one group for automations/nav/knowledge/ai-app/chat must
  // still return exactly that, with no spurious note/task group alongside it.
  it('regression: automations, nav pages, knowledge, and AI Apps search still work correctly after adding the Notes + Tasks categories', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );
    expect(automationGroups.some((g) => g.category === 'note' || g.category === 'task')).toBe(false);

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );
    expect(knowledgeGroups.some((g) => g.category === 'note' || g.category === 'task')).toBe(false);

    const aiAppGroups = await mockSearchService.search('sandbox');
    expect(aiAppGroups.find((g) => g.category === 'ai-app')?.results.map((r) => r.title)).toContain('Code Sandbox');
    expect(aiAppGroups.some((g) => g.category === 'note' || g.category === 'task')).toBe(false);
  });

  it('regression: recent chat search still works alongside the new Notes + Tasks categories', async () => {
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

  // Step 12 — Calendar + Files search categories.

  it('a query matching only a calendar event title returns a categorized "calendar" group (Step 12)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('checkup');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('calendar');
    expect(groups[0].label).toBe('Calendar');
    expect(groups[0].results.map((r) => r.title)).toContain('Dentist checkup');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/calendar');
    expect(groups[0].results[0].navState).toEqual({ eventId: 'cal-1' });
  });

  it('a query matching only a calendar event location returns a categorized "calendar" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('riverside');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('calendar');
    expect(groups[0].results.map((r) => r.title)).toContain('Quick jog');
  });

  it('a query matching only a root-level file name returns a categorized "files" group (Step 12)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('budget');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('files');
    expect(groups[0].label).toBe('Files');
    expect(groups[0].results.map((r) => r.title)).toContain('Household budget.xlsx');
    // Deep-links to /files with the file's (root) containing folder + id.
    expect(groups[0].results[0].path).toBe('/files');
    expect(groups[0].results[0].navState).toEqual({ folderId: undefined, fileId: 'file-1' });
  });

  it('a query matching a file nested inside a folder deep-links to its containing folder', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('lease');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('files');
    expect(groups[0].results.map((r) => r.title)).toContain('Lease agreement.pdf');
    expect(groups[0].results[0].navState).toEqual({ folderId: 'folder-1', fileId: 'file-3' });
  });

  it('a query matching only a folder name returns a categorized "files" group, deep-linking into the folder itself', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('pictures');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('files');
    expect(groups[0].results.map((r) => r.title)).toContain('Pictures');
    expect(groups[0].results[0].navState).toEqual({ folderId: 'folder-2' });
  });

  it('the Calendar and Files nav destinations are searchable as "app" group results, alongside their same-named AI Apps catalog entries', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    // "calendar" also legitimately matches the pre-existing "Google Calendar"
    // AI Apps connector (Step 11) — both are honest matches, not a bug.
    const calendarGroups = await mockSearchService.search('calendar');
    expect(
      calendarGroups.find((g) => g.category === 'app')?.results.some((r) => r.title === 'Calendar' && r.path === '/calendar'),
    ).toBe(true);
    expect(calendarGroups.find((g) => g.category === 'ai-app')?.results.map((r) => r.title)).toContain(
      'Google Calendar',
    );

    // "files" also legitimately matches the pre-existing "File Access" AI Apps
    // MCP tool (Step 11), whose description mentions "files".
    const filesGroups = await mockSearchService.search('files');
    expect(
      filesGroups.find((g) => g.category === 'app')?.results.some((r) => r.title === 'Files' && r.path === '/files'),
    ).toBe(true);
    expect(filesGroups.find((g) => g.category === 'ai-app')?.results.map((r) => r.title)).toContain('File Access');
  });

  // Regression: adding the Calendar + Files categories must not break any
  // pre-existing search category (Step 8-12). A query that previously
  // returned exactly one group must still return exactly that, with no
  // spurious calendar/files group alongside it.
  it('regression: automations, knowledge, AI Apps, notes, and tasks search still work correctly after adding the Calendar + Files categories', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );
    expect(automationGroups.some((g) => g.category === 'calendar' || g.category === 'files')).toBe(false);

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );
    expect(knowledgeGroups.some((g) => g.category === 'calendar' || g.category === 'files')).toBe(false);

    const aiAppGroups = await mockSearchService.search('sandbox');
    expect(aiAppGroups.find((g) => g.category === 'ai-app')?.results.map((r) => r.title)).toContain('Code Sandbox');
    expect(aiAppGroups.some((g) => g.category === 'calendar' || g.category === 'files')).toBe(false);

    const noteGroups = await mockSearchService.search('orb');
    expect(noteGroups.find((g) => g.category === 'note')?.results.map((r) => r.title)).toContain(
      'Ideas for Voice Orb redesign',
    );
    expect(noteGroups.some((g) => g.category === 'calendar' || g.category === 'files')).toBe(false);

    const taskGroups = await mockSearchService.search('roadmap');
    expect(taskGroups.find((g) => g.category === 'task')?.results.map((r) => r.title)).toContain(
      'Draft Q3 roadmap review',
    );
    expect(taskGroups.some((g) => g.category === 'calendar' || g.category === 'files')).toBe(false);
  });

  it('regression: recent chat search still works alongside the new Calendar + Files categories', async () => {
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
