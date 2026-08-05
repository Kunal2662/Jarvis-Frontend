import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function range(page: number, pageCount: number): (number | 'ellipsis')[] {
  const delta = 1;
  const pages: (number | 'ellipsis')[] = [];
  const left = Math.max(2, page - delta);
  const right = Math.min(pageCount - 1, page + delta);
  pages.push(1);
  if (left > 2) pages.push('ellipsis');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < pageCount - 1) pages.push('ellipsis');
  if (pageCount > 1) pages.push(pageCount);
  return pages;
}

const cellClasses =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-body-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring disabled:pointer-events-none disabled:opacity-40';

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <button
        className={cn(cellClasses, 'text-content-secondary hover:bg-surface-hover hover:text-content')}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {range(page, pageCount).map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e${i}`} className="inline-flex h-9 w-9 items-center justify-center text-content-tertiary">
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={item}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              cellClasses,
              item === page
                ? 'bg-accent text-content-on-accent'
                : 'text-content-secondary hover:bg-surface-hover hover:text-content',
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        className={cn(cellClasses, 'text-content-secondary hover:bg-surface-hover hover:text-content')}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
