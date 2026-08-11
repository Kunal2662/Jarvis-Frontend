import { useMemo, useState } from 'react';
import { Activity, Gauge, HeartPulse, RefreshCw, Server } from 'lucide-react';
import { Badge, Button, Card, ModulePage, StatCard, useAsync } from '../../design-system';
import { getDiagnosticsService, type SystemComponentStatus } from './diagnosticsService';
import { getPerformanceSnapshot, type PerformanceSnapshot } from './performanceMetrics';

/**
 * Diagnostics + Performance (roadmap item 20). Per
 * docs/JARVIS_CORE_FRONTEND_MAPPING.md's Diagnostics row ("M13B/future
 * observability | Do not pretend future Core exists"), this page never
 * fabricates Core-side health data. "System status" is honest introspection
 * of every other feature's own real service seam (mirrors — and extends —
 * `SettingsPage`'s AboutSection). "Core health" is an explicit unavailable
 * state, since JARVIS Core has not shipped M13B (Self-Healing &
 * Observability). "Performance" is real, live data read from this browser
 * tab's own Performance API — see `performanceMetrics.ts` — never from Core.
 */
export function DiagnosticsPage() {
  const service = useMemo(() => getDiagnosticsService(), []);
  const list = useAsync<SystemComponentStatus[]>((signal) => service.getSystemStatus(signal));
  const components = list.data ?? [];

  const [snapshot, setSnapshot] = useState<PerformanceSnapshot>(() => getPerformanceSnapshot());
  const refreshSnapshot = () => setSnapshot(getPerformanceSnapshot());

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && components.length === 0
      ? 'empty'
      : list.status;

  const counts = {
    total: components.length,
    ready: components.filter((c) => c.ready).length,
    awaitingCore: components.filter((c) => !c.ready).length,
  };

  return (
    <ModulePage
      title="Diagnostics"
      description={
        service.ready
          ? "A local, frontend-only view of every feature's current backend and this browser tab's own performance. Nothing here is a live view into JARVIS Core."
          : `${service.label} — diagnostics data is not connected yet.`
      }
      status={pageStatus}
      onRetry={list.reload}
      error={list.error}
      stateProps={
        pageStatus === 'empty'
          ? { title: 'No components to report', description: 'System status will appear here once available.' }
          : undefined
      }
    >
      <div className="flex flex-col gap-6 pb-16" data-testid="diagnostics-page">
        <div
          className="flex items-start gap-3 rounded-lg border border-info/40 bg-info-soft p-4"
          role="note"
          data-testid="diagnostics-local-banner"
        >
          <Activity className="mt-0.5 size-5 shrink-0 text-info" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="text-body-sm font-semibold text-content">Local frontend diagnostics only</span>
            <span className="text-body-sm text-content-secondary">
              "System status" below reads each feature's own real adapter state (mock vs. JARVIS Core, and
              whether it's ready) — it never fabricates data. JARVIS Core has not shipped Self-Healing &amp;
              Observability (M13B) yet, so Core-reported health is not available — see the Core health card
              below.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Components" value={counts.total} icon={<Server />} />
          <StatCard label="Ready" value={counts.ready} icon={<Activity />} />
          <StatCard label="Awaiting Core" value={counts.awaitingCore} icon={<HeartPulse />} />
        </div>

        <Card className="flex flex-col gap-3 p-5">
          <span className="text-overline uppercase text-content-tertiary">System status</span>
          <ul className="flex flex-col divide-y divide-line-subtle" data-testid="diagnostics-system-status">
            {components.map((c) => (
              <li
                key={c.key}
                className="flex items-center justify-between gap-3 py-2.5"
                data-testid={`diagnostics-row-${c.key}`}
              >
                <div className="flex flex-col">
                  <span className="text-body-sm text-content">{c.name}</span>
                  <span className="text-caption text-content-tertiary">{c.backendLabel}</span>
                </div>
                <Badge variant={c.ready ? 'success' : 'neutral'} size="sm">
                  {c.ready ? 'Ready' : 'Not connected'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-5" data-testid="diagnostics-core-health">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-content-tertiary" aria-hidden="true" />
            <span className="text-overline uppercase text-content-tertiary">Core health</span>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-line-subtle bg-surface-inset p-4">
            <Badge variant="neutral" size="sm">
              Unavailable
            </Badge>
            <p className="text-body-sm text-content-secondary">
              JARVIS Core has not shipped Self-Healing &amp; Observability (M13B) yet — no CPU, memory, uptime,
              or self-healing telemetry is available from Core. See{' '}
              <code className="rounded bg-surface-inset px-1 py-0.5">
                docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md
              </code>
              .
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-5" data-testid="diagnostics-performance">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="size-4 text-content-tertiary" aria-hidden="true" />
              <span className="text-overline uppercase text-content-tertiary">
                Performance (this browser tab)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="size-3.5" />}
              onClick={refreshSnapshot}
            >
              Refresh
            </Button>
          </div>
          {snapshot.supported ? (
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <PerfCell label="Page load" value={formatMs(snapshot.pageLoadMs)} testId="diagnostics-perf-load" />
              <PerfCell
                label="DOM ready"
                value={formatMs(snapshot.domContentLoadedMs)}
                testId="diagnostics-perf-dom"
              />
              <PerfCell
                label="Time to first byte"
                value={formatMs(snapshot.timeToFirstByteMs)}
                testId="diagnostics-perf-ttfb"
              />
              <PerfCell
                label="Resources loaded"
                value={snapshot.resourceCount !== undefined ? snapshot.resourceCount.toLocaleString() : 'Not available'}
                testId="diagnostics-perf-resources"
              />
              <div className="col-span-2 rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Memory (JS heap)</div>
                <div className="text-content" data-testid="diagnostics-perf-memory">
                  {snapshot.memory
                    ? `${snapshot.memory.usedMb} MB / ${snapshot.memory.limitMb} MB limit`
                    : 'Not available in this browser'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-content-tertiary" data-testid="diagnostics-perf-unsupported">
              This browser does not expose the Performance API this page relies on.
            </p>
          )}
          <p className="text-caption text-content-tertiary">
            Measured live from this browser tab via the standard Performance API — not from JARVIS Core.
          </p>
        </Card>
      </div>
    </ModulePage>
  );
}

function formatMs(ms?: number): string {
  return ms === undefined ? 'Not available' : `${ms.toLocaleString()} ms`;
}

function PerfCell({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="rounded-lg border border-line-subtle p-3">
      <div className="text-caption text-content-tertiary">{label}</div>
      <div className="text-content" data-testid={testId}>
        {value}
      </div>
    </div>
  );
}
