import { cn } from '../../lib/cn';

/** Structural placeholder with a shimmer sweep (static under reduced-motion). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('shimmer rounded-md bg-surface-subtle', className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: `${100 - i * (60 / Math.max(lines, 1))}%` }}
        />
      ))}
    </div>
  );
}
