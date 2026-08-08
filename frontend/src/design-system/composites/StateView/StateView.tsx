import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Ban,
  Construction,
  Inbox,
  PlugZap,
  WifiOff,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { isPlaceholderStatus, type UIStatus } from '../../lib/uiState';
import { Spinner } from '../../primitives/Spinner/Spinner';
import { Button } from '../../primitives/Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';

interface StatePreset {
  icon: ReactNode;
  title: string;
  description?: string;
}

/** Sensible, overridable defaults so every surface speaks the same language. */
const PRESETS: Partial<Record<UIStatus, StatePreset>> = {
  empty: { icon: <Inbox />, title: 'Nothing here yet' },
  error: { icon: <AlertTriangle />, title: 'Something went wrong', description: 'This surface could not load.' },
  unavailable: { icon: <PlugZap />, title: 'Not connected', description: 'This capability is not available yet.' },
  'coming-soon': { icon: <Construction />, title: 'Coming soon', description: 'The design foundation is ready; this surface ships in a later phase.' },
  'permission-denied': { icon: <Ban />, title: 'Permission needed', description: 'You do not have access to this yet.' },
};

export interface StateViewProps {
  status: UIStatus;
  /** Overrides for the preset copy/icon. */
  title?: string;
  description?: string;
  icon?: ReactNode;
  /** Primary action (e.g. a custom button). */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  /** When provided on `error`/`unavailable`, renders a Retry button. */
  onRetry?: () => void;
  retryLabel?: string;
  loadingLabel?: string;
  /** Tighter padding for use inside widgets. */
  compact?: boolean;
  className?: string;
  /** Rendered when status is `idle` or `ready`. */
  children?: ReactNode;
}

/**
 * The single renderer for JARVIS UI states. Reuses `Spinner` + `EmptyState`
 * (no new visual language). For `ready`/`idle` it simply renders `children`.
 */
export function StateView({
  status,
  title,
  description,
  icon,
  action,
  secondaryAction,
  onRetry,
  retryLabel = 'Try again',
  loadingLabel = 'Loading…',
  compact,
  className,
  children,
}: StateViewProps) {
  if (!isPlaceholderStatus(status)) return <>{children}</>;

  if (status === 'loading' || status === 'reconnecting') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 text-content-tertiary',
          compact ? 'py-8' : 'py-14',
          className,
        )}
      >
        <Spinner size={compact ? 'md' : 'lg'} />
        <span className="text-body-sm">
          {status === 'reconnecting' ? (title ?? 'Reconnecting…') : loadingLabel}
        </span>
      </div>
    );
  }

  const preset = PRESETS[status];
  const retry = onRetry ? (
    <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
  ) : undefined;

  return (
    <EmptyState
      className={cn(compact && 'py-8', className)}
      icon={icon ?? preset?.icon ?? <WifiOff />}
      title={title ?? preset?.title ?? 'Unavailable'}
      description={description ?? preset?.description}
      action={action ?? retry}
      secondaryAction={secondaryAction}
    />
  );
}
