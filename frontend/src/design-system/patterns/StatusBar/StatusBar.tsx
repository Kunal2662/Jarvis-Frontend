import type { ReactNode } from 'react';
import { Glass } from '../../primitives/Glass/Glass';
import { cn } from '../../lib/cn';

export interface StatusBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}

/** Thin bottom status strip for system state, sync, and quick indicators. */
export function StatusBar({ left, center, right, className }: StatusBarProps) {
  return (
    <Glass
      depth="thin"
      role="contentinfo"
      className={cn(
        'z-sticky flex h-[var(--layout-statusbar)] items-center justify-between gap-4 rounded-none border-x-0 border-b-0 px-3 text-caption text-content-tertiary',
        className,
      )}
    >
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{center}</div>
      <div className="flex items-center gap-3">{right}</div>
    </Glass>
  );
}

export function StatusItem({
  icon,
  children,
  tone = 'default',
}: {
  icon?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const toneClass = {
    default: 'text-content-tertiary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[tone];
  return (
    <span className={cn('inline-flex items-center gap-1.5 [&_svg]:size-3.5', toneClass)}>
      {icon}
      {children}
    </span>
  );
}
