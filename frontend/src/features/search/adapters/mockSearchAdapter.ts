import type { SearchResult, SearchResultGroup, SearchService } from '../searchService';
import { mockAutomationService } from '../../automations/adapters/mockAutomationAdapter';
import { mockKnowledgeService } from '../../knowledge/adapters/mockKnowledgeAdapter';
import { mockAiAppsService } from '../../aiApps/adapters/mockAiAppsAdapter';
import { mockNotesService } from '../../notes/adapters/mockNotesAdapter';
import { mockTasksService } from '../../tasks/adapters/mockTasksAdapter';
import { mockCalendarService } from '../../calendar/adapters/mockCalendarAdapter';
import { mockFilesService } from '../../files/adapters/mockFilesAdapter';
import { mockSmartHomeService } from '../../smartHome/adapters/mockSmartHomeAdapter';
import { mockMemoryService } from '../../memory/adapters/mockMemoryAdapter';
import { mockAgentService } from '../../agents/adapters/mockAgentAdapter';
import { loadMessages } from '../../chat/chatStore';
import { liveSecondaryModules, settingsModules, topBarModules } from '../../../app/modules';

/**
 * Frontend client-side mock adapter for Universal Search. Does simple, honest
 * substring filtering over data that already exists in this frontend — it is
 * NOT a ranking/relevance engine (per the roadmap: "do not recreate Search or
 * Intelligence logic in React"). Simulates realistic network latency like the
 * other mock adapters (see mockAutomationAdapter.ts) so loading states are
 * exercised. A future Core adapter can replace this wholesale — no UI change
 * required.
 */

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 150): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

function matches(haystack: string, term: string): boolean {
  return haystack.toLowerCase().includes(term);
}

/** Live + reachable nav destinations (mirrors the CommandPalette "Go to" group). */
function searchApp(term: string): SearchResult[] {
  const destinations = [...topBarModules, ...liveSecondaryModules, ...settingsModules];
  return destinations
    .filter((m) => matches(m.label, term))
    .map((m) => ({
      id: `app-${m.path.replace(/\W+/g, '') || 'home'}`,
      category: 'app' as const,
      title: m.label,
      description: m.action === 'voice' ? 'Open a voice session with Jarvis' : `Go to ${m.label}`,
      path: m.path,
      action: m.action,
    }));
}

/** The Automations mock dataset (Step 8) — search by name/description. */
async function searchAutomations(term: string): Promise<SearchResult[]> {
  const automations = await mockAutomationService.getAutomations();
  return automations
    .filter((a) => matches(a.name, term) || matches(a.description, term))
    .map((a) => ({
      id: `automation-${a.id}`,
      category: 'automation' as const,
      title: a.name,
      description: a.description,
      path: '/automations',
      navState: { automationId: a.id },
    }));
}

/** The Knowledge mock document set (Step 10) — search by title/snippet/tags.
 *  Matches how searchAutomations searches name/description: honest substring
 *  filtering over real (local/mock) data, no ranking. */
async function searchKnowledge(term: string): Promise<SearchResult[]> {
  const items = await mockKnowledgeService.getKnowledgeItems();
  return items
    .filter(
      (k) =>
        matches(k.title, term) || matches(k.snippet, term) || k.tags.some((tag) => matches(tag, term)),
    )
    .map((k) => ({
      id: `knowledge-${k.id}`,
      category: 'knowledge' as const,
      title: k.title,
      description: k.snippet,
      path: '/knowledge',
      navState: { knowledgeId: k.id },
    }));
}

/** The AI Apps mock catalog (Step 11) — search by name/description/provider.
 *  Matches how searchKnowledge/searchAutomations search: honest substring
 *  filtering over real (local/mock) data, no ranking. Covers both MCP-style
 *  tools and connector-style entries — they share one searchable category. */
async function searchAiApps(term: string): Promise<SearchResult[]> {
  const apps = await mockAiAppsService.getApps();
  return apps
    .filter((a) => matches(a.name, term) || matches(a.description, term) || matches(a.provider, term))
    .map((a) => ({
      id: `ai-app-${a.id}`,
      category: 'ai-app' as const,
      title: a.name,
      description: a.description,
      path: '/apps',
      navState: { aiAppId: a.id },
    }));
}

/** The Notes mock/local dataset (Step 12) — search by title/content/tags.
 *  Matches how searchKnowledge/searchAutomations search: honest substring
 *  filtering over real (local/mock) data, no ranking. */
async function searchNotes(term: string): Promise<SearchResult[]> {
  const notes = await mockNotesService.getNotes();
  return notes
    .filter(
      (n) => matches(n.title, term) || matches(n.content, term) || n.tags.some((tag) => matches(tag, term)),
    )
    .map((n) => ({
      id: `note-${n.id}`,
      category: 'note' as const,
      title: n.title || 'Untitled note',
      description: n.content,
      path: '/notes',
      navState: { noteId: n.id },
    }));
}

/** The Tasks mock/local dataset (Step 12) — search by title/description/project.
 *  Matches how searchNotes/searchAutomations search: honest substring
 *  filtering over real (local/mock) data, no ranking. */
async function searchTasks(term: string): Promise<SearchResult[]> {
  const tasks = await mockTasksService.getTasks();
  return tasks
    .filter(
      (t) => matches(t.title, term) || matches(t.description, term) || (t.project ? matches(t.project, term) : false),
    )
    .map((t) => ({
      id: `task-${t.id}`,
      category: 'task' as const,
      title: t.title,
      description: t.description || t.project || undefined,
      path: '/tasks',
      navState: { taskId: t.id },
    }));
}

/** The Calendar mock/local dataset (Step 12) — search by title/description/
 *  location. Matches how searchNotes/searchTasks search: honest substring
 *  filtering over real (local/mock) data, no ranking. */
async function searchCalendar(term: string): Promise<SearchResult[]> {
  const events = await mockCalendarService.getEvents();
  return events
    .filter(
      (e) =>
        matches(e.title, term) || matches(e.description, term) || (e.location ? matches(e.location, term) : false),
    )
    .map((e) => ({
      id: `calendar-${e.id}`,
      category: 'calendar' as const,
      title: e.title,
      description: e.location || e.description || undefined,
      path: '/calendar',
      navState: { eventId: e.id },
    }));
}

/** The Files mock/local dataset (Step 12) — search by file/folder NAME only,
 *  not folder contents (per the roadmap: honest substring filtering over
 *  real data, no ranking, no full-text indexing). A file result deep-links
 *  to its containing folder; a folder result deep-links into itself. */
async function searchFiles(term: string): Promise<SearchResult[]> {
  const root = await mockFilesService.getFiles(undefined);
  const all = [...root];
  // Mock adapter only exposes children-of-a-folder, so walk the tree level by
  // level to build the full searchable set from real (mock) data. Every
  // folder at a given depth is fetched CONCURRENTLY via Promise.all (mirrors
  // the fix already applied to the top-level category fan-out below) —
  // fetching one folder at a time here would otherwise stack simulated
  // latency per folder and could push a single search() call past test
  // timeouts once several searches run sequentially in one test.
  let level = root.filter((e) => e.type === 'folder');
  while (level.length > 0) {
    const childArrays = await Promise.all(level.map((folder) => mockFilesService.getFiles(folder.id)));
    const children = childArrays.flat();
    all.push(...children);
    level = children.filter((e) => e.type === 'folder');
  }

  return all
    .filter((entry) => matches(entry.name, term))
    .map((entry) => ({
      id: `files-${entry.id}`,
      category: 'files' as const,
      title: entry.name,
      description: entry.type === 'folder' ? 'Folder' : entry.mimeType,
      path: '/files',
      navState:
        entry.type === 'folder' ? { folderId: entry.id } : { folderId: entry.parentId, fileId: entry.id },
    }));
}

/** The Smart Home mock room set (Step 13) — search by room name only (rooms
 *  have no other searchable text field). Matches how searchNotes/searchTasks
 *  search: honest substring filtering over real (local/mock) data, no
 *  ranking. Deep-links to `/smart-home` and pre-selects the room filter. */
async function searchRooms(term: string): Promise<SearchResult[]> {
  const rooms = await mockSmartHomeService.getRooms();
  return rooms
    .filter((r) => matches(r.name, term))
    .map((r) => ({
      id: `room-${r.id}`,
      category: 'room' as const,
      title: r.name,
      description: `${r.deviceCount} ${r.deviceCount === 1 ? 'device' : 'devices'}`,
      path: '/smart-home',
      navState: { roomId: r.id },
    }));
}

/** The Smart Home mock device set (Step 13) — search by device name/type.
 *  Note device names are prefixed with their room name (e.g. "Living Room
 *  Light"), so a query matching a room legitimately also matches that room's
 *  devices — this is honest, not a bug (mirrors how "Google Calendar"
 *  legitimately matches both the `calendar` and `ai-app` categories, Step
 *  12). Deep-links to `/smart-home`, pre-selecting that device's room. */
async function searchDevices(term: string): Promise<SearchResult[]> {
  const devices = await mockSmartHomeService.getDevices();
  return devices
    .filter((d) => matches(d.name, term) || matches(d.type, term))
    .map((d) => ({
      id: `device-${d.id}`,
      category: 'device' as const,
      title: d.name,
      description: d.type,
      path: '/smart-home',
      navState: { deviceId: d.id },
    }));
}

/** The Smart Home mock scene set (Step 13) — search by name/description.
 *  Matches how searchAutomations/searchKnowledge search. Deep-links to
 *  `/smart-home` and highlights the matched scene card. */
async function searchScenes(term: string): Promise<SearchResult[]> {
  const scenes = await mockSmartHomeService.getScenes();
  return scenes
    .filter((s) => matches(s.name, term) || matches(s.description, term))
    .map((s) => ({
      id: `scene-${s.id}`,
      category: 'scene' as const,
      title: s.name,
      description: s.description,
      path: '/smart-home',
      navState: { sceneId: s.id },
    }));
}

/** The Memory mock dataset (Step 16) — search by content only, honest
 *  substring filtering, never semantic/vector retrieval. Deep-links to
 *  `/memory` and pre-selects the matched memory's detail drawer. */
async function searchMemories(term: string): Promise<SearchResult[]> {
  const memories = await mockMemoryService.getMemories();
  return memories
    .filter((m) => matches(m.content, term))
    .map((m) => ({
      id: `memory-${m.id}`,
      category: 'memory' as const,
      title: m.content,
      description: m.type,
      path: '/memory',
      navState: { memoryId: m.id },
    }));
}

/** The Agents mock dataset (Step 17) — search by name/description only.
 *  Deep-links to `/agents` and pre-selects the matched agent's detail
 *  drawer. */
async function searchAgents(term: string): Promise<SearchResult[]> {
  const agents = await mockAgentService.getAgents();
  return agents
    .filter((a) => matches(a.name, term) || matches(a.description, term))
    .map((a) => ({
      id: `agent-${a.id}`,
      category: 'agent' as const,
      title: a.name,
      description: a.description,
      path: '/agents',
      navState: { agentId: a.id },
    }));
}

/** This browser's own recent Chat messages (localStorage, Step 7) — real data,
 *  not fabricated history. Only the user's own messages are searched. */
function searchChat(term: string): SearchResult[] {
  const found = loadMessages().filter((m) => m.role === 'user' && matches(m.content, term));
  return found
    .slice(-5)
    .reverse()
    .map((m) => ({
      id: `chat-${m.id}`,
      category: 'chat' as const,
      title: m.content.length > 80 ? `${m.content.slice(0, 80)}…` : m.content,
      description: 'Recent message to Jarvis',
      path: '/chat',
    }));
}

const LABELS: Record<SearchResult['category'], string> = {
  app: 'Pages',
  automation: 'Automations',
  chat: 'Chat',
  knowledge: 'Knowledge',
  'ai-app': 'AI Apps',
  note: 'Notes',
  task: 'Tasks',
  calendar: 'Calendar',
  files: 'Files',
  room: 'Rooms',
  device: 'Devices',
  scene: 'Scenes',
  memory: 'Memory',
  agent: 'Agents',
};

export const mockSearchService: SearchService = {
  id: 'mock',
  label: 'Frontend mock (client-side filtering)',
  ready: true,

  async search(query: string, signal?: AbortSignal): Promise<SearchResultGroup[]> {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const [automation, knowledge, aiApp, note, task, calendar, files, room, device, scene, memory, agent] =
      await Promise.all([
        searchAutomations(term),
        searchKnowledge(term),
        searchAiApps(term),
        searchNotes(term),
        searchTasks(term),
        searchCalendar(term),
        searchFiles(term),
        searchRooms(term),
        searchDevices(term),
        searchScenes(term),
        searchMemories(term),
        searchAgents(term),
      ]);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const app = searchApp(term);
    const chat = searchChat(term);

    const allGroups: SearchResultGroup[] = [
      { category: 'app', label: LABELS.app, results: app },
      { category: 'automation', label: LABELS.automation, results: automation },
      { category: 'knowledge', label: LABELS.knowledge, results: knowledge },
      { category: 'ai-app', label: LABELS['ai-app'], results: aiApp },
      { category: 'note', label: LABELS.note, results: note },
      { category: 'task', label: LABELS.task, results: task },
      { category: 'calendar', label: LABELS.calendar, results: calendar },
      { category: 'files', label: LABELS.files, results: files },
      { category: 'room', label: LABELS.room, results: room },
      { category: 'device', label: LABELS.device, results: device },
      { category: 'scene', label: LABELS.scene, results: scene },
      { category: 'memory', label: LABELS.memory, results: memory },
      { category: 'agent', label: LABELS.agent, results: agent },
      { category: 'chat', label: LABELS.chat, results: chat },
    ];
    const groups = allGroups.filter((g) => g.results.length > 0);

    return withAbort(signal, groups);
  },
};
