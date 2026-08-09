import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import { mockSmartHomeService } from '../adapters/mockSmartHomeAdapter';

import { SmartHomePage } from '../SmartHomePage';

function renderPage(initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/smart-home']) {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <SmartHomePage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its rooms/devices/scenes in module-level
// state (by design, so commands/scene triggers persist like a real backend
// would). These tests therefore run against one shared, mutating dataset and
// rely on executing in the order written below — each test's assertions
// account for mutations made by the tests before it (mirrors
// features/automations/__tests__/AutomationsPage.test.tsx and
// features/aiApps/__tests__/AiAppsPage.test.tsx).
describe('SmartHomePage', () => {
  it('renders the prominent simulation banner, seeded rooms, and seeded devices with honest availability badges', async () => {
    renderPage();
    await screen.findByTestId('room-card-room-living');

    // The disclosure must be visibly prominent, not a quiet footnote.
    const banner = screen.getByTestId('smart-home-simulation-banner');
    expect(within(banner).getByText(/Simulated devices/i)).toBeInTheDocument();
    expect(within(banner).getByText(/no command you send from this page affects anything physical/i)).toBeInTheDocument();

    const livingRoom = screen.getByTestId('room-card-room-living');
    expect(within(livingRoom).getByText('3 devices')).toBeInTheDocument();
    expect(within(livingRoom).getByText('Some on')).toBeInTheDocument();

    // Offline and unavailable devices are labeled with icon + text, not color alone.
    const offlineDevice = await screen.findByTestId('device-tile-dev-bathroom-light');
    expect(within(offlineDevice).getByText('Offline')).toBeInTheDocument();
    const unavailableDevice = screen.getByTestId('device-tile-dev-outdoor-sensor');
    expect(within(unavailableDevice).getByText('Unavailable')).toBeInTheDocument();
    expect(within(unavailableDevice).getByText('Motion')).toBeInTheDocument();
    expect(within(unavailableDevice).getByText('Clear')).toBeInTheDocument();

    // Overview stats. "Rooms"/"Scenes" also appear as section headings, so
    // assert at least one match rather than requiring a single unambiguous one.
    expect(screen.getAllByText('Rooms').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Scenes').length).toBeGreaterThan(0);
  });

  it('toggles a device power switch and the tile reflects the new state', async () => {
    renderPage();
    await screen.findByTestId('device-tile-dev-kitchen-plug');

    const toggle = screen.getByTestId('device-power-dev-kitchen-plug');
    expect(toggle).not.toBeChecked();

    const user = userEvent.setup();
    await user.click(toggle);

    await waitFor(() => expect(toggle).toBeChecked());
    const persisted = await mockSmartHomeService.getDevice('dev-kitchen-plug');
    expect(persisted.state.power).toBe(true);
  });

  it('disables every control for an offline device, so no command can be attempted', async () => {
    renderPage();
    const tile = await screen.findByTestId('device-tile-dev-bathroom-light');
    expect(within(tile).getByTestId('device-power-dev-bathroom-light')).toBeDisabled();
  });

  it('adjusts a brightness slider and the command is actually sent (not just a visual change)', async () => {
    renderPage();
    const tile = await screen.findByTestId('device-tile-dev-entrance-light');
    const slider = within(tile).getByTestId('device-brightness-dev-entrance-light');
    expect(slider).toHaveValue('0');

    fireEvent.change(slider, { target: { value: '55' } });
    expect(within(tile).getByText('55%')).toBeInTheDocument();

    await waitFor(async () => {
      const persisted = await mockSmartHomeService.getDevice('dev-entrance-light');
      expect(persisted.state.brightness).toBe(55);
    });
  });

  it('adjusts the target temperature slider and the command is actually sent', async () => {
    renderPage();
    const tile = await screen.findByTestId('device-tile-dev-living-thermostat');
    const slider = within(tile).getByTestId('device-temperature-dev-living-thermostat');

    fireEvent.change(slider, { target: { value: '24' } });
    expect(within(tile).getByText('24°C')).toBeInTheDocument();

    await waitFor(async () => {
      const persisted = await mockSmartHomeService.getDevice('dev-living-thermostat');
      expect(persisted.state.temperature).toBe(24);
    });
  });

  it('changes fan speed from the segmented select and the command is actually sent', async () => {
    renderPage();
    const tile = await screen.findByTestId('device-tile-dev-bedroom-fan');
    const trigger = within(tile).getByTestId('device-fanspeed-dev-bedroom-fan');
    expect(within(trigger).getByText('Medium')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'High' }));

    await waitFor(() => expect(within(tile).getByText('High')).toBeInTheDocument());
    const persisted = await mockSmartHomeService.getDevice('dev-bedroom-fan');
    expect(persisted.state.fanSpeed).toBe('high');
  });

  it('locks/unlocks a lock device and the label updates', async () => {
    renderPage();
    const tile = await screen.findByTestId('device-tile-dev-entrance-lock');
    const toggle = within(tile).getByTestId('device-lock-dev-entrance-lock');
    expect(toggle).toBeChecked();
    expect(within(tile).getByText('Locked')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(toggle);

    await waitFor(() => expect(within(tile).getByText('Unlocked')).toBeInTheDocument());
    const persisted = await mockSmartHomeService.getDevice('dev-entrance-lock');
    expect(persisted.state.locked).toBe(false);
  });

  it('filters the device list by room via the room select', async () => {
    renderPage();
    await screen.findByTestId('device-tile-dev-kitchen-light');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('smart-home-room-filter'));
    await user.click(await screen.findByRole('option', { name: 'Kitchen' }));

    expect(screen.getByTestId('device-tile-dev-kitchen-light')).toBeInTheDocument();
    expect(screen.getByTestId('device-tile-dev-kitchen-plug')).toBeInTheDocument();
    expect(screen.queryByTestId('device-tile-dev-living-light')).not.toBeInTheDocument();
  });

  it('clicking a room card filters the devices to that room, and clicking it again clears the filter', async () => {
    renderPage();
    await screen.findByTestId('device-tile-dev-outdoor-light');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('room-card-room-outdoor'));

    expect(screen.getByTestId('device-tile-dev-outdoor-light')).toBeInTheDocument();
    expect(screen.getByTestId('device-tile-dev-outdoor-sensor')).toBeInTheDocument();
    expect(screen.queryByTestId('device-tile-dev-kitchen-light')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('room-card-room-outdoor'));
    expect(screen.getByTestId('device-tile-dev-kitchen-light')).toBeInTheDocument();
  });

  it('triggers a scene, shows a confirmation, and the affected device tiles visibly update', async () => {
    renderPage();
    await screen.findByTestId('scene-card-scene-away-mode');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('scene-trigger-scene-away-mode'));

    // Inline confirmation (toast).
    await screen.findByText('Away Mode activated');
    expect(screen.getByText(/device.*updated/i)).toBeInTheDocument();

    // Affected device tiles re-render with the scene's target state.
    await waitFor(() => expect(screen.getByTestId('device-power-dev-living-light')).not.toBeChecked());
    await waitFor(() => expect(screen.getByTestId('device-power-dev-kitchen-light')).not.toBeChecked());
    await waitFor(() => expect(screen.getByTestId('device-lock-dev-entrance-lock')).toBeChecked());
    await waitFor(() =>
      expect(within(screen.getByTestId('device-tile-dev-living-thermostat')).getByText('16°C')).toBeInTheDocument(),
    );
  });

  it('deep-links to a specific device from Universal Search, pre-selecting its room and highlighting it', async () => {
    renderPage([{ pathname: '/smart-home', state: { deviceId: 'dev-kitchen-light' } }]);

    await waitFor(() => expect(screen.getByTestId('smart-home-room-filter')).toHaveTextContent('Kitchen'));
    await waitFor(() =>
      expect(screen.getByTestId('device-tile-dev-kitchen-light')).toHaveAttribute('data-highlighted', 'true'),
    );
  });

  it('deep-links to a room from Universal Search, pre-selecting the room filter', async () => {
    renderPage([{ pathname: '/smart-home', state: { roomId: 'room-bedroom' } }]);

    await waitFor(() => expect(screen.getByTestId('smart-home-room-filter')).toHaveTextContent('Bedroom'));
    expect(screen.getByTestId('device-tile-dev-bedroom-fan')).toBeInTheDocument();
    expect(screen.queryByTestId('device-tile-dev-kitchen-light')).not.toBeInTheDocument();
  });

  it('deep-links to a scene from Universal Search and highlights it', async () => {
    renderPage([{ pathname: '/smart-home', state: { sceneId: 'scene-movie-time' } }]);

    await waitFor(() =>
      expect(screen.getByTestId('scene-card-scene-movie-time')).toHaveAttribute('data-highlighted', 'true'),
    );
  });
});
