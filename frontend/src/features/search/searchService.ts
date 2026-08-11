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
 *  - 'app'        → live nav destinations (Home/Chat/Voice/Automations/Settings/Knowledge/Intelligence/AI Apps)
 *  - 'automation' → the Automations mock dataset (Step 8)
 *  - 'chat'       → this browser's local recent Chat messages (Step 7)
 *  - 'knowledge'  → the Knowledge mock document set (Step 10)
 *  - 'ai-app'     → the AI Apps mock catalog (Step 11) — named, genuinely
 *                   searchable entities (app/connector names), not the
 *                   plugin/tool registry itself
 *  - 'note'       → the Notes mock/local dataset (Step 12) — user-authored
 *                   notes, searched by title/content
 *  - 'task'       → the Tasks mock/local dataset (Step 12) — user-authored
 *                   tasks, searched by title/description
 *  - 'calendar'   → the Calendar mock/local dataset (Step 12) — user-authored
 *                   events, searched by title/description/location
 *  - 'files'      → the Files mock/local dataset (Step 12) — file/folder
 *                   names only, not folder contents
 *  - 'room'       → the Smart Home mock room set (Step 13) — searched by name
 *  - 'device'     → the Smart Home mock device set (Step 13) — searched by
 *                   name/type
 *  - 'scene'      → the Smart Home mock scene set (Step 13) — searched by
 *                   name/description
 *  - 'memory'     → the Memory mock dataset (Step 16) — searched by content
 *                   only, honest local substring filtering, never
 *                   semantic/vector retrieval
 *  - 'agent'      → the Agents mock dataset (Step 17) — searched by
 *                   name/description only
 * Do not add a category until a real frontend surface/dataset backs it —
 * this is why Memory (formerly called out here as the example of something
 * NOT yet ready) only became a category once Step 16 actually built it.
 * Intelligence insights are deliberately NOT a search category — they are
 * Core-computed display content, not searchable named entities.
 */
export type SearchResultCategory =
  | 'app'
  | 'automation'
  | 'chat'
  | 'knowledge'
  | 'ai-app'
  | 'note'
  | 'task'
  | 'calendar'
  | 'files'
  | 'room'
  | 'device'
  | 'scene'
  | 'memory'
  | 'agent';

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
