import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { AgentsPage } from '../AgentsPage';

function renderPage(initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/agents']) {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <AgentsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its agents in module-level state (by design,
// so a toggle persists across re-renders like a real backend would). These
// tests therefore run against one shared, mutating dataset and rely on
// executing in the order written below (mirrors AutomationsPage.test.tsx /
// MemoryPage.test.tsx).
describe('AgentsPage', () => {
  it('renders the simulation banner, stat cards, and the seeded agent cards', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-research');

    expect(screen.getByTestId('agents-simulation-banner')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-agent-smarthome')).toBeInTheDocument();
    expect(within(screen.getByTestId('agent-status-agent-smarthome')).getByText('Disabled')).toBeInTheDocument();
  });

  it('enables a disabled agent via the card toggle', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-smarthome');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('agent-toggle-agent-smarthome'));

    await waitFor(() => expect(screen.getByText('Agent enabled')).toBeInTheDocument());
    await waitFor(() =>
      expect(within(screen.getByTestId('agent-status-agent-smarthome')).getByText('Idle')).toBeInTheDocument(),
    );
  });

  it('opens the detail drawer for an agent with its capabilities and activity history', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-research');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('agent-card-agent-research'));

    const drawer = await screen.findByTestId('agent-detail-drawer');
    expect(within(drawer).getByText('Research Agent')).toBeInTheDocument();
    expect(within(drawer).getByText('Web research')).toBeInTheDocument();

    await waitFor(() => {
      const history = within(drawer).getByTestId('agent-run-history-list');
      expect(within(history).getAllByTestId('agent-run-history-item').length).toBeGreaterThan(0);
    });
    expect(within(drawer).getByText('Completed a market brief for the Mark III project.')).toBeInTheDocument();
  });

  it('shows the honest "no activity yet" empty state for an agent with zero runs', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-smarthome');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('agent-card-agent-smarthome'));

    const drawer = await screen.findByTestId('agent-detail-drawer');
    await waitFor(() => expect(within(drawer).getByText('No activity yet')).toBeInTheDocument());
  });

  it('disables an agent from the detail drawer', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-planning');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('agent-card-agent-planning'));
    const drawer = await screen.findByTestId('agent-detail-drawer');
    expect(within(drawer).getByText('Idle')).toBeInTheDocument();

    await user.click(within(drawer).getByTestId('agent-toggle-detail'));
    await waitFor(() => expect(screen.getByText('Agent disabled')).toBeInTheDocument());
    await waitFor(() => expect(within(drawer).getByTestId('agent-detail-status')).toHaveTextContent('Disabled'));
  });

  it('never displays a raw secret/credential anywhere on the page', async () => {
    renderPage();
    await screen.findByTestId('agent-card-agent-research');
    const secretPattern = /password|api[_-]?key|token|secret/i;
    expect(document.body.textContent).not.toMatch(secretPattern);
  });

  it('deep-links to a specific agent and opens its drawer directly', async () => {
    renderPage([{ pathname: '/agents', state: { agentId: 'agent-health' } }]);

    const drawer = await screen.findByTestId('agent-detail-drawer');
    expect(within(drawer).getByText('System Health Agent')).toBeInTheDocument();
  });
});
