import type { KnowledgeSourceType } from './knowledgeService';

/** Shared, presentation-only formatting helpers for the Knowledge feature. */

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

export const SOURCE_LABEL: Record<KnowledgeSourceType, string> = {
  'chat-memory': 'Chat memory',
  file: 'File',
  note: 'Note',
  web: 'Web',
};

export const SOURCE_BADGE_VARIANT: Record<
  KnowledgeSourceType,
  'neutral' | 'accent' | 'info' | 'outline'
> = {
  'chat-memory': 'accent',
  file: 'neutral',
  note: 'outline',
  web: 'info',
};
