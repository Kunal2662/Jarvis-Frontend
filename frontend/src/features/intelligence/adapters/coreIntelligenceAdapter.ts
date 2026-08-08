import {
  CoreIntelligenceContractUnavailableError,
  type Insight,
  type IntelligenceService,
} from '../intelligenceService';

/**
 * JARVIS Core intelligence adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core Intelligence API (M10B — fetch computed insights,
 * dismiss/acknowledge an insight, subscribe to new insights) is not yet
 * available. Per project rules we do NOT invent an endpoint. This adapter
 * is the plug point: once the Core intelligence contract is verified,
 * implement `getInsights` here (map Core → Insight types already defined
 * in intelligenceService.ts), set `ready: true`, and select it via
 * `VITE_INTELLIGENCE_BACKEND=core`. No IntelligencePage/UI change is
 * needed.
 *
 * See docs/CORE_INTELLIGENCE_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreIntelligenceContractUnavailableError().message);
  }
  throw new CoreIntelligenceContractUnavailableError();
}

export const coreIntelligenceService: IntelligenceService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getInsights(): Promise<Insight[]> {
    return unavailable();
  },
};
