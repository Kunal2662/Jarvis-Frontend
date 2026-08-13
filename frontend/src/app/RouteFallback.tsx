import { Spinner } from '../design-system';

/** Suspense fallback for lazy-loaded routes — mirrors StateView's own loading treatment. */
export function RouteFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-content-tertiary">
      <Spinner size="lg" />
      <span className="text-body-sm">Loading…</span>
    </div>
  );
}
