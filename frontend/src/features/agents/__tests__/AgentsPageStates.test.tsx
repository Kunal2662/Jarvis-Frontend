import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Agent, AgentService } from '../agentService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors MemoryPageStates.test.tsx /
// SmartHomePageStates.test.tsx.
let fakeService: AgentService;

vi.mock('../agentService', () => ({
  getAgentService: () => fakeService,
}));

import { AgentsPage } from '../AgentsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/agents']}>
          <AgentsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<AgentService>): AgentService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getAgents: vi.fn().mockResolvedValue([]),
    getAgent: vi.fn(),
    getRuns: vi.fn().mockResolvedValue([]),
    setEnabled: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AgentsPage async states', () => {
  it('shows a loading state while agents are being fetched', () => {
    fakeService = baseService({ getAgents: vi.fn(() => new Promise<Agent[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no agents', async () => {
    fakeService = baseService({ getAgents: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No agents yet');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getAgents = vi.fn().mockRejectedValueOnce(new Error('Agent data unreachable'));
    fakeService = baseService({ getAgents });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/Agent data unreachable/)).toBeInTheDocument();

    getAgents.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getAgents).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getAgents: vi.fn().mockRejectedValue(new Error('JARVIS Core agents contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });

  it('shows the ready state with a seeded agent once loaded', async () => {
    const agents: Agent[] = [
      {
        id: 'agent-x',
        name: 'Test Agent',
        description: 'A fake agent for state testing.',
        status: 'active',
        capabilities: ['Testing'],
        lastRunAt: '2026-08-10T09:00:00-04:00',
      },
    ];
    fakeService = baseService({ getAgents: vi.fn().mockResolvedValue(agents) });
    renderPage();

    await screen.findByTestId('agent-card-agent-x');
    expect(screen.getByTestId('agents-simulation-banner')).toBeInTheDocument();
  });
});
