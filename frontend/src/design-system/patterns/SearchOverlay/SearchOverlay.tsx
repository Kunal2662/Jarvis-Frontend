import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Results / suggestions rendered below the input. */
  children?: ReactNode;
  className?: string;
  /**
   * Extra props forwarded to the underlying `<input>` — e.g. `role="combobox"`,
   * `aria-activedescendant`, `onKeyDown` for a results-list consumer to wire up
   * roving selection/ARIA without this component needing to know about search
   * semantics. Core value/onChange/placeholder/className stay owned by this
   * component and cannot be overridden.
   */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'placeholder' | 'className'
  >;
}

/** Universal floating search surface (glass). Distinct from CommandPalette actions. */
export function SearchOverlay({
  open,
  onOpenChange,
  value,
  onValueChange,
  placeholder = 'Search everything…',
  children,
  className,
  inputProps,
}: SearchOverlayProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-palette bg-black/50 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-label="Search"
          className={cn(
            'glass glass-strong fixed left-1/2 top-1/2 z-palette w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-e4 outline-none data-[state=open]:animate-scale-in',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-line-subtle px-5">
            <Search className="size-5 shrink-0 text-content-tertiary" />
            <input
              autoFocus
              aria-label="Search"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={placeholder}
              className="h-16 w-full bg-transparent text-body-lg text-content placeholder:text-content-tertiary outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              {...inputProps}
            />
          </div>
          {children && <div className="max-h-[min(60vh,480px)] overflow-y-auto p-2">{children}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
