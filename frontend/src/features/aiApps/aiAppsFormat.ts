import type { AiAppCategory, AiAppConnectionStatus } from './aiAppsService';

/** Shared, presentation-only formatting helpers for the AI Apps feature. */

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

export const CATEGORY_LABEL: Record<AiAppCategory, string> = {
  'mcp-tool': 'MCP Tool',
  connector: 'Connector',
};

export const CATEGORY_BADGE_VARIANT: Record<AiAppCategory, 'accent' | 'info'> = {
  'mcp-tool': 'accent',
  connector: 'info',
};

export const STATUS_LABEL: Record<AiAppConnectionStatus, string> = {
  connected: 'Connected',
  not_connected: 'Not connected',
  unavailable: 'Unavailable',
};

export const STATUS_BADGE_VARIANT: Record<AiAppConnectionStatus, 'success' | 'neutral' | 'outline'> = {
  connected: 'success',
  not_connected: 'neutral',
  unavailable: 'outline',
};
