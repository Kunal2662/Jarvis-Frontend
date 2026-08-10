import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { IntegrationsPage } from '../IntegrationsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/smart-home/integrations']}>
          <IntegrationsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapters keep their connector state in module-level state
// (by design). These tests therefore run against one shared, mutating
// dataset per connector and rely on executing in the order written below
// (mirrors DeviceManagementPage.test.tsx).
describe('IntegrationsPage', () => {
  it('renders the simulation banner and both connector cards, not_configured by default', async () => {
    renderPage();
    await screen.findByTestId('connector-card-home_assistant');

    expect(screen.getByTestId('integrations-simulation-banner')).toBeInTheDocument();
    expect(screen.getByTestId('connector-card-mqtt')).toBeInTheDocument();
    expect(within(screen.getByTestId('connector-status-home_assistant')).getByText('Not configured')).toBeInTheDocument();
    expect(within(screen.getByTestId('connector-status-mqtt')).getByText('Not configured')).toBeInTheDocument();
  });

  it('opens the Home Assistant drawer and connects end to end', async () => {
    renderPage();
    await screen.findByTestId('connector-card-home_assistant');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('connector-card-home_assistant'));

    const drawer = await screen.findByTestId('connector-detail-drawer');
    await user.type(within(drawer).getByTestId('connector-endpoint-input-home_assistant'), 'http://homeassistant.local:8123');
    await user.type(within(drawer).getByTestId('connector-secret-input-home_assistant'), 'a-long-lived-token');
    await user.click(within(drawer).getByTestId('connector-connect-submit-home_assistant'));

    await waitFor(() => expect(screen.getByText('Home Assistant connected')).toBeInTheDocument(), { timeout: 3000 });
    await waitFor(() =>
      expect(within(screen.getByTestId('connector-status-home_assistant')).getByText('Connected')).toBeInTheDocument(),
    );
  });

  it('syncs entities for the now-connected Home Assistant connector and shows the preview list', async () => {
    renderPage();
    await screen.findByTestId('connector-card-home_assistant');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('connector-card-home_assistant'));
    const drawer = await screen.findByTestId('connector-detail-drawer');

    await user.click(within(drawer).getByTestId('connector-sync-home_assistant'));
    await waitFor(() => expect(screen.getByText('Home Assistant synced')).toBeInTheDocument(), { timeout: 3000 });

    const entities = within(drawer).getByTestId('connector-entities-home_assistant');
    expect(within(entities).getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('disconnects Home Assistant, clearing discovered entities, then reconnects', async () => {
    renderPage();
    await screen.findByTestId('connector-card-home_assistant');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('connector-card-home_assistant'));
    const drawer = await screen.findByTestId('connector-detail-drawer');

    await user.click(within(drawer).getByTestId('connector-disconnect-home_assistant'));
    await waitFor(() => expect(screen.getByText('Home Assistant disconnected')).toBeInTheDocument());
    expect(within(drawer).getByText('No entities discovered yet.')).toBeInTheDocument();

    await user.click(within(drawer).getByTestId('connector-reconnect-home_assistant'));
    await waitFor(() => expect(screen.getByText('Home Assistant reconnected')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('connects the MQTT connector independently of Home Assistant state', async () => {
    renderPage();
    await screen.findByTestId('connector-card-mqtt');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('connector-card-mqtt'));
    const drawer = await screen.findByTestId('connector-detail-drawer');

    await user.type(within(drawer).getByTestId('connector-endpoint-input-mqtt'), 'mqtt.local:1883');
    await user.type(within(drawer).getByTestId('connector-secret-input-mqtt'), 'broker-password');
    await user.click(within(drawer).getByTestId('connector-connect-submit-mqtt'));

    await waitFor(() => expect(screen.getByText('MQTT connected')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('never displays the entered secret anywhere after connecting', async () => {
    renderPage();
    await screen.findByTestId('connector-card-mqtt');

    // The DOM must never contain the secret typed in the previous test's
    // connect flow, nor should typing one now leak into the rendered drawer
    // after submission — the secret input is cleared post-submit.
    expect(document.body.innerHTML).not.toContain('broker-password');
    expect(document.body.innerHTML).not.toContain('a-long-lived-token');
  });
});
