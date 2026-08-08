import type { SearchResult, SearchResultGroup, SearchService } from '../searchService';
import { mockAutomationService } from '../../automations/adapters/mockAutomationAdapter';
import { loadMessages } from '../../chat/chatStore';
import { settingsModules, topBarModules } from '../../../app/modules';

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
  const destinations = [...topBarModules, ...settingsModules];
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
};

export const mockSearchService: SearchService = {
  id: 'mock',
  label: 'Frontend mock (client-side filtering)',
  ready: true,

  async search(query: string, signal?: AbortSignal): Promise<SearchResultGroup[]> {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const automation = await searchAutomations(term);
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const app = searchApp(term);
    const chat = searchChat(term);

    const allGroups: SearchResultGroup[] = [
      { category: 'app', label: LABELS.app, results: app },
      { category: 'automation', label: LABELS.automation, results: automation },
      { category: 'chat', label: LABELS.chat, results: chat },
    ];
    const groups = allGroups.filter((g) => g.results.length > 0);

    return withAbort(signal, groups);
  },
};
