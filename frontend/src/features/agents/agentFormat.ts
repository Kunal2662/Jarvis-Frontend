import type { AgentRunStatus, AgentStatus } from './agentService';

/** Shared, presentation-only formatting helpers for the Agents feature —
 *  mirrors automationFormat.ts. */

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

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  disabled: 'Disabled',
};

export const AGENT_STATUS_BADGE_VARIANT: Record<AgentStatus, 'success' | 'neutral' | 'outline'> = {
  active: 'success',
  idle: 'neutral',
  disabled: 'outline',
};

export const AGENT_RUN_STATUS_LABEL: Record<AgentRunStatus, string> = {
  completed: 'Completed',
  failed: 'Failed',
};

export const AGENT_RUN_STATUS_VARIANT: Record<AgentRunStatus, 'success' | 'danger'> = {
  completed: 'success',
  failed: 'danger',
};
