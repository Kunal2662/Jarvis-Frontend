import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { AppSettings } from '../settingsService';

// Deterministic async-state coverage (loading / saving / saved / error) via a
// fully controllable fake `useSettings()` — mirrors
// features/agents/__tests__/AgentsPageStates.test.tsx.
let fakeSettings: AppSettings;
let fakeLoading: boolean;
const update = vi.fn();

vi.mock('../SettingsProvider', () => ({
  useSettings: () => ({
    settings: fakeSettings,
    loading: fakeLoading,
    update,
    reset: vi.fn(),
    service: { id: 'mock', label: 'Local device storage', ready: true },
  }),
}));

import { NotificationsSection } from '../sections/NotificationsSection';

function renderSection() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <NotificationsSection />
      </ToastProvider>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fakeSettings = { notificationsEnabled: true };
  fakeLoading = false;
});

describe('NotificationsSection async states', () => {
  it('shows a spinner instead of the switch while settings are still loading', () => {
    fakeLoading = true;
    renderSection();
    expect(screen.getByTestId('settings-notifications-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-notifications-toggle')).not.toBeInTheDocument();
  });

  it('shows a spinner while a toggle is saving, then the updated switch once resolved', async () => {
    let resolveUpdate: (v: AppSettings) => void;
    update.mockReturnValue(new Promise<AppSettings>((resolve) => { resolveUpdate = resolve; }));
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-notifications-toggle'));
    expect(screen.getByTestId('settings-notifications-spinner')).toBeInTheDocument();

    resolveUpdate!({ notificationsEnabled: false });
    await waitFor(() => expect(screen.getByTestId('settings-notifications-toggle')).toBeInTheDocument());
    expect(screen.getByText('Notifications disabled')).toBeInTheDocument();
  });

  it('shows an error toast and keeps the control usable when the update rejects', async () => {
    update.mockRejectedValueOnce(new Error('Settings storage unavailable'));
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-notifications-toggle'));
    await screen.findByText('Could not update notification preference');
    expect(screen.getByText(/Settings storage unavailable/)).toBeInTheDocument();
    expect(screen.getByTestId('settings-notifications-toggle')).not.toBeDisabled();
  });
});
