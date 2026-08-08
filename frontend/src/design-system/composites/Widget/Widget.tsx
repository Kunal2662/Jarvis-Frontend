import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { UIStatus } from '../../lib/uiState';
import { Card } from '../Card/Card';
import { StateView } from '../StateView/StateView';

export interface WidgetProps {
  title: ReactNode;
  icon?: ReactNode;
  /** Right-aligned header slot (e.g. a "View all" link or menu). */
  action?: ReactNode;
  /** When set to a placeholder status, the body renders a compact StateView. */
  status?: UIStatus;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/**
 * Lightweight reusable widget container for the adaptive workspace.
 * Reuses `Card` + `StateView`; introduces no new visual language. Intended to
 * back future AI-status / activity / tasks / calendar / files / system widgets —
 * this task ships ONLY the container, not those widgets.
 */
export function Widget({
  title,
  icon,
  action,
  status = 'ready',
  onRetry,
  emptyTitle,
  emptyDescription,
  errorMessage,
  footer,
  className,
  bodyClassName,
  children,
}: WidgetProps) {
  return (
    <Card variant="raised" className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="text-ai-aura [&_svg]:size-4">{icon}</span>}
          <h3 className="truncate text-body font-semibold text-content">{title}</h3>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn('min-h-0 flex-1 px-4 pb-4', bodyClassName)}>
        <StateView
          status={status}
          compact
          onRetry={onRetry}
          title={status === 'empty' ? emptyTitle : status === 'error' ? errorMessage : undefined}
          description={status === 'empty' ? emptyDescription : undefined}
        >
          {children}
        </StateView>
      </div>
      {footer && <div className="border-t border-line-subtle px-4 py-3">{footer}</div>}
    </Card>
  );
}

export interface WidgetGridProps {
  className?: string;
  children: ReactNode;
}

/** A quiet responsive grid for widgets: 1-up → 2-up → 3-up. */
export function WidgetGrid({ className, children }: WidgetGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {children}
    </div>
  );
}
