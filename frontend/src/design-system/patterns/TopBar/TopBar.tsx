import type { ReactNode } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Glass } from '../../primitives/Glass/Glass';
import { Kbd } from '../../primitives/Kbd/Kbd';
import { cn } from '../../lib/cn';

export interface TopBarProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  /**
   * Primary navigation slot (single-workspace top-bar nav). When provided it
   * fills the center region and the built-in search field is hidden — search
   * stays reachable via ⌘K.
   */
  nav?: ReactNode;
  /** Center search trigger opens the command palette / search overlay. */
  onSearchClick?: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export function TopBar({
  leading,
  trailing,
  nav,
  onSearchClick,
  searchPlaceholder = 'Search or ask Jarvis…',
  className,
}: TopBarProps) {
  return (
    <Glass
      depth="thin"
      role="banner"
      className={cn(
        'z-topbar flex h-[var(--layout-topbar)] items-center gap-3 rounded-none border-x-0 border-t-0 px-4',
        className,
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">{leading}</div>

      {nav ? (
        <div className="flex min-w-0 flex-1 justify-center">{nav}</div>
      ) : (
        <div className="flex flex-1 justify-center">
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="group flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-line bg-surface-base/60 px-3 text-body-sm text-content-tertiary transition-colors hover:border-line-strong hover:bg-surface-base"
            >
              <SearchIcon className="size-4" />
              <span className="flex-1 text-left">{searchPlaceholder}</span>
              <Kbd>⌘K</Kbd>
            </button>
          )}
        </div>
      )}

      <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">{trailing}</div>
    </Glass>
  );
}
