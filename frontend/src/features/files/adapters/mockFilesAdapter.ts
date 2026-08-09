import type { CreateFolderInput, FileEntry, FilesService, UploadFileInput } from '../filesService';

/**
 * Frontend in-memory mock adapter for Files. All mock data + mutation logic
 * lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state
 * so the UI is fully interactive (not static). A future Core adapter can
 * replace this wholesale — no UI change required. Mirrors
 * mockNotesAdapter.ts / mockTasksAdapter.ts / mockCalendarAdapter.ts's
 * shape/style.
 *
 * This is metadata only — no real file bytes exist anywhere in this
 * frontend. `uploadFile` fabricates a plausible size/mime type; it never
 * reads or stores an actual file.
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

let entries: FileEntry[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    parentId: undefined,
    createdAt: '2026-06-01T09:00:00-04:00',
    updatedAt: '2026-06-01T09:00:00-04:00',
  },
  {
    id: 'folder-2',
    name: 'Pictures',
    type: 'folder',
    parentId: undefined,
    createdAt: '2026-06-01T09:00:00-04:00',
    updatedAt: '2026-06-01T09:00:00-04:00',
  },
  {
    id: 'folder-3',
    name: 'Projects',
    type: 'folder',
    parentId: undefined,
    createdAt: '2026-06-05T09:00:00-04:00',
    updatedAt: '2026-06-05T09:00:00-04:00',
  },
  {
    id: 'file-1',
    name: 'Household budget.xlsx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 48_213,
    parentId: undefined,
    createdAt: '2026-07-02T10:00:00-04:00',
    updatedAt: '2026-08-01T08:15:00-04:00',
  },
  {
    id: 'file-2',
    name: 'Welcome to JARVIS.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    sizeBytes: 214_980,
    parentId: undefined,
    createdAt: '2026-05-10T09:00:00-04:00',
    updatedAt: '2026-05-10T09:00:00-04:00',
  },
  {
    id: 'file-3',
    name: 'Lease agreement.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    sizeBytes: 1_248_500,
    parentId: 'folder-1',
    createdAt: '2026-04-20T14:00:00-04:00',
    updatedAt: '2026-04-20T14:00:00-04:00',
  },
  {
    id: 'file-4',
    name: 'Insurance policy.docx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 87_340,
    parentId: 'folder-1',
    createdAt: '2026-03-15T11:00:00-04:00',
    updatedAt: '2026-06-18T16:00:00-04:00',
  },
  {
    id: 'file-5',
    name: 'Workshop setup.png',
    type: 'file',
    mimeType: 'image/png',
    sizeBytes: 3_540_112,
    parentId: 'folder-2',
    createdAt: '2026-07-11T19:00:00-04:00',
    updatedAt: '2026-07-11T19:00:00-04:00',
  },
  {
    id: 'file-6',
    name: 'Family trip.jpg',
    type: 'file',
    mimeType: 'image/jpeg',
    sizeBytes: 2_875_640,
    parentId: 'folder-2',
    createdAt: '2026-07-30T21:00:00-04:00',
    updatedAt: '2026-07-30T21:00:00-04:00',
  },
  {
    id: 'file-7',
    name: 'Voice UI redesign notes.docx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 32_768,
    parentId: 'folder-3',
    createdAt: '2026-08-02T10:00:00-04:00',
    updatedAt: '2026-08-06T09:30:00-04:00',
  },
  {
    id: 'file-8',
    name: 'Suit fabrication schematic.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    sizeBytes: 4_205_760,
    parentId: 'folder-3',
    createdAt: '2026-06-22T13:00:00-04:00',
    updatedAt: '2026-06-22T13:00:00-04:00',
  },
];

function clone(e: FileEntry): FileEntry {
  return { ...e };
}

function requireEntry(id: string): FileEntry {
  const found = entries.find((e) => e.id === id);
  if (!found) throw new Error(`File "${id}" was not found.`);
  return found;
}

/** All descendant ids of a folder, recursively (used so deleting a folder
 *  removes everything inside it rather than leaving orphaned entries). */
function descendantIds(folderId: string): string[] {
  const direct = entries.filter((e) => e.parentId === folderId).map((e) => e.id);
  return direct.flatMap((id) => [id, ...descendantIds(id)]);
}

export const mockFilesService: FilesService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getFiles(folderId?: string, signal?: AbortSignal): Promise<FileEntry[]> {
    const children = entries.filter((e) => e.parentId === folderId).map(clone);
    return withAbort(signal, children);
  },

  async getFile(id: string, signal?: AbortSignal): Promise<FileEntry> {
    const found = requireEntry(id);
    return withAbort(signal, clone(found), 200);
  },

  async createFolder(input: CreateFolderInput, signal?: AbortSignal): Promise<FileEntry> {
    const now = new Date().toISOString();
    const created: FileEntry = {
      id: nextId('folder'),
      name: input.name,
      type: 'folder',
      parentId: input.parentId,
      createdAt: now,
      updatedAt: now,
    };
    entries = [...entries, created];
    return withAbort(signal, clone(created));
  },

  async deleteFile(id: string, signal?: AbortSignal): Promise<void> {
    const target = requireEntry(id);
    const toRemove = new Set([id, ...(target.type === 'folder' ? descendantIds(id) : [])]);
    entries = entries.filter((e) => !toRemove.has(e.id));
    return withAbort(signal, undefined);
  },

  async uploadFile(input: UploadFileInput, signal?: AbortSignal): Promise<FileEntry> {
    const now = new Date().toISOString();
    const created: FileEntry = {
      id: nextId('file'),
      name: input.name,
      type: 'file',
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      parentId: input.parentId,
      createdAt: now,
      updatedAt: now,
    };
    entries = [...entries, created];
    return withAbort(signal, clone(created));
  },
};
