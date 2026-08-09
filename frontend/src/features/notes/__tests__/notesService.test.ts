import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoteInput, NotesService } from '../notesService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its dataset in module-level state).
async function freshMockService(): Promise<NotesService> {
  vi.resetModules();
  const mod = await import('../adapters/mockNotesAdapter');
  return mod.mockNotesService;
}

const sampleInput: NoteInput = {
  title: 'Test note',
  content: 'Created in a test',
  tags: ['test', 'sample'],
};

describe('notes service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getNotesService } = await import('../notesService');
    const { mockNotesService } = await import('../adapters/mockNotesAdapter');
    expect(getNotesService()).toBe(mockNotesService);
    expect(mockNotesService.id).toBe('mock');
    expect(mockNotesService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreNotesService } = await import('../adapters/coreNotesAdapter');
    expect(coreNotesService.id).toBe('core');
    expect(coreNotesService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreNotesService } = await import('../adapters/coreNotesAdapter');
    const { CoreNotesContractUnavailableError } = await import('../notesService');
    await expect(coreNotesService.getNotes()).rejects.toBeInstanceOf(CoreNotesContractUnavailableError);
    await expect(coreNotesService.getNote('x')).rejects.toBeInstanceOf(CoreNotesContractUnavailableError);
    await expect(coreNotesService.createNote(sampleInput)).rejects.toBeInstanceOf(
      CoreNotesContractUnavailableError,
    );
    await expect(coreNotesService.updateNote('x', sampleInput)).rejects.toBeInstanceOf(
      CoreNotesContractUnavailableError,
    );
    await expect(coreNotesService.deleteNote('x')).rejects.toBeInstanceOf(CoreNotesContractUnavailableError);
    await expect(coreNotesService.setPinned('x', true)).rejects.toBeInstanceOf(
      CoreNotesContractUnavailableError,
    );
  });

  it('seeds 5 realistic notes, some pinned and some not', async () => {
    const service = await freshMockService();
    const notes = await service.getNotes();
    expect(notes).toHaveLength(5);
    const pinned = notes.filter((n) => n.pinned);
    const unpinned = notes.filter((n) => !n.pinned);
    expect(pinned.length).toBeGreaterThan(0);
    expect(unpinned.length).toBeGreaterThan(0);
  });

  it('getNote returns a single note', async () => {
    const service = await freshMockService();
    const note = await service.getNote('note-1');
    expect(note.title).toBe('Ideas for Voice Orb redesign');
    expect(note.tags).toContain('design');
  });

  it('getNote rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getNote('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('createNote adds a new, unpinned note', async () => {
    const service = await freshMockService();
    const created = await service.createNote(sampleInput);
    expect(created.title).toBe('Test note');
    expect(created.pinned).toBe(false);
    expect(created.tags).toEqual(['test', 'sample']);
    expect(created.createdAt).toBe(created.updatedAt);

    const all = await service.getNotes();
    expect(all.find((n) => n.id === created.id)).toBeTruthy();
    expect(all).toHaveLength(6);
  });

  it('updateNote overwrites the editable fields without touching pinned state', async () => {
    const service = await freshMockService();
    const pinnedBefore = await service.getNote('note-1');
    expect(pinnedBefore.pinned).toBe(true);

    const updated = await service.updateNote('note-1', { ...sampleInput, title: 'Renamed note' });
    expect(updated.title).toBe('Renamed note');
    expect(updated.pinned).toBe(true);
  });

  it('deleteNote removes the note from subsequent listings', async () => {
    const service = await freshMockService();
    const created = await service.createNote(sampleInput);
    await service.deleteNote(created.id);
    const all = await service.getNotes();
    expect(all.find((n) => n.id === created.id)).toBeUndefined();
    expect(all).toHaveLength(5);
  });

  it('deleteNote rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.deleteNote('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('setPinned(true) pins and setPinned(false) unpins', async () => {
    const service = await freshMockService();
    const pinned = await service.setPinned('note-3', true);
    expect(pinned.pinned).toBe(true);

    const unpinned = await service.setPinned('note-3', false);
    expect(unpinned.pinned).toBe(false);
  });
});
