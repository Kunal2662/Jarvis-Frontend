import type { Note, NoteInput, NotesService } from '../notesService';

/**
 * Frontend in-memory mock adapter for Notes. All mock data + mutation logic
 * lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state
 * so the UI is fully interactive (not static). A future Core adapter can
 * replace this wholesale — no UI change required. Mirrors
 * mockAutomationAdapter.ts's shape/style.
 */

let seq = 100;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let notes: Note[] = [
  {
    id: 'note-1',
    title: 'Ideas for Voice Orb redesign',
    content:
      'Softer pulse animation on wake word.\nConsider a low-power "listening" ring instead of a full glow.\nAsk design for a color pass that works in both themes.',
    tags: ['design', 'voice'],
    pinned: true,
    createdAt: '2026-06-02T10:15:00-04:00',
    updatedAt: '2026-08-04T09:30:00-04:00',
  },
  {
    id: 'note-2',
    title: 'Core API open questions',
    content:
      'What does the automation trigger registry actually expose for event names?\nIs Knowledge tag vocabulary fixed or free-form?\nFollow up once M11 contracts are published.',
    tags: ['core', 'questions'],
    pinned: true,
    createdAt: '2026-07-10T14:00:00-04:00',
    updatedAt: '2026-07-28T16:45:00-04:00',
  },
  {
    id: 'note-3',
    title: 'Standup notes — Aug 5',
    content:
      'Shipped AI Apps catalog.\nNext up: Notes + Tasks frontend.\nBlocked on nothing — Core contracts still pending for M11.',
    tags: ['meetings', 'team'],
    pinned: false,
    createdAt: '2026-08-05T08:05:00-04:00',
    updatedAt: '2026-08-05T08:05:00-04:00',
  },
  {
    id: 'note-4',
    title: 'Grocery list',
    content: 'Coffee\nOat milk\nEggs\nSpinach\nBackup router (the old one keeps dropping Wi-Fi)',
    tags: ['personal'],
    pinned: false,
    createdAt: '2026-08-06T19:20:00-04:00',
    updatedAt: '2026-08-06T19:20:00-04:00',
  },
  {
    id: 'note-5',
    title: 'Reading list',
    content: 'Designing Data-Intensive Applications — finish ch. 7\nA Philosophy of Software Design — reread',
    tags: ['personal', 'reading'],
    pinned: false,
    createdAt: '2026-05-18T21:00:00-04:00',
    updatedAt: '2026-06-30T21:10:00-04:00',
  },
];

function clone(n: Note): Note {
  return { ...n, tags: [...n.tags] };
}

function requireNote(id: string): Note {
  const found = notes.find((n) => n.id === id);
  if (!found) throw new Error(`Note "${id}" was not found.`);
  return found;
}

export const mockNotesService: NotesService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getNotes(signal?: AbortSignal): Promise<Note[]> {
    return withAbort(signal, notes.map(clone));
  },

  async getNote(id: string, signal?: AbortSignal): Promise<Note> {
    const found = requireNote(id);
    return withAbort(signal, clone(found), 200);
  },

  async createNote(input: NoteInput, signal?: AbortSignal): Promise<Note> {
    const now = new Date().toISOString();
    const created: Note = {
      id: nextId('note'),
      title: input.title,
      content: input.content,
      tags: [...input.tags],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    notes = [created, ...notes];
    return withAbort(signal, clone(created));
  },

  async updateNote(id: string, input: NoteInput, signal?: AbortSignal): Promise<Note> {
    const existing = requireNote(id);
    const updated: Note = {
      ...existing,
      title: input.title,
      content: input.content,
      tags: [...input.tags],
      updatedAt: new Date().toISOString(),
    };
    notes = notes.map((n) => (n.id === id ? updated : n));
    return withAbort(signal, clone(updated));
  },

  async deleteNote(id: string, signal?: AbortSignal): Promise<void> {
    requireNote(id);
    notes = notes.filter((n) => n.id !== id);
    return withAbort(signal, undefined);
  },

  async setPinned(id: string, pinned: boolean, signal?: AbortSignal): Promise<Note> {
    const existing = requireNote(id);
    const updated: Note = { ...existing, pinned, updatedAt: new Date().toISOString() };
    notes = notes.map((n) => (n.id === id ? updated : n));
    return withAbort(signal, clone(updated), 200);
  },
};
