import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface WorkspaceContainerProps {
  header?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  /** Optional right context/AI panel. */
  rightPanel?: ReactNode;
  rightPanelOpen?: boolean;
  className?: string;
}

/**
 * The reusable module frame: PageHeader + optional toolbar + scrolling content
 * + optional right context panel. Content prioritizes readability (no glass).
 */
export function WorkspaceContainer({
  header,
  toolbar,
  children,
  rightPanel,
  rightPanelOpen = true,
  className,
}: WorkspaceContainerProps) {
  return (
    <div className={cn('flex min-h-0 flex-1', className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        {header && <div className="px-6 pt-6">{header}</div>}
        {toolbar && (
          <div className="flex items-center gap-2 px-6 py-3">{toolbar}</div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
      {rightPanel && rightPanelOpen && (
        <aside
          aria-label="Context panel"
          className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-line-subtle bg-surface-base xl:block"
        >
          {rightPanel}
        </aside>
      )}
    </div>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {breadcrumb}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-content">{title}</h1>
          {description && <p className="text-body-sm text-content-secondary">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
