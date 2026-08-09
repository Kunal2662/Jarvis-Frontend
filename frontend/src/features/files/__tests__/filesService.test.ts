import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FilesService } from '../filesService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its dataset in module-level state).
async function freshMockService(): Promise<FilesService> {
  vi.resetModules();
  const mod = await import('../adapters/mockFilesAdapter');
  return mod.mockFilesService;
}

describe('files service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getFilesService } = await import('../filesService');
    const { mockFilesService } = await import('../adapters/mockFilesAdapter');
    expect(getFilesService()).toBe(mockFilesService);
    expect(mockFilesService.id).toBe('mock');
    expect(mockFilesService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreFilesService } = await import('../adapters/coreFilesAdapter');
    expect(coreFilesService.id).toBe('core');
    expect(coreFilesService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreFilesService } = await import('../adapters/coreFilesAdapter');
    const { CoreFilesContractUnavailableError } = await import('../filesService');
    await expect(coreFilesService.getFiles()).rejects.toBeInstanceOf(CoreFilesContractUnavailableError);
    await expect(coreFilesService.getFile('x')).rejects.toBeInstanceOf(CoreFilesContractUnavailableError);
    await expect(coreFilesService.createFolder({ name: 'x' })).rejects.toBeInstanceOf(
      CoreFilesContractUnavailableError,
    );
    await expect(coreFilesService.deleteFile('x')).rejects.toBeInstanceOf(CoreFilesContractUnavailableError);
    await expect(
      coreFilesService.uploadFile({ name: 'x', mimeType: 'text/plain', sizeBytes: 10 }),
    ).rejects.toBeInstanceOf(CoreFilesContractUnavailableError);
  });

  it('seeds a small root-level folder/file structure', async () => {
    const service = await freshMockService();
    const root = await service.getFiles();
    expect(root.length).toBeGreaterThanOrEqual(4);
    expect(root.some((e) => e.type === 'folder')).toBe(true);
    expect(root.some((e) => e.type === 'file')).toBe(true);
  });

  it('getFiles(folderId) scopes results to that folder\'s direct children', async () => {
    const service = await freshMockService();
    const root = await service.getFiles();
    const documents = root.find((e) => e.name === 'Documents' && e.type === 'folder');
    expect(documents).toBeTruthy();

    const children = await service.getFiles(documents!.id);
    expect(children.length).toBeGreaterThan(0);
    expect(children.every((e) => e.parentId === documents!.id)).toBe(true);
  });

  it('getFile returns a single entry (file or folder)', async () => {
    const service = await freshMockService();
    const entry = await service.getFile('folder-1');
    expect(entry.name).toBe('Documents');
    expect(entry.type).toBe('folder');
  });

  it('getFile rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getFile('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('createFolder adds a new folder at the given parent', async () => {
    const service = await freshMockService();
    const before = await service.getFiles();
    const created = await service.createFolder({ name: 'Receipts' });
    expect(created.type).toBe('folder');
    expect(created.name).toBe('Receipts');

    const after = await service.getFiles();
    expect(after).toHaveLength(before.length + 1);
    expect(after.find((e) => e.id === created.id)).toBeTruthy();
  });

  it('uploadFile is a mock-only metadata action — it adds a file entry without touching real bytes', async () => {
    const service = await freshMockService();
    const created = await service.uploadFile({ name: 'Notes.txt', mimeType: 'text/plain', sizeBytes: 1234 });
    expect(created.type).toBe('file');
    expect(created.mimeType).toBe('text/plain');
    expect(created.sizeBytes).toBe(1234);

    const root = await service.getFiles();
    expect(root.find((e) => e.id === created.id)).toBeTruthy();
  });

  it('deleteFile removes a leaf file from subsequent listings', async () => {
    const service = await freshMockService();
    const before = await service.getFiles();
    const file = before.find((e) => e.type === 'file')!;
    await service.deleteFile(file.id);
    const after = await service.getFiles();
    expect(after.find((e) => e.id === file.id)).toBeUndefined();
  });

  it('deleteFile on a folder cascades to delete everything inside it', async () => {
    const service = await freshMockService();
    const root = await service.getFiles();
    const documents = root.find((e) => e.name === 'Documents' && e.type === 'folder')!;
    const childrenBefore = await service.getFiles(documents.id);
    expect(childrenBefore.length).toBeGreaterThan(0);

    await service.deleteFile(documents.id);

    const rootAfter = await service.getFiles();
    expect(rootAfter.find((e) => e.id === documents.id)).toBeUndefined();

    for (const child of childrenBefore) {
      await expect(service.getFile(child.id)).rejects.toThrow(/not found/i);
    }
  });

  it('deleteFile rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.deleteFile('does-not-exist')).rejects.toThrow(/not found/i);
  });
});
