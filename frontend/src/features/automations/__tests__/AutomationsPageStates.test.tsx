import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Automation, AutomationService } from '../automationService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — no reliance on the mock adapter's
// simulated latency or seed data.
let fakeService: AutomationService;

vi.mock('../automationService', () => ({
  getAutomationService: () => fakeService,
}));

import { AutomationsPage } from '../AutomationsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/automations']}>
          <AutomationsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<AutomationService>): AutomationService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getAutomations: vi.fn().mockResolvedValue([]),
    getAutomation: vi.fn(),
    createAutomation: vi.fn(),
    updateAutomation: vi.fn(),
    deleteAutomation: vi.fn(),
    setEnabled: vi.fn(),
    pauseResume: vi.fn(),
    getExecutionHistory: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AutomationsPage async states', () => {
  it('shows a loading state while automations are being fetched', () => {
    fakeService = baseService({ getAutomations: vi.fn(() => new Promise<Automation[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state with a create action when there are no automations', async () => {
    fakeService = baseService({ getAutomations: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No automations yet');
    expect(screen.getByTestId('automation-create-empty')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const getAutomations = vi.fn().mockRejectedValueOnce(new Error('network down'));
    fakeService = baseService({ getAutomations });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/network down/)).toBeInTheDocument();

    getAutomations.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getAutomations).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getAutomations: vi.fn().mockRejectedValue(new Error('Core automation contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
