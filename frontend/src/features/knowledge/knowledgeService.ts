/**
 * Knowledge data seam — the transport-agnostic contract the Knowledge UI
 * depends on.
 *
 *   KnowledgePage → knowledge state/presentation → KnowledgeService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Search seams (Steps 4-9). JARVIS
 * Core owns Knowledge ingestion (M10A Universal Search & Knowledge
 * Platform) — this frontend surface is a READ-ONLY browse/consume surface
 * only. There is intentionally no create/upload/edit method on this
 * interface: adding one would mean recreating Core's ingestion pipeline in
 * React. Swapping the local mock for a real JARVIS Core Knowledge API later
 * is a matter of implementing a new adapter and selecting it here — no UI
 * changes required. We do NOT invent Core endpoints; see
 * docs/CORE_KNOWLEDGE_CONTRACT_REQUIRED.md.
 */

/**
 * Where a knowledge item originated. Kept deliberately small — only the
 * sources this frontend can honestly represent from mock/local data.
 */
export type KnowledgeSourceType = 'chat-memory' | 'file' | 'note' | 'web';

export interface KnowledgeItem {
  id: string;
  title: string;
  /** Short summary shown in list rows and search results. */
  snippet: string;
  /** Full body shown in the detail view. Mock/local content only. */
  content: string;
  sourceType: KnowledgeSourceType;
  tags: string[];
  /** ISO timestamp — when this item was last ingested/updated. */
  updatedAt: string;
}

/**
 * The contract every knowledge backend adapter must satisfy. Deliberately
 * read-only (list + get) — Core owns ingestion/indexing.
 */
export interface KnowledgeService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getKnowledgeItems(signal?: AbortSignal): Promise<KnowledgeItem[]>;
  getKnowledgeItem(id: string, signal?: AbortSignal): Promise<KnowledgeItem>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreKnowledgeContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core knowledge contract is not available yet.') {
    super(message);
    this.name = 'CoreKnowledgeContractUnavailableError';
  }
}

import { mockKnowledgeService } from './adapters/mockKnowledgeAdapter';
import { coreKnowledgeService } from './adapters/coreKnowledgeAdapter';

/**
 * Which backend feeds Knowledge. Defaults to the frontend in-memory mock
 * (Core APIs are not required for this step). Set `VITE_KNOWLEDGE_BACKEND=core`
 * once Claude Code has implemented + verified a Core knowledge adapter.
 */
const KNOWLEDGE_BACKEND =
  (import.meta.env.VITE_KNOWLEDGE_BACKEND as string | undefined) ?? 'mock';

export function getKnowledgeService(): KnowledgeService {
  return KNOWLEDGE_BACKEND === 'core' ? coreKnowledgeService : mockKnowledgeService;
}
