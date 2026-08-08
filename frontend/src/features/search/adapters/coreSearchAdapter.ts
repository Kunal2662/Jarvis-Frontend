import {
  CoreSearchContractUnavailableError,
  type SearchResultGroup,
  type SearchService,
} from '../searchService';

/**
 * JARVIS Core search adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core Search API (query endpoint, ranking, cross-domain
 * corpus spanning Knowledge/Files/Memory/Automations/Chat history, auth,
 * pagination) is not yet available. Per project rules we do NOT invent an
 * endpoint. This adapter is the plug point: once the Core search contract is
 * verified, implement `search` here (map Core → SearchResult/SearchResultGroup
 * types already defined in searchService.ts), set `ready: true`, and select it
 * via `VITE_SEARCH_BACKEND=core`. No UniversalSearch/UI change is needed.
 *
 * See docs/CORE_SEARCH_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreSearchContractUnavailableError().message);
  }
  throw new CoreSearchContractUnavailableError();
}

export const coreSearchService: SearchService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async search(): Promise<SearchResultGroup[]> {
    return unavailable();
  },
};
