/**
 * Memory data seam — the transport-agnostic contract the Memory UI depends
 * on.
 *
 *   MemoryPage → memory state/presentation → MemoryService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Knowledge/Notes/Smart Home seams (Steps 10, 12, 13). JARVIS
 * Core owns memory formation and (eventually) semantic recall — this
 * frontend surface is a read-only browse/detail/forget surface only. There
 * is intentionally no create/edit-content method on this interface: a
 * memory represents something JARVIS itself formed from a conversation, not
 * something a user hand-authors here (see docs/CORE_MEMORY_CONTRACT_REQUIRED.md).
 * `forgetMemory` is the one write operation, and it is local-only in the
 * mock. Swapping the in-memory mock for a real JARVIS Core Memory API later
 * is a matter of implementing a new adapter and selecting it here — no UI
 * changes required. We do NOT invent a Core Memory endpoint; see
 * docs/CORE_MEMORY_CONTRACT_REQUIRED.md.
 */

/** What kind of thing JARVIS remembers. Kept small and honest — mirrors the
 *  example categories a memory system like this would realistically need,
 *  not an exhaustive taxonomy. */
export type MemoryType = 'Preference' | 'Context' | 'Device' | 'Routine' | 'Instruction';

/** Which real, already-built interactive surface this memory was formed
 *  from — never an invented ingestion pipeline. */
export type MemorySource = 'chat' | 'voice';

export type MemoryImportance = 'low' | 'medium' | 'high';

export interface Memory {
  id: string;
  /** Short, atomic remembered fact — never raw conversation transcript. */
  content: string;
  type: MemoryType;
  source: MemorySource;
  importance: MemoryImportance;
  /** ISO timestamp — when this memory was formed. */
  createdAt: string;
}

/**
 * The contract every Memory backend adapter must satisfy. Deliberately
 * read-only plus one delete — Core owns memory formation; this frontend
 * never authors or rewrites a memory's content (see module doc).
 */
export interface MemoryService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getMemories(signal?: AbortSignal): Promise<Memory[]>;
  getMemory(id: string, signal?: AbortSignal): Promise<Memory>;
  /** Permanently removes a memory. Local-only in the mock adapter. */
  forgetMemory(id: string, signal?: AbortSignal): Promise<void>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreMemoryContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core memory contract is not available yet.') {
    super(message);
    this.name = 'CoreMemoryContractUnavailableError';
  }
}

import { mockMemoryService } from './adapters/mockMemoryAdapter';
import { coreMemoryService } from './adapters/coreMemoryAdapter';

/**
 * Which backend feeds Memory. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_MEMORY_BACKEND=core` once
 * Claude Code has implemented + verified a Core memory adapter.
 */
const MEMORY_BACKEND = (import.meta.env.VITE_MEMORY_BACKEND as string | undefined) ?? 'mock';

export function getMemoryService(): MemoryService {
  return MEMORY_BACKEND === 'core' ? coreMemoryService : mockMemoryService;
}
