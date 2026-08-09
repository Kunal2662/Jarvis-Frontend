/**
 * Files data seam — the transport-agnostic contract the Files UI depends on.
 *
 *   FilesPage → file/folder state/presentation → FilesService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Notes/Tasks/Calendar seams (Steps
 * 4-8, 12). Real storage does not exist on this frontend today — there is no
 * backend to hold file bytes. `uploadFile` is an explicitly mock, local-only
 * "add a file" action: it creates a metadata-only entry (name/type/size) and
 * never touches real file bytes. No preview/viewer is implemented — this is
 * a metadata browser only. Swapping the in-memory mock for a real JARVIS
 * Core Files API later is a matter of implementing a new adapter and
 * selecting it here — no UI changes required. We do NOT invent Core
 * endpoints; see docs/CORE_FILES_CONTRACT_REQUIRED.md.
 */

export type FileEntryType = 'file' | 'folder';

export interface FileEntry {
  id: string;
  name: string;
  type: FileEntryType;
  /** Files only. */
  mimeType?: string;
  /** Files only. */
  sizeBytes?: number;
  /** Containing folder id. Undefined/omitted means it lives at the root. */
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields the "New folder" form collects. */
export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

/** Fields the mock "Add file" action collects — metadata only, never real
 *  bytes; see the module doc comment above. */
export interface UploadFileInput {
  name: string;
  mimeType: string;
  sizeBytes: number;
  parentId?: string;
}

/**
 * The contract every files backend adapter must satisfy.
 */
export interface FilesService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  /** Children of `folderId` (root entries when omitted). */
  getFiles(folderId?: string, signal?: AbortSignal): Promise<FileEntry[]>;
  getFile(id: string, signal?: AbortSignal): Promise<FileEntry>;
  createFolder(input: CreateFolderInput, signal?: AbortSignal): Promise<FileEntry>;
  /** Deletes a file OR a folder (and, for a folder, everything inside it). */
  deleteFile(id: string, signal?: AbortSignal): Promise<void>;
  /** Mock-only "add a file" action — see the module doc comment. */
  uploadFile(input: UploadFileInput, signal?: AbortSignal): Promise<FileEntry>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreFilesContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core files contract is not available yet.') {
    super(message);
    this.name = 'CoreFilesContractUnavailableError';
  }
}

import { mockFilesService } from './adapters/mockFilesAdapter';
import { coreFilesService } from './adapters/coreFilesAdapter';

/**
 * Which backend feeds Files. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_FILES_BACKEND=core` once
 * Claude Code has implemented + verified a Core files adapter.
 */
const FILES_BACKEND = (import.meta.env.VITE_FILES_BACKEND as string | undefined) ?? 'mock';

export function getFilesService(): FilesService {
  return FILES_BACKEND === 'core' ? coreFilesService : mockFilesService;
}
