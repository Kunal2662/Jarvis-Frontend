import type { KnowledgeItem, KnowledgeService } from '../knowledgeService';

/**
 * Frontend local/static mock adapter for Knowledge. All mock data lives
 * HERE, separated from presentation — a read-only, in-memory document set
 * standing in for a real Core Knowledge index. Simulates realistic network
 * latency so loading states are exercised (mirrors mockAutomationAdapter.ts
 * and mockSearchAdapter.ts). There is no create/update/delete here by
 * design — Knowledge is a browse/consume surface only; a future Core
 * adapter can replace this wholesale — no UI change required.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'know-1',
    title: 'Workshop Safety Checklist',
    snippet:
      'Standard checklist covering ventilation, fire suppression, and fabrication bay lockout procedures.',
    content:
      'Standard checklist covering ventilation, fire suppression, and fabrication bay lockout ' +
      'procedures before running any powered tooling. Includes the pre-flight checklist for the ' +
      'suit fabrication rig and the emergency shutdown sequence for the arc furnace. Review before ' +
      'each extended workshop session.',
    sourceType: 'file',
    tags: ['safety', 'workshop', 'reference'],
    updatedAt: '2026-07-28T10:00:00-04:00',
  },
  {
    id: 'know-2',
    title: 'Weekly Standup Recap — R&D Team',
    snippet: 'Summary saved from a chat session covering propulsion test results and open blockers.',
    content:
      'Summary saved from a chat session covering propulsion test results and open blockers. ' +
      'Thrust variance on the third test rig is within tolerance; the telemetry rig needs a firmware ' +
      'update before the next test window. Follow-up owners and target dates were captured in the ' +
      'original conversation.',
    sourceType: 'chat-memory',
    tags: ['team', 'notes', 'r&d'],
    updatedAt: '2026-08-05T09:15:00-04:00',
  },
  {
    id: 'know-3',
    title: 'Reading List — Advanced Materials',
    snippet: 'Papers and references on lightweight alloys and self-healing composites.',
    content:
      'Papers and references on lightweight alloys and self-healing composites, curated for the next ' +
      'materials review. Includes three externally published papers and two internal lab notebooks on ' +
      'micro-fracture recovery in polymer-metal composites.',
    sourceType: 'note',
    tags: ['research', 'materials', 'reading-list'],
    updatedAt: '2026-07-15T18:30:00-04:00',
  },
  {
    id: 'know-4',
    title: 'JARVIS Core Architecture Primer',
    snippet: 'An overview of how the orchestrator, planner, and tool executor fit together.',
    content:
      'An overview of how the orchestrator, planner, and tool executor fit together in JARVIS Core. ' +
      'Covers the high-level request lifecycle from intent capture through execution and response, ' +
      'without exposing internal implementation detail. Intended as background reading, not a live API ' +
      'reference.',
    sourceType: 'web',
    tags: ['architecture', 'core', 'reference'],
    updatedAt: '2026-06-02T12:00:00-04:00',
  },
  {
    id: 'know-5',
    title: 'Supplier Contacts — Titanium Alloy',
    snippet: 'Contact sheet for verified titanium alloy suppliers used in fabrication.',
    content:
      'Contact sheet for verified titanium alloy suppliers used in fabrication, including lead times ' +
      'and minimum order quantities from the last three purchase cycles. Preferred supplier is listed ' +
      'first; backup suppliers are listed for redundancy.',
    sourceType: 'file',
    tags: ['suppliers', 'procurement'],
    updatedAt: '2026-05-20T14:00:00-04:00',
  },
  {
    id: 'know-6',
    title: 'Household Preferences Notes',
    snippet: 'Lighting, temperature, and playlist preferences captured from past conversations.',
    content:
      'Lighting, temperature, and playlist preferences captured from past conversations, used as ' +
      'background context for the smart home routines. Preferred evening lighting is warm and dim; ' +
      'preferred workshop temperature is cooler than the rest of the house.',
    sourceType: 'note',
    tags: ['home', 'preferences'],
    updatedAt: '2026-04-11T08:00:00-04:00',
  },
];

function clone(item: KnowledgeItem): KnowledgeItem {
  return JSON.parse(JSON.stringify(item));
}

export const mockKnowledgeService: KnowledgeService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getKnowledgeItems(signal?: AbortSignal): Promise<KnowledgeItem[]> {
    return withAbort(signal, knowledgeItems.map(clone));
  },

  async getKnowledgeItem(id: string, signal?: AbortSignal): Promise<KnowledgeItem> {
    const found = knowledgeItems.find((k) => k.id === id);
    if (!found) throw new Error(`Knowledge item "${id}" was not found.`);
    return withAbort(signal, clone(found), 200);
  },
};
