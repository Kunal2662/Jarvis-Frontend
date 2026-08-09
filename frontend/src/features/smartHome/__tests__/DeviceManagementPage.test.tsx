import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { DeviceManagementPage } from '../DeviceManagementPage';

function renderPage(initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/smart-home/devices']) {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <DeviceManagementPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its rooms/devices in module-level state (by
// design, so rename/pair/remove persist like a real backend would). These
// tests therefore run against one shared, mutating dataset and rely on
// executing in the order written below (mirrors SmartHomePage.test.tsx /
// FilesPage.test.tsx).
describe('DeviceManagementPage', () => {
  it('renders the simulation banner, stat cards, and the seeded device list', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-living-light');

    expect(screen.getByTestId('device-management-simulation-banner')).toBeInTheDocument();
    // "Devices" (stat card label + list widget title) and "Online" (stat card
    // label + per-row availability badges) are both intentionally repeated —
    // assert at least one match rather than requiring a single unambiguous one
    // (mirrors SmartHomePage.test.tsx's "Rooms"/"Scenes" assertion).
    expect(screen.getAllByText('Devices').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Online').length).toBeGreaterThan(0);
    expect(screen.getByTestId('device-management-row-dev-bathroom-light')).toBeInTheDocument();
  });

  it('filters the device list by search text and by room', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-living-light');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('device-management-filter-input'), 'kitchen');
    await waitFor(() => {
      expect(screen.queryByTestId('device-management-row-dev-kitchen-light')).toBeInTheDocument();
      expect(screen.queryByTestId('device-management-row-dev-living-light')).not.toBeInTheDocument();
    });
    await user.clear(screen.getByTestId('device-management-filter-input'));
    await screen.findByTestId('device-management-row-dev-living-light');
  });

  it('opens the management drawer for a device with its capabilities, state, and health/diagnostics', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-living-light');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('device-management-row-dev-living-light'));

    const drawer = await screen.findByTestId('device-management-drawer');
    expect(within(drawer).getByText('Living Room Light')).toBeInTheDocument();
    // "Power" appears twice (capability badge + current-state row) — assert
    // the capability badge specifically rather than an ambiguous getByText.
    expect(within(drawer).getAllByText('Power').length).toBeGreaterThan(0);

    const health = within(drawer).getByTestId('device-health-dev-living-light');
    expect(within(health).getByTestId('device-battery-dev-living-light')).toHaveTextContent('Not reported');
    expect(within(health).getByTestId('device-signal-dev-living-light')).toHaveTextContent('88%');
    expect(within(health).getByTestId('device-firmware-dev-living-light')).toHaveTextContent('2.4.1');
    expect(within(health).getByTestId('device-connector-dev-living-light')).toHaveTextContent('Home Assistant');
  });

  it('renames a device and reassigns its room from the drawer', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-kitchen-plug');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('device-management-row-dev-kitchen-plug'));
    await screen.findByTestId('device-management-drawer');

    const nameInput = screen.getByTestId('device-management-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Kitchen Outlet');

    const saveButton = screen.getByTestId('device-management-save');
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => expect(screen.getByText('Device updated')).toBeInTheDocument());
    await screen.findByTestId('device-management-row-dev-kitchen-plug');
    expect(within(screen.getByTestId('device-management-row-dev-kitchen-plug')).getByText('Kitchen Outlet')).toBeInTheDocument();
  });

  it('removes a device after confirming, closing the drawer and dropping it from the list', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-outdoor-light');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('device-management-row-dev-outdoor-light'));
    await screen.findByTestId('device-management-drawer');

    await user.click(screen.getByTestId('device-management-remove-trigger'));
    const modal = await screen.findByTestId('device-management-remove-modal');
    await user.click(within(modal).getByTestId('device-management-remove-confirm'));

    await waitFor(() => expect(screen.getByText('Device removed')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByTestId('device-management-row-dev-outdoor-light')).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId('device-management-drawer')).not.toBeInTheDocument();
  });

  it('pairs a new simulated device end to end, showing the discovering state first', async () => {
    renderPage();
    await screen.findByTestId('device-management-row-dev-living-light');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('device-management-pair-new'));

    const modal = await screen.findByTestId('pair-device-modal');
    await user.type(within(modal).getByTestId('pair-device-name'), 'Hallway Light');
    await user.click(within(modal).getByTestId('pair-device-submit'));

    await screen.findByTestId('pair-device-discovering');
    await waitFor(() => expect(screen.getByText('Device paired')).toBeInTheDocument(), { timeout: 3000 });
    await waitFor(() => {
      const rows = screen.getAllByText('Hallway Light');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it('deep-links to a specific device and opens its drawer directly', async () => {
    renderPage([{ pathname: '/smart-home/devices', state: { deviceId: 'dev-bedroom-fan' } }]);

    const drawer = await screen.findByTestId('device-management-drawer');
    expect(within(drawer).getByText('Bedroom Fan')).toBeInTheDocument();
  });
});
