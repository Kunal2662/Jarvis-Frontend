/**
 * Intelligence data seam — the transport-agnostic contract the Intelligence
 * UI depends on.
 *
 *   IntelligencePage → insight presentation → IntelligenceService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Search/Knowledge seams (Steps
 * 4-10). JARVIS Core owns computing insights (M10B Intelligence Layer) —
 * this frontend surface is a READ-ONLY display/consume surface only. Per
 * the roadmap ("do not recreate Search or Intelligence logic in React"),
 * this interface intentionally has no scoring/ranking/NLP method — an
 * adapter returns a finished list of pre-computed insight objects and the
 * UI only renders what it is given. Swapping the local mock for a real
 * JARVIS Core Intelligence API later is a matter of implementing a new
 * adapter and selecting it here — no UI changes required. We do NOT invent
 * Core endpoints; see docs/CORE_INTELLIGENCE_CONTRACT_REQUIRED.md.
 */

/** Broad grouping for an insight. Kept small and generic — Core owns the
 *  real taxonomy once a contract exists. */
export type InsightCategory = 'automation' | 'usage' | 'system' | 'suggestion';

/** Presentation tone — never conveyed by color alone in the UI. */
export type InsightTone = 'info' | 'suggestion' | 'warning';

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  tone: InsightTone;
  /** ISO timestamp of when this (mock) insight was generated. */
  generatedAt: string;
  /** Optional related frontend route this insight points at (display-only navigation). */
  relatedPath?: string;
  /** Label for the related-path link, e.g. "Review automations". */
  relatedLabel?: string;
}

/**
 * The contract every intelligence backend adapter must satisfy. Deliberately
 * read-only (list only) and free of any client-side computation — Core owns
 * generating insights.
 */
export interface IntelligenceService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getInsights(signal?: AbortSignal): Promise<Insight[]>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreIntelligenceContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core intelligence contract is not available yet.') {
    super(message);
    this.name = 'CoreIntelligenceContractUnavailableError';
  }
}

import { mockIntelligenceService } from './adapters/mockIntelligenceAdapter';
import { coreIntelligenceService } from './adapters/coreIntelligenceAdapter';

/**
 * Which backend feeds Intelligence. Defaults to the frontend static mock
 * (Core APIs are not required for this step). Set
 * `VITE_INTELLIGENCE_BACKEND=core` once Claude Code has implemented +
 * verified a Core intelligence adapter.
 */
const INTELLIGENCE_BACKEND =
  (import.meta.env.VITE_INTELLIGENCE_BACKEND as string | undefined) ?? 'mock';

export function getIntelligenceService(): IntelligenceService {
  return INTELLIGENCE_BACKEND === 'core' ? coreIntelligenceService : mockIntelligenceService;
}
