import type { AutomationStatus, ExecutionStatus } from './automationService';

/** Shared, presentation-only formatting helpers for the Automations feature. */

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

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const STATUS_LABEL: Record<AutomationStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  failed: 'Failed',
  disabled: 'Disabled',
};

export const STATUS_BADGE_VARIANT: Record<AutomationStatus, 'success' | 'neutral' | 'danger' | 'outline'> = {
  active: 'success',
  paused: 'neutral',
  failed: 'danger',
  disabled: 'outline',
};

export const EXECUTION_STATUS_LABEL: Record<ExecutionStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  running: 'Running',
};

export const EXECUTION_STATUS_VARIANT: Record<ExecutionStatus, 'success' | 'danger' | 'accent'> = {
  success: 'success',
  failed: 'danger',
  running: 'accent',
};
