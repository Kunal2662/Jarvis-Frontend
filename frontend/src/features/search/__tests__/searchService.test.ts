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

    // Honest broadening, not a weakening: the seeded memory "Usually asks for
    // a morning briefing around 8 AM" (Step 16) and the seeded "Daily
    // Briefing Agent" ("Compiles your morning briefing...", Step 17)
    // legitimately also match "morning" — mirrors how Step 13's room/device
    // overlaps were handled.
    expect(groups).toHaveLength(3);
    expect(groups[0].category).toBe('automation');
    expect(groups[0].label).toBe('Automations');
    expect(groups[0].results.map((r) => r.title)).toContain('Morning Brief');
    // Every result carries a real navigable path — never a fabricated one.
    expect(groups[0].results[0].path).toBe('/automations');
    expect(groups[0].results[0].navState).toEqual({ automationId: 'auto-1' });

    const memoryGroup = groups.find((g) => g.category === 'memory');
    expect(memoryGroup?.results.map((r) => r.title)).toContain('Usually asks for a morning briefing around 8 AM.');

    const agentGroup = groups.find((g) => g.category === 'agent');
    expect(agentGroup?.results.map((r) => r.title)).toContain('Daily Briefing Agent');
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

  // Step 13 — Smart Home (room/device/scene) search categories.

  it('a query matching only a device name returns a categorized "device" group (Step 13)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('fan');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('device');
    expect(groups[0].label).toBe('Devices');
    expect(groups[0].results.map((r) => r.title)).toContain('Bedroom Fan');
    // Every result carries a real navigable path with a deep-link to the item.
    expect(groups[0].results[0].path).toBe('/smart-home');
    expect(groups[0].results[0].navState).toEqual({ deviceId: 'dev-bedroom-fan' });
  });

  it('a query matching only a scene name returns a categorized "scene" group (Step 13)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('movie');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('scene');
    expect(groups[0].label).toBe('Scenes');
    expect(groups[0].results.map((r) => r.title)).toContain('Movie Time');
    expect(groups[0].results[0].path).toBe('/smart-home');
    expect(groups[0].results[0].navState).toEqual({ sceneId: 'scene-movie-time' });
  });

  it('a query matching only a scene description returns a categorized "scene" group', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('savings');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('scene');
    expect(groups[0].results.map((r) => r.title)).toContain('Away Mode');
  });

  it('a query matching a room legitimately also matches that room\'s devices — honest overlap, not a bug', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    // Device names are prefixed with their room name (e.g. "Outdoor Light"),
    // so a room-name query naturally also matches its own devices — mirrors
    // how "Google Calendar" legitimately matches both `calendar` and
    // `ai-app` (Step 12).
    const groups = await mockSearchService.search('outdoor');

    const roomGroup = groups.find((g) => g.category === 'room');
    expect(roomGroup?.results.map((r) => r.title)).toEqual(['Outdoor']);
    expect(roomGroup?.results[0].path).toBe('/smart-home');
    expect(roomGroup?.results[0].navState).toEqual({ roomId: 'room-outdoor' });

    const deviceGroup = groups.find((g) => g.category === 'device');
    expect(deviceGroup?.results.map((r) => r.title).sort()).toEqual(
      ['Outdoor Light', 'Outdoor Motion Sensor'].sort(),
    );

    expect(groups.some((g) => g.category === 'scene')).toBe(false);
  });

  it('a broader query can legitimately span room, device, and scene categories together', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('living');

    const roomGroup = groups.find((g) => g.category === 'room');
    expect(roomGroup?.results.map((r) => r.title)).toEqual(['Living Room']);

    const deviceGroup = groups.find((g) => g.category === 'device');
    expect(deviceGroup?.results.map((r) => r.title).sort()).toEqual(
      ['Living Room Light', 'Living Room Thermostat', 'Living Room Speaker'].sort(),
    );

    const sceneGroup = groups.find((g) => g.category === 'scene');
    expect(sceneGroup?.results.map((r) => r.title).sort()).toEqual(['Good Night', 'Movie Time'].sort());
  });

  it('the Smart Home nav destination is searchable as an "app" group result, alongside pre-existing same-named automation and task entries', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    // "Smart Home" pre-dates this step in two other datasets: the Step 8
    // automations seed ("Smart Home Evening Routine") and the Step 12 tasks
    // seed (a task titled "Review Smart Home connectivity PR" tagged with
    // project "Smart Home"). Adding the Smart Home nav destination and the
    // room/device/scene categories must not break either — all should
    // legitimately coexist for this query.
    const groups = await mockSearchService.search('smart home');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'Smart Home' && r.path === '/smart-home')).toBe(true);

    const automationGroup = groups.find((g) => g.category === 'automation');
    expect(automationGroup?.results.map((r) => r.title)).toContain('Smart Home Evening Routine');

    const taskGroup = groups.find((g) => g.category === 'task');
    expect(taskGroup?.results.map((r) => r.title)).toContain('Review Smart Home connectivity PR');

    // None of the seeded rooms/devices/scenes themselves are named "Smart
    // Home", so no room/device/scene group is spuriously produced here.
    expect(groups.some((g) => g.category === 'room' || g.category === 'device' || g.category === 'scene')).toBe(
      false,
    );
  });

  // Regression: adding the Smart Home categories must not break any
  // pre-existing search category (Step 8-12). A query that previously
  // returned exactly one group must still return exactly that, with no
  // spurious room/device/scene group alongside it.
  it('regression: automations, knowledge, AI Apps, notes, tasks, calendar, and files search still work correctly after adding the Smart Home categories', async () => {
    // Seven sequential `search()` calls at ~750-800ms of simulated latency
    // each comfortably exceed the default 5000ms test timeout (mirrors why
    // earlier steps' own multi-call regression tests stay well under 5-6
    // calls) — this one needs an explicit longer timeout rather than either
    // trimming coverage or reintroducing the exact latency-stacking problem
    // `search()` itself was fixed to avoid via Promise.all (see
    // mockSearchAdapter.ts).
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );
    expect(
      automationGroups.some((g) => g.category === 'room' || g.category === 'device' || g.category === 'scene'),
    ).toBe(false);

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );
    expect(
      knowledgeGroups.some((g) => g.category === 'room' || g.category === 'device' || g.category === 'scene'),
    ).toBe(false);

    const aiAppGroups = await mockSearchService.search('sandbox');
    expect(aiAppGroups.find((g) => g.category === 'ai-app')?.results.map((r) => r.title)).toContain('Code Sandbox');

    const noteGroups = await mockSearchService.search('orb');
    expect(noteGroups.find((g) => g.category === 'note')?.results.map((r) => r.title)).toContain(
      'Ideas for Voice Orb redesign',
    );

    const taskGroups = await mockSearchService.search('roadmap');
    expect(taskGroups.find((g) => g.category === 'task')?.results.map((r) => r.title)).toContain(
      'Draft Q3 roadmap review',
    );

    const calendarGroups = await mockSearchService.search('checkup');
    expect(calendarGroups.find((g) => g.category === 'calendar')?.results.map((r) => r.title)).toContain(
      'Dentist checkup',
    );

    const filesGroups = await mockSearchService.search('budget');
    expect(filesGroups.find((g) => g.category === 'files')?.results.map((r) => r.title)).toContain(
      'Household budget.xlsx',
    );
  }, 15000);

  it('regression: recent chat search still works alongside the new Smart Home categories', async () => {
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

  // ── Step 16 — Memory ────────────────────────────────────────────────────

  it('a query matching only a memory\'s content returns a categorized "memory" group (Step 16)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('concise');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('memory');
    expect(groups[0].results[0].title).toBe('Jarvis should use concise responses.');
    expect(groups[0].results[0].path).toBe('/memory');
    expect(groups[0].results[0].navState).toEqual({ memoryId: 'mem-3' });
  });

  it('the Memory nav destination is searchable as an "app" group result', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('memory');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'Memory' && r.path === '/memory')).toBe(true);
  });

  it('regression: automations, knowledge, AI Apps, notes, tasks, calendar, files, and smart home search still work correctly after adding the Memory category', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );
    // "morning" legitimately also matches the seeded memory "Usually asks for
    // a morning briefing around 8 AM" — honest overlap, not a bug (mirrors
    // the room/device overlap pattern above).
    expect(automationGroups.find((g) => g.category === 'memory')?.results.map((r) => r.title)).toContain(
      'Usually asks for a morning briefing around 8 AM.',
    );

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );

    const roomGroups = await mockSearchService.search('outdoor');
    expect(roomGroups.find((g) => g.category === 'room')?.results.map((r) => r.title)).toEqual(['Outdoor']);
    expect(roomGroups.some((g) => g.category === 'memory')).toBe(false);

    const filesGroups = await mockSearchService.search('budget');
    expect(filesGroups.find((g) => g.category === 'files')?.results.map((r) => r.title)).toContain(
      'Household budget.xlsx',
    );
  }, 15000);

  it('regression: recent chat search still works alongside the new Memory category', async () => {
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

  // ── Step 17 — Agents ────────────────────────────────────────────────────

  it('a query matching only an agent\'s name returns a categorized "agent" group (Step 17)', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('Research Agent');

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('agent');
    expect(groups[0].results[0].title).toBe('Research Agent');
    expect(groups[0].results[0].path).toBe('/agents');
    expect(groups[0].results[0].navState).toEqual({ agentId: 'agent-research' });
  });

  it('the Agents nav destination is searchable as an "app" group result', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('agents');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'Agents' && r.path === '/agents')).toBe(true);
  });

  it('regression: automations, memory, knowledge, rooms, and files search still work correctly after adding the Agents category', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );
    // "morning" legitimately also matches the seeded "Daily Briefing Agent"
    // ("Compiles your morning briefing...") — honest overlap, not a bug.
    expect(automationGroups.find((g) => g.category === 'agent')?.results.map((r) => r.title)).toContain(
      'Daily Briefing Agent',
    );

    const memoryGroups = await mockSearchService.search('concise');
    expect(memoryGroups.find((g) => g.category === 'memory')?.results.map((r) => r.title)).toContain(
      'Jarvis should use concise responses.',
    );

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );

    const roomGroups = await mockSearchService.search('outdoor');
    expect(roomGroups.find((g) => g.category === 'room')?.results.map((r) => r.title)).toEqual(['Outdoor']);

    const filesGroups = await mockSearchService.search('budget');
    expect(filesGroups.find((g) => g.category === 'files')?.results.map((r) => r.title)).toContain(
      'Household budget.xlsx',
    );
  }, 15000);

  it('regression: recent chat search still works alongside the new Agents category', async () => {
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

  // Step 19 — Settings. Per searchService.ts's 'app' category doc comment,
  // Settings was ALREADY one of the destinations `searchApp()` covers (it
  // reads `settingsModules` regardless of `status`) — flipping
  // app/modules.tsx's `/settings` entry from 'planned' to 'live' required
  // no searchService/mockSearchAdapter changes. No new 'settings' category
  // was added, and no individual setting/toggle is a separate search
  // result — only the Settings destination itself (per
  // docs/CORE_SETTINGS_CONTRACT_REQUIRED.md's scope note).
  it('the Settings nav destination is searchable as an "app" group result', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');
    const groups = await mockSearchService.search('settings');

    const appGroup = groups.find((g) => g.category === 'app');
    expect(appGroup?.results.some((r) => r.title === 'Settings' && r.path === '/settings')).toBe(true);
    // Exactly one result — no per-toggle entries (Appearance, Notifications,
    // etc.) leak into Universal Search.
    expect(appGroup?.results.filter((r) => r.path === '/settings')).toHaveLength(1);
  });

  it('regression: agents, automations, memory, knowledge, rooms, and files search still work correctly after Settings became a live destination', async () => {
    const { mockSearchService } = await import('../adapters/mockSearchAdapter');

    const agentGroups = await mockSearchService.search('research agent');
    expect(agentGroups.find((g) => g.category === 'agent')?.results.map((r) => r.title)).toContain(
      'Research Agent',
    );

    const automationGroups = await mockSearchService.search('morning');
    expect(automationGroups.find((g) => g.category === 'automation')?.results.map((r) => r.title)).toContain(
      'Morning Brief',
    );

    const memoryGroups = await mockSearchService.search('concise');
    expect(memoryGroups.find((g) => g.category === 'memory')?.results.map((r) => r.title)).toContain(
      'Jarvis should use concise responses.',
    );

    const knowledgeGroups = await mockSearchService.search('checklist');
    expect(knowledgeGroups.find((g) => g.category === 'knowledge')?.results.map((r) => r.title)).toContain(
      'Workshop Safety Checklist',
    );

    const roomGroups = await mockSearchService.search('outdoor');
    expect(roomGroups.find((g) => g.category === 'room')?.results.map((r) => r.title)).toEqual(['Outdoor']);

    const filesGroups = await mockSearchService.search('budget');
    expect(filesGroups.find((g) => g.category === 'files')?.results.map((r) => r.title)).toContain(
      'Household budget.xlsx',
    );
  }, 15000);
});
