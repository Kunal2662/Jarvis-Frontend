/**
 * Notes data seam — the transport-agnostic contract the Notes UI depends on.
 *
 *   NotesPage → note state/presentation → NotesService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Knowledge/AI Apps seams (Steps 4-11).
 * Unlike Knowledge (a read-only Core-ingested browse surface), Notes is
 * user-authored content — the frontend owns full CRUD here, the same shape as
 * Automations (Step 8). Swapping the in-memory mock for a real JARVIS Core
 * Notes API later is a matter of implementing a new adapter and selecting it
 * here — no UI changes required. We do NOT invent Core endpoints; see
 * docs/CORE_NOTES_CONTRACT_REQUIRED.md.
 */

export interface Note {
  id: string;
  title: string;
  /** Plain multiline text — intentionally not rich text/Markdown. */
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fields the create/edit form collects. Pin state is toggled separately
 *  (mirrors how AutomationInput excludes `enabled`, toggled via setEnabled). */
export interface NoteInput {
  title: string;
  content: string;
  tags: string[];
}

/**
 * The contract every notes backend adapter must satisfy.
 */
export interface NotesService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getNotes(signal?: AbortSignal): Promise<Note[]>;
  getNote(id: string, signal?: AbortSignal): Promise<Note>;
  createNote(input: NoteInput, signal?: AbortSignal): Promise<Note>;
  updateNote(id: string, input: NoteInput, signal?: AbortSignal): Promise<Note>;
  deleteNote(id: string, signal?: AbortSignal): Promise<void>;
  setPinned(id: string, pinned: boolean, signal?: AbortSignal): Promise<Note>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreNotesContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core notes contract is not available yet.') {
    super(message);
    this.name = 'CoreNotesContractUnavailableError';
  }
}

import { mockNotesService } from './adapters/mockNotesAdapter';
import { coreNotesService } from './adapters/coreNotesAdapter';

/**
 * Which backend feeds Notes. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_NOTES_BACKEND=core` once
 * Claude Code has implemented + verified a Core notes adapter.
 */
const NOTES_BACKEND = (import.meta.env.VITE_NOTES_BACKEND as string | undefined) ?? 'mock';

export function getNotesService(): NotesService {
  return NOTES_BACKEND === 'core' ? coreNotesService : mockNotesService;
}
