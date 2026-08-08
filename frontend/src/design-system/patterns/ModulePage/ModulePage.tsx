import type { ReactNode } from 'react';
import type { UIStatus } from '../../lib/uiState';
import { PageHeader, WorkspaceContainer } from '../WorkspaceContainer/WorkspaceContainer';
import { StateView, type StateViewProps } from '../../composites/StateView/StateView';

export interface ModulePageProps {
  title: ReactNode;
  description?: ReactNode;
  /** Header right-cluster actions. */
  actions?: ReactNode;
  /** Optional toolbar row below the header. */
  toolbar?: ReactNode;
  /**
   * Presentation status. Anything other than 'ready'/'idle' renders the shared
   * StateView instead of `children`. Defaults to 'ready'.
   */
  status?: UIStatus;
  onRetry?: () => void;
  /** Error text surfaced on the `error` state. */
  error?: string;
  /** Extra overrides forwarded to StateView (icon/title/action/etc.). */
  stateProps?: Partial<StateViewProps>;
  className?: string;
  children?: ReactNode;
}

/**
 * The standard JARVIS module presentation pattern for the single workspace:
 * `WorkspaceContainer` (PageHeader + scrolling content) wired to the shared
 * `StateView`. Every future module can use this to get consistent
 * title/description/actions + loading/empty/error/coming-soon handling.
 *
 * It does NOT redesign AppShell — it composes the existing WorkspaceContainer.
 */
export function ModulePage({
  title,
  description,
  actions,
  toolbar,
  status = 'ready',
  onRetry,
  error,
  stateProps,
  className,
  children,
}: ModulePageProps) {
  return (
    <WorkspaceContainer
      className={className}
      header={<PageHeader title={title} description={description} actions={actions} />}
      toolbar={toolbar}
    >
      <StateView
        status={status}
        onRetry={onRetry}
        description={status === 'error' ? error : undefined}
        {...stateProps}
      >
        {children}
      </StateView>
    </WorkspaceContainer>
  );
}
