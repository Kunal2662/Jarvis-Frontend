import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { PerformanceSnapshot } from '../performanceMetrics';

const baseSnapshot: PerformanceSnapshot = {
  supported: true,
  measuredAt: '2026-08-11T00:00:00.000Z',
  pageLoadMs: 1234,
  domContentLoadedMs: 800,
  timeToFirstByteMs: 120,
  resourceCount: 42,
  memory: { usedMb: 10, totalMb: 20, limitMb: 100 },
};

let snapshotToReturn: PerformanceSnapshot;
let snapshotCalls = 0;
vi.mock('../performanceMetrics', () => ({
  getPerformanceSnapshot: () => {
    snapshotCalls++;
    return snapshotToReturn;
  },
}));

import { DiagnosticsPage } from '../DiagnosticsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/diagnostics']}>
          <DiagnosticsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  snapshotToReturn = baseSnapshot;
  snapshotCalls = 0;
});

// Uses the real mock DiagnosticsService (module-level, side-effect-free reads
// of every other feature's own service seam) — mirrors AgentsPage.test.tsx /
// SettingsPage.test.tsx's "render against the real mock adapter" style.
describe('DiagnosticsPage', () => {
  it('renders the local-only banner, stat cards, and every feature seam in system status', async () => {
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');

    expect(screen.getByTestId('diagnostics-local-banner')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostics-row-agents')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostics-row-settings')).toBeInTheDocument();
    expect(screen.getByTestId('diagnostics-row-search')).toBeInTheDocument();
    expect(within(screen.getByTestId('diagnostics-row-chat')).getByText('Ready')).toBeInTheDocument();
  });

  it('shows an explicit unavailable Core health card — never fabricated CPU/memory numbers', async () => {
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');

    const coreHealth = screen.getByTestId('diagnostics-core-health');
    expect(within(coreHealth).getByText('Unavailable')).toBeInTheDocument();
    expect(within(coreHealth).getByText(/Self-Healing/)).toBeInTheDocument();
  });

  it('shows real, live performance metrics from the browser Performance API', async () => {
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');

    expect(screen.getByTestId('diagnostics-perf-load')).toHaveTextContent('1,234 ms');
    expect(screen.getByTestId('diagnostics-perf-dom')).toHaveTextContent('800 ms');
    expect(screen.getByTestId('diagnostics-perf-ttfb')).toHaveTextContent('120 ms');
    expect(screen.getByTestId('diagnostics-perf-resources')).toHaveTextContent('42');
    expect(screen.getByTestId('diagnostics-perf-memory')).toHaveTextContent('10 MB / 100 MB limit');
  });

  it('re-measures performance when Refresh is clicked', async () => {
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');
    expect(snapshotCalls).toBe(1);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() => expect(snapshotCalls).toBe(2));
  });

  it('shows "Not available in this browser" for memory when the Performance API does not expose it', async () => {
    snapshotToReturn = { supported: true, measuredAt: '2026-08-11T00:00:00.000Z', resourceCount: 5 };
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');
    expect(screen.getByTestId('diagnostics-perf-memory')).toHaveTextContent('Not available in this browser');
    expect(screen.getByTestId('diagnostics-perf-load')).toHaveTextContent('Not available');
  });

  it('shows the unsupported-Performance-API message honestly instead of fabricating metrics', async () => {
    snapshotToReturn = { supported: false, measuredAt: '2026-08-11T00:00:00.000Z' };
    renderPage();
    await screen.findByTestId('diagnostics-row-chat');
    expect(screen.getByTestId('diagnostics-perf-unsupported')).toBeInTheDocument();
    expect(screen.queryByTestId('diagnostics-perf-load')).not.toBeInTheDocument();
  });
});
