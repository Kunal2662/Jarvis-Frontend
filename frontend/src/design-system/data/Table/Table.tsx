import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

/** Readability-first table. Solid surfaces only — never glass. */
export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-line-subtle bg-surface-base">
      <table ref={ref} className={cn('w-full caption-bottom text-body-sm', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b [&_tr]:border-line-subtle', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-line-subtle transition-colors hover:bg-surface-hover data-[selected=true]:bg-surface-selected',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-[var(--row-h)] px-4 text-left align-middle text-overline uppercase text-content-tertiary [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('h-[var(--row-h)] px-4 align-middle text-content', className)}
      {...props}
    />
  );
}
