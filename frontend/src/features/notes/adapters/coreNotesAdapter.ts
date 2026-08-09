import {
  CoreNotesContractUnavailableError,
  type Note,
  type NoteInput,
  type NotesService,
} from '../notesService';

/**
 * JARVIS Core notes adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core notes contract (list/get/create/update/delete/pin,
 * owned by JARVIS Core M11 — Intelligent Workspace & Productivity, which is
 * only 🟡 Active/Not fully closed on the Core side) is not yet available.
 * Per project rules we do NOT invent an endpoint. This adapter is the plug
 * point: once the Core notes contract is verified, implement each method
 * here (map Core → Note types), set `ready: true`, and select it via
 * `VITE_NOTES_BACKEND=core`. No NotesPage/UI change is needed.
 *
 * See docs/CORE_NOTES_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreNotesContractUnavailableError().message);
  }
  throw new CoreNotesContractUnavailableError();
}

export const coreNotesService: NotesService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getNotes(): Promise<Note[]> {
    return unavailable();
  },
  async getNote(): Promise<Note> {
    return unavailable();
  },
  async createNote(_input: NoteInput): Promise<Note> {
    return unavailable();
  },
  async updateNote(_id: string, _input: NoteInput): Promise<Note> {
    return unavailable();
  },
  async deleteNote(): Promise<void> {
    return unavailable();
  },
  async setPinned(): Promise<Note> {
    return unavailable();
  },
};
