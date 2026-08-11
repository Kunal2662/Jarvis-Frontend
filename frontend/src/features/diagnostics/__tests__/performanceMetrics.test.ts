import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPerformanceSnapshot } from '../performanceMetrics';

describe('getPerformanceSnapshot', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports supported: false when the Performance API is unavailable, never fabricating values', () => {
    const original = globalThis.performance;
    // @ts-expect-error — simulate an environment without the Performance API.
    delete globalThis.performance;

    const snapshot = getPerformanceSnapshot();
    expect(snapshot.supported).toBe(false);
    expect(snapshot.pageLoadMs).toBeUndefined();
    expect(snapshot.memory).toBeUndefined();
    expect(snapshot.measuredAt).toBeTruthy();

    globalThis.performance = original;
  });

  it('reads real navigation timing when a navigation entry is present', () => {
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [
          {
            startTime: 0,
            loadEventEnd: 1200,
            domContentLoadedEventEnd: 800,
            responseStart: 150,
          } as unknown as PerformanceEntry,
        ];
      }
      if (type === 'resource') {
        return [{}, {}, {}] as PerformanceEntry[];
      }
      return [];
    });

    const snapshot = getPerformanceSnapshot();
    expect(snapshot.supported).toBe(true);
    expect(snapshot.pageLoadMs).toBe(1200);
    expect(snapshot.domContentLoadedMs).toBe(800);
    expect(snapshot.timeToFirstByteMs).toBe(150);
    expect(snapshot.resourceCount).toBe(3);
  });

  it('leaves timing fields undefined (never zero-fabricated) when no navigation entry exists', () => {
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') return [];
      if (type === 'resource') return [];
      return [];
    });

    const snapshot = getPerformanceSnapshot();
    expect(snapshot.supported).toBe(true);
    expect(snapshot.pageLoadMs).toBeUndefined();
    expect(snapshot.domContentLoadedMs).toBeUndefined();
    expect(snapshot.timeToFirstByteMs).toBeUndefined();
    expect(snapshot.resourceCount).toBe(0);
  });

  it('reports memory only when the non-standard performance.memory API is present (Chromium-only)', () => {
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') return [];
      if (type === 'resource') return [];
      return [];
    });
    const withMemory = performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
    };
    withMemory.memory = {
      usedJSHeapSize: 10 * 1024 * 1024,
      totalJSHeapSize: 20 * 1024 * 1024,
      jsHeapSizeLimit: 100 * 1024 * 1024,
    };

    const snapshot = getPerformanceSnapshot();
    expect(snapshot.memory).toEqual({ usedMb: 10, totalMb: 20, limitMb: 100 });

    delete withMemory.memory;
  });
});
