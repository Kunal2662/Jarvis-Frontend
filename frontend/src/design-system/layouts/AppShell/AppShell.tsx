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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-modal focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:font-medium focus:text-content-on-accent focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2 focus:ring-offset-surface-canvas"
      >
        Skip to main content
      </a>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none">
          {children}
        </main>
        {statusbar}
      </div>
      {overlay}
    </div>
  );
}
