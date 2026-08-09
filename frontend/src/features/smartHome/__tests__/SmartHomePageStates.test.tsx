import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Device, Room, Scene, SmartHomeService } from '../smartHomeService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors AiAppsPageStates.test.tsx /
// FilesPageStates.test.tsx.
let fakeService: SmartHomeService;

vi.mock('../smartHomeService', () => ({
  getSmartHomeService: () => fakeService,
}));

import { SmartHomePage } from '../SmartHomePage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/smart-home']}>
          <SmartHomePage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<SmartHomeService>): SmartHomeService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getRooms: vi.fn().mockResolvedValue([]),
    getRoom: vi.fn(),
    getDevices: vi.fn().mockResolvedValue([]),
    getDevice: vi.fn(),
    sendCommand: vi.fn(),
    getScenes: vi.fn().mockResolvedValue([]),
    triggerScene: vi.fn(),
    subscribeToDeviceState: vi.fn().mockReturnValue(() => {}),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SmartHomePage async states', () => {
  it('shows a loading state while rooms/devices/scenes are being fetched', () => {
    fakeService = baseService({ getRooms: vi.fn(() => new Promise<Room[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no rooms or devices', async () => {
    fakeService = baseService({
      getRooms: vi.fn().mockResolvedValue([]),
      getDevices: vi.fn().mockResolvedValue([]),
      getScenes: vi.fn().mockResolvedValue([]),
    });
    renderPage();
    await screen.findByText('No rooms or devices yet');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getRooms = vi.fn().mockRejectedValueOnce(new Error('Smart Home data unreachable'));
    fakeService = baseService({
      getRooms,
      getDevices: vi.fn().mockResolvedValue([]),
      getScenes: vi.fn().mockResolvedValue([]),
    });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/Smart Home data unreachable/)).toBeInTheDocument();

    getRooms.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getRooms).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getRooms: vi.fn().mockRejectedValue(new Error('Core Smart Home contract is not available yet.')),
      getDevices: vi.fn().mockRejectedValue(new Error('Core Smart Home contract is not available yet.')),
      getScenes: vi.fn().mockRejectedValue(new Error('Core Smart Home contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });

  it('shows the ready state with rooms, devices, and scenes once loaded', async () => {
    const rooms: Room[] = [{ id: 'room-1', name: 'Office', deviceCount: 1, status: 'all_on' }];
    const devices: Device[] = [
      {
        id: 'dev-1',
        name: 'Office Light',
        roomId: 'room-1',
        type: 'Light',
        capabilities: ['power'],
        state: { power: true },
        availability: 'online',
        updatedAt: '2026-08-08T21:00:00-04:00',
      },
    ];
    const scenes: Scene[] = [
      { id: 'scene-1', name: 'Focus Mode', description: 'Turns on the office light.', actions: [] },
    ];
    fakeService = baseService({
      getRooms: vi.fn().mockResolvedValue(rooms),
      getDevices: vi.fn().mockResolvedValue(devices),
      getScenes: vi.fn().mockResolvedValue(scenes),
    });
    renderPage();

    await screen.findByTestId('room-card-room-1');
    expect(screen.getByTestId('device-tile-dev-1')).toBeInTheDocument();
    expect(screen.getByTestId('scene-card-scene-1')).toBeInTheDocument();
    expect(screen.getByTestId('smart-home-simulation-banner')).toBeInTheDocument();
  });
});
