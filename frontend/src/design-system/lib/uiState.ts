/**
 * Canonical UI-state vocabulary for every JARVIS surface.
 *
 * One shared language so modules, widgets and pages render loading/empty/error
 * (etc.) identically. This is presentation-only — it never talks to a backend.
 */
export type UIStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'unavailable'
  | 'coming-soon'
  | 'permission-denied'
  | 'reconnecting';

/** States that render their own placeholder instead of real content. */
export const PLACEHOLDER_STATUSES: readonly UIStatus[] = [
  'loading',
  'empty',
  'error',
  'unavailable',
  'coming-soon',
  'permission-denied',
  'reconnecting',
];

export function isPlaceholderStatus(status: UIStatus): boolean {
  return PLACEHOLDER_STATUSES.includes(status);
}

/** Result shape used by `useAsync` and any data-backed surface. */
export interface AsyncState<T> {
  status: UIStatus;
  data?: T;
  error?: string;
}
