import type { TaskPriority, TaskStatus } from './tasksService';

/** Shared, presentation-only formatting helpers for the Tasks feature. */

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  // Date-only strings ("2026-08-12") parse as UTC midnight — format in UTC so
  // the displayed day never shifts a day earlier in negative-offset zones.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function isOverdue(task: { status: TaskStatus; dueDate?: string }): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  const due = new Date(`${task.dueDate}T23:59:59`);
  return due.getTime() < Date.now();
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

export const STATUS_BADGE_VARIANT: Record<TaskStatus, 'neutral' | 'accent' | 'success'> = {
  todo: 'neutral',
  'in-progress': 'accent',
  done: 'success',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_BADGE_VARIANT: Record<TaskPriority, 'outline' | 'warning' | 'danger'> = {
  low: 'outline',
  medium: 'warning',
  high: 'danger',
};

/** The status a task moves to when its detail-drawer primary action fires —
 *  mirrors AutomationDetailDrawer's pause/resume single dynamic action. */
export function nextStatus(status: TaskStatus): TaskStatus {
  if (status === 'todo') return 'in-progress';
  if (status === 'in-progress') return 'done';
  return 'todo';
}

export const NEXT_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Start',
  'in-progress': 'Mark done',
  done: 'Reopen',
};
