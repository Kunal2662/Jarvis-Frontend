import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncState } from '../lib/uiState';

export interface UseAsyncOptions<T> {
  /** Run immediately on mount. Default true. */
  immediate?: boolean;
  /** Treat a successful result as 'empty' (defaults to empty arrays). */
  isEmpty?: (data: T) => boolean;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  /** (Re)run the fetcher; aborts any in-flight request first. */
  reload: () => void;
  /** Abort the in-flight request without changing to an error state. */
  cancel: () => void;
}

/**
 * Minimal, dependency-free async-state helper giving every JARVIS surface a
 * consistent lifecycle: idle → loading → ready | empty | error, with proper
 * AbortController cancellation (so unmount / re-run / streaming aborts never
 * flip the UI into a false error). Presentation-only — the caller supplies the
 * fetcher; this does NOT define an API layer or touch the chat stream.
 */
export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  { immediate = true, isEmpty }: UseAsyncOptions<T> = {},
): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: immediate ? 'loading' : 'idle' });
  const controllerRef = useRef<AbortController | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const isEmptyRef = useRef(isEmpty);
  isEmptyRef.current = isEmpty;

  const reload = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'loading' });

    fetcherRef.current(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        const empty = isEmptyRef.current
          ? isEmptyRef.current(data)
          : Array.isArray(data) && data.length === 0;
        setState({ status: empty ? 'empty' : 'ready', data });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({ status: 'error', error: err instanceof Error ? err.message : String(err) });
      },
    );
  }, []);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  useEffect(() => {
    if (immediate) reload();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, reload, cancel };
}
