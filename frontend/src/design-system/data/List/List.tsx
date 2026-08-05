import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export function List({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex flex-col', className)} role="list" {...props} />;
}

export interface ListRowProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  active?: boolean;
  interactive?: boolean;
}

export const ListRow = forwardRef<HTMLLIElement, ListRowProps>(
  ({ className, leading, trailing, title, subtitle, active, interactive = true, ...props }, ref) => (
    <li
      ref={ref}
      data-active={active}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
        interactive && 'cursor-pointer hover:bg-surface-hover',
        active && 'bg-surface-selected',
        className,
      )}
      {...props}
    >
      {leading && <span className="shrink-0 text-content-tertiary [&_svg]:size-4">{leading}</span>}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-sm text-content">{title}</span>
        {subtitle && <span className="truncate text-caption text-content-tertiary">{subtitle}</span>}
      </div>
      {trailing && <span className="shrink-0 text-content-tertiary">{trailing}</span>}
    </li>
  ),
);
ListRow.displayName = 'ListRow';
