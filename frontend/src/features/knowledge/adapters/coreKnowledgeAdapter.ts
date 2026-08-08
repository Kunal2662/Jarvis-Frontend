import {
  CoreKnowledgeContractUnavailableError,
  type KnowledgeItem,
  type KnowledgeService,
} from '../knowledgeService';

/**
 * JARVIS Core knowledge adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core Knowledge API (M10A — query/browse/retrieve
 * ingested knowledge items, source types, tags, pagination, auth) is not
 * yet available. Per project rules we do NOT invent an endpoint. This
 * adapter is the plug point: once the Core knowledge contract is verified,
 * implement each method here (map Core → KnowledgeItem types already
 * defined in knowledgeService.ts), set `ready: true`, and select it via
 * `VITE_KNOWLEDGE_BACKEND=core`. No KnowledgePage/UI change is needed.
 *
 * See docs/CORE_KNOWLEDGE_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreKnowledgeContractUnavailableError().message);
  }
  throw new CoreKnowledgeContractUnavailableError();
}

export const coreKnowledgeService: KnowledgeService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getKnowledgeItems(): Promise<KnowledgeItem[]> {
    return unavailable();
  },
  async getKnowledgeItem(): Promise<KnowledgeItem> {
    return unavailable();
  },
};
