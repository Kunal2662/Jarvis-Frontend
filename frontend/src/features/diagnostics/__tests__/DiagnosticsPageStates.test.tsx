import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { DiagnosticsService, SystemComponentStatus } from '../diagnosticsService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors AgentsPageStates.test.tsx /
// MemoryPageStates.test.tsx.
let fakeService: DiagnosticsService;

vi.mock('../diagnosticsService', () => ({
  getDiagnosticsService: () => fakeService,
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

function baseService(overrides: Partial<DiagnosticsService>): DiagnosticsService {
  return {
    id: 'mock',
    label: 'Frontend introspection (local adapter registry)',
    ready: true,
    getSystemStatus: vi.fn().mockResolvedValue([]),
    getCoreHealth: vi.fn().mockResolvedValue({
      available: false,
      milestone: 'M13B',
      message: 'Not available.',
    }),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DiagnosticsPage async states', () => {
  it('shows a loading state while system status is being fetched', () => {
    fakeService = baseService({
      getSystemStatus: vi.fn(() => new Promise<SystemComponentStatus[]>(() => {})),
    });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no components to report', async () => {
    fakeService = baseService({ getSystemStatus: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No components to report');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getSystemStatus = vi.fn().mockRejectedValueOnce(new Error('Diagnostics data unreachable'));
    fakeService = baseService({ getSystemStatus });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/Diagnostics data unreachable/)).toBeInTheDocument();

    getSystemStatus.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getSystemStatus).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getSystemStatus: vi
        .fn()
        .mockRejectedValue(new Error('JARVIS Core diagnostics contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });

  it('shows the ready state with a seeded component once loaded', async () => {
    const rows: SystemComponentStatus[] = [
      {
        key: 'chat',
        name: 'Chat / Voice orchestrator',
        backendId: 'mock',
        backendLabel: 'Frontend mock',
        ready: true,
      },
    ];
    fakeService = baseService({ getSystemStatus: vi.fn().mockResolvedValue(rows) });
    renderPage();

    await screen.findByTestId('diagnostics-row-chat');
    expect(screen.getByTestId('diagnostics-local-banner')).toBeInTheDocument();
  });
});
