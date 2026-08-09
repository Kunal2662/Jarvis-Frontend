import type { Insight, IntelligenceService } from '../intelligenceService';

/**
 * Frontend static mock adapter for Intelligence. Returns a fixed, seeded
 * list of pre-computed insight objects — nothing here scores, ranks, or
 * otherwise "computes" an insight from other frontend data (that would
 * recreate Core's Intelligence Layer in React, which the roadmap explicitly
 * forbids). Simulates realistic network latency so loading states are
 * exercised (mirrors mockAutomationAdapter.ts / mockKnowledgeAdapter.ts). A
 * future Core adapter can replace this wholesale — no UI change required.
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

const insights: Insight[] = [
  {
    id: 'insight-1',
    title: '3 automations haven’t run in 2 weeks',
    description:
      'Smart Home Evening Routine, Backup Reminder, and Weekly Work Summary have no recent execution history. Review them if they are no longer needed.',
    category: 'automation',
    tone: 'warning',
    generatedAt: '2026-08-08T07:00:00-04:00',
    relatedPath: '/automations',
    relatedLabel: 'Review automations',
  },
  {
    id: 'insight-2',
    title: 'Frequently discussed topic this week: suit diagnostics',
    description:
      'Conversations this week referenced suit diagnostics more than any other topic, based on recent chat activity.',
    category: 'usage',
    tone: 'info',
    generatedAt: '2026-08-07T09:00:00-04:00',
    relatedPath: '/chat',
    relatedLabel: 'Open Chat',
  },
  {
    id: 'insight-3',
    title: 'Suggested automation based on your Chat activity',
    description:
      'You have asked for a workshop status summary several times this month. Consider turning this into a recurring automation.',
    category: 'suggestion',
    tone: 'suggestion',
    generatedAt: '2026-08-06T15:30:00-04:00',
    relatedPath: '/automations',
    relatedLabel: 'Create an automation',
  },
  {
    id: 'insight-4',
    title: 'System health checks have passed for 12 consecutive days',
    description: 'The Daily System Health Check automation has reported no anomalies since July 27.',
    category: 'system',
    tone: 'info',
    generatedAt: '2026-08-08T02:05:00-04:00',
    relatedPath: '/automations',
    relatedLabel: 'View automation',
  },
  {
    id: 'insight-5',
    title: 'New knowledge document ingested: Workshop Safety Checklist',
    description: 'A file source was added to your knowledge base and is now available to browse.',
    category: 'usage',
    tone: 'info',
    generatedAt: '2026-07-28T10:05:00-04:00',
    relatedPath: '/knowledge',
    relatedLabel: 'Browse Knowledge',
  },
];

function clone(insight: Insight): Insight {
  return JSON.parse(JSON.stringify(insight));
}

export const mockIntelligenceService: IntelligenceService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getInsights(signal?: AbortSignal): Promise<Insight[]> {
    return withAbort(signal, insights.map(clone));
  },
};
