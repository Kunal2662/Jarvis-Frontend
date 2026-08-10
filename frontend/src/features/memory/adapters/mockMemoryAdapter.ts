import type { Memory, MemoryService } from '../memoryService';

/**
 * Frontend in-memory mock adapter for Memory. All mock data + mutation logic
 * lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state
 * so Forget is fully interactive. A future Core adapter can replace this
 * wholesale — no UI change required.
 *
 * Every seeded memory below is clearly fictional local-development data —
 * ordinary preferences/routines/instructions, never a real secret,
 * credential, or private identifying detail. No real Core memory service,
 * vector store, or embeddings pipeline is ever contacted anywhere in this
 * file.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let memories: Memory[] = [
  {
    id: 'mem-1',
    content: 'Preferred home temperature is 23°C.',
    type: 'Preference',
    source: 'chat',
    importance: 'high',
    createdAt: '2026-08-01T09:12:00-04:00',
  },
  {
    id: 'mem-2',
    content: 'Bedroom AC is usually used at night.',
    type: 'Routine',
    source: 'voice',
    importance: 'medium',
    createdAt: '2026-08-02T22:40:00-04:00',
  },
  {
    id: 'mem-3',
    content: 'Jarvis should use concise responses.',
    type: 'Instruction',
    source: 'chat',
    importance: 'high',
    createdAt: '2026-07-28T14:05:00-04:00',
  },
  {
    id: 'mem-4',
    content: 'Living room is the primary entertainment area.',
    type: 'Context',
    source: 'voice',
    importance: 'low',
    createdAt: '2026-07-30T18:20:00-04:00',
  },
  {
    id: 'mem-5',
    content: 'Prefers dark mode across all interfaces.',
    type: 'Preference',
    source: 'chat',
    importance: 'medium',
    createdAt: '2026-08-03T11:00:00-04:00',
  },
  {
    id: 'mem-6',
    content: 'Usually asks for a morning briefing around 8 AM.',
    type: 'Routine',
    source: 'voice',
    importance: 'medium',
    createdAt: '2026-08-04T08:02:00-04:00',
  },
  {
    id: 'mem-7',
    content: 'Front door lock is the entrance security device.',
    type: 'Device',
    source: 'chat',
    importance: 'low',
    createdAt: '2026-07-25T16:45:00-04:00',
  },
  {
    id: 'mem-8',
    content: 'Dislikes being interrupted during focus sessions.',
    type: 'Instruction',
    source: 'voice',
    importance: 'high',
    createdAt: '2026-08-05T10:30:00-04:00',
  },
  {
    id: 'mem-9',
    content: 'Weekends are typically spent working from the home office.',
    type: 'Context',
    source: 'chat',
    importance: 'low',
    createdAt: '2026-07-27T13:15:00-04:00',
  },
];

function clone(m: Memory): Memory {
  return { ...m };
}

function requireMemory(id: string): Memory {
  const found = memories.find((m) => m.id === id);
  if (!found) throw new Error(`Memory "${id}" was not found.`);
  return found;
}

export const mockMemoryService: MemoryService = {
  id: 'mock',
  label: 'Frontend mock (local development memory)',
  ready: true,

  async getMemories(signal?: AbortSignal): Promise<Memory[]> {
    return withAbort(signal, memories.map(clone));
  },

  async getMemory(id: string, signal?: AbortSignal): Promise<Memory> {
    const memory = requireMemory(id);
    return withAbort(signal, clone(memory));
  },

  async forgetMemory(id: string, signal?: AbortSignal): Promise<void> {
    requireMemory(id);
    memories = memories.filter((m) => m.id !== id);
    await withAbort<undefined>(signal, undefined);
  },
};
