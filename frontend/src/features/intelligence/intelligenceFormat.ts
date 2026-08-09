import type { InsightCategory, InsightTone } from './intelligenceService';

/** Shared, presentation-only formatting helpers for the Intelligence feature. */

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const TONE_LABEL: Record<InsightTone, string> = {
  info: 'Info',
  suggestion: 'Suggestion',
  warning: 'Attention',
};

export const TONE_BADGE_VARIANT: Record<InsightTone, 'info' | 'accent' | 'warning'> = {
  info: 'info',
  suggestion: 'accent',
  warning: 'warning',
};

export const CATEGORY_LABEL: Record<InsightCategory, string> = {
  automation: 'Automations',
  usage: 'Usage',
  system: 'System',
  suggestion: 'Suggestion',
};
