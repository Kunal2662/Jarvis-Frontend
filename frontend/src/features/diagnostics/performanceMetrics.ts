/**
 * Frontend-only performance snapshot (roadmap item 20's "Performance" half).
 * Sourced entirely from this browser tab's own `performance` global — never
 * from JARVIS Core, which has no performance-reporting contract (see
 * `docs/JARVIS_FRONTEND_ARCHITECTURE.md` §10: performance is a frontend
 * engineering discipline, not a Core-delivered dataset). Every field is real,
 * live browser data; fields the current browser/engine doesn't expose are
 * reported as `undefined` rather than fabricated.
 */

export interface MemoryUsage {
  usedMb: number;
  totalMb: number;
  limitMb: number;
}

export interface PerformanceSnapshot {
  /** Whether the Performance API was usable at all in this environment. */
  supported: boolean;
  measuredAt: string;
  pageLoadMs?: number;
  domContentLoadedMs?: number;
  timeToFirstByteMs?: number;
  resourceCount?: number;
  /** Chromium-only (`performance.memory`); `undefined` on other engines. */
  memory?: MemoryUsage;
}

interface ChromePerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

function bytesToMb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

function toMemoryUsage(memory: ChromePerformanceMemory): MemoryUsage {
  return {
    usedMb: bytesToMb(memory.usedJSHeapSize),
    totalMb: bytesToMb(memory.totalJSHeapSize),
    limitMb: bytesToMb(memory.jsHeapSizeLimit),
  };
}

export function getPerformanceSnapshot(): PerformanceSnapshot {
  const measuredAt = new Date().toISOString();

  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
    return { supported: false, measuredAt };
  }

  const memoryInfo = (performance as Performance & { memory?: ChromePerformanceMemory }).memory;
  const resourceCount = performance.getEntriesByType('resource').length;
  const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

  if (!nav) {
    return {
      supported: true,
      measuredAt,
      resourceCount,
      memory: memoryInfo ? toMemoryUsage(memoryInfo) : undefined,
    };
  }

  return {
    supported: true,
    measuredAt,
    pageLoadMs: nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd - nav.startTime) : undefined,
    domContentLoadedMs:
      nav.domContentLoadedEventEnd > 0 ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : undefined,
    timeToFirstByteMs: nav.responseStart > 0 ? Math.round(nav.responseStart - nav.startTime) : undefined,
    resourceCount,
    memory: memoryInfo ? toMemoryUsage(memoryInfo) : undefined,
  };
}
