import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AppShellProps {
  /**
   * @deprecated Single-workspace architecture removes the primary sidebar
   * (docs/architecture/UI-ARCHITECTURE.md). Retained (optional) only for
   * Developer Mode and genuine edge cases. Not composed in the default shell.
   */
  sidebar?: ReactNode;
  topbar?: ReactNode;
  statusbar?: ReactNode;
  children: ReactNode;
  /** Floating layer (dock, voice overlay, widgets). */
  overlay?: ReactNode;
  className?: string;
}

/** The three-zone JARVIS shell: sidebar + (topbar / content / statusbar). */
export function AppShell({ sidebar, topbar, statusbar, children, overlay, className }: AppShellProps) {
  return (
    <div className={cn('relative flex h-screen w-full overflow-hidden bg-surface-canvas', className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        {statusbar}
      </div>
      {overlay}
    </div>
  );
}
