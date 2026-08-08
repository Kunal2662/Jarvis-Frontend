/**
 * Universal Search seam — the transport-agnostic contract the Search UI
 * depends on.
 *
 *   UniversalSearch → search state/presentation → SearchService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations seams (Steps 4-6, 8). The UI never
 * ranks, filters or otherwise "does search" itself — it only renders whatever
 * grouped results this interface returns. Swapping the client-side mock for a
 * real JARVIS Core search API later is a matter of implementing a new adapter
 * and selecting it here — no UI changes required. We do NOT invent a Core
 * search endpoint; see docs/CORE_SEARCH_CONTRACT_REQUIRED.md.
 */

/**
 * Domains this frontend can actually search today. Kept deliberately small —
 * only surfaces with real, existing data are represented:
 *  - 'app'        → live nav destinations (Home/Chat/Voice/Automations/Settings/Knowledge/Intelligence)
 *  - 'automation' → the Automations mock dataset (Step 8)
 *  - 'chat'       → this browser's local recent Chat messages (Step 7)
 *  - 'knowledge'  → the Knowledge mock document set (Step 10)
 * Do not add a category (e.g. Files, Memory, Smart Home) until a real
 * frontend surface/dataset backs it. Intelligence insights are deliberately
 * NOT a search category — they are Core-computed display content, not
 * searchable named entities.
 */
export type SearchResultCategory = 'app' | 'automation' | 'chat' | 'knowledge';

export interface SearchResult {
  id: string;
  category: SearchResultCategory;
  title: string;
  description?: string;
  /** Route to navigate to on selection. */
  path: string;
  /** Optional react-router location state (e.g. to pre-select a detail view). */
  navState?: Record<string, unknown>;
  /** Overlay/action instead of navigation — mirrors `ModuleDef.action`. */
  action?: 'voice';
}

export interface SearchResultGroup {
  category: SearchResultCategory;
  /** Human-readable group heading, e.g. "Automations". */
  label: string;
  results: SearchResult[];
}

export interface SearchQuery {
  query: string;
}

/**
 * The contract every search backend adapter must satisfy. Adapters return
 * results already grouped/categorized — the UI only renders what it is
 * given. No ranking or "intelligence" is implemented in React.
 */
export interface SearchService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  search(query: string, signal?: AbortSignal): Promise<SearchResultGroup[]>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreSearchContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core search contract is not available yet.') {
    super(message);
    this.name = 'CoreSearchContractUnavailableError';
  }
}

import { mockSearchService } from './adapters/mockSearchAdapter';
import { coreSearchService } from './adapters/coreSearchAdapter';

/**
 * Which backend feeds Universal Search. Defaults to the frontend client-side
 * mock (Core APIs are not required for this step). Set `VITE_SEARCH_BACKEND=core`
 * once Claude Code has implemented + verified a Core search adapter.
 */
const SEARCH_BACKEND = (import.meta.env.VITE_SEARCH_BACKEND as string | undefined) ?? 'mock';

export function getSearchService(): SearchService {
  return SEARCH_BACKEND === 'core' ? coreSearchService : mockSearchService;
}
