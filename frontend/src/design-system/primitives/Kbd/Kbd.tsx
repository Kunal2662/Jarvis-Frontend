import { cn } from '../../lib/cn';

/** Keyboard key hint. */
export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-surface-raised px-1.5 font-mono text-[11px] font-medium text-content-secondary shadow-e1',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
