import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { AiApp, AiAppsService } from '../aiAppsService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors
// features/automations/__tests__/AutomationsPageStates.test.tsx and
// features/knowledge/__tests__/KnowledgePage.test.tsx.
let fakeService: AiAppsService;

vi.mock('../aiAppsService', () => ({
  getAiAppsService: () => fakeService,
}));

import { AiAppsPage } from '../AiAppsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/apps']}>
          <AiAppsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<AiAppsService>): AiAppsService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getApps: vi.fn().mockResolvedValue([]),
    getApp: vi.fn(),
    setConnected: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AiAppsPage async states', () => {
  it('shows a loading state while AI Apps are being fetched', () => {
    fakeService = baseService({ getApps: vi.fn(() => new Promise<AiApp[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no AI Apps', async () => {
    fakeService = baseService({ getApps: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No AI Apps available');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getApps = vi.fn().mockRejectedValueOnce(new Error('AI Apps catalog unreachable'));
    fakeService = baseService({ getApps });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/AI Apps catalog unreachable/)).toBeInTheDocument();

    getApps.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getApps).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getApps: vi.fn().mockRejectedValue(new Error('Core AI Apps contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
