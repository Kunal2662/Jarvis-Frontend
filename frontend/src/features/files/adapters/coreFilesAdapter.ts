import {
  CoreFilesContractUnavailableError,
  type CreateFolderInput,
  type FileEntry,
  type FilesService,
  type UploadFileInput,
} from '../filesService';

/**
 * JARVIS Core files adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core files/workspace contract (list/get/create-folder/
 * delete/upload, plus real storage for file bytes, owned by JARVIS Core M11
 * — Intelligent Workspace & Productivity, which is only 🟡 Active/Not fully
 * closed on the Core side) is not yet available. Per project rules we do NOT
 * invent an endpoint. This adapter is the plug point: once the Core files
 * contract is verified, implement each method here (map Core → FileEntry
 * types), set `ready: true`, and select it via `VITE_FILES_BACKEND=core`.
 * No FilesPage/UI change is needed.
 *
 * See docs/CORE_FILES_CONTRACT_REQUIRED.md for exactly what must be
 * provided, including the real storage/upload contract this mock has none
 * of.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreFilesContractUnavailableError().message);
  }
  throw new CoreFilesContractUnavailableError();
}

export const coreFilesService: FilesService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getFiles(_folderId?: string): Promise<FileEntry[]> {
    return unavailable();
  },
  async getFile(): Promise<FileEntry> {
    return unavailable();
  },
  async createFolder(_input: CreateFolderInput): Promise<FileEntry> {
    return unavailable();
  },
  async deleteFile(): Promise<void> {
    return unavailable();
  },
  async uploadFile(_input: UploadFileInput): Promise<FileEntry> {
    return unavailable();
  },
};
