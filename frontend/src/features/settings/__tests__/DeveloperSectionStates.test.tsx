import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { AppSettings } from '../settingsService';
import type { SystemComponentStatus } from '../../diagnostics/diagnosticsService';

// Deterministic async-state coverage via a fully controllable fake
// `useSettings()` — mirrors NotificationsSectionStates.test.tsx.
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

let getSystemStatus: ReturnType<typeof vi.fn>;
vi.mock('../../diagnostics/diagnosticsService', () => ({
  getDiagnosticsService: () => ({
    id: 'mock',
    label: 'Frontend introspection (local adapter registry)',
    ready: true,
    getSystemStatus: (...args: unknown[]) => getSystemStatus(...args),
    getCoreHealth: vi.fn(),
  }),
}));

import { DeveloperSection } from '../sections/DeveloperSection';

function renderSection() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/settings']}>
          <DeveloperSection />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fakeSettings = { notificationsEnabled: true, developerModeEnabled: false };
  fakeLoading = false;
  getSystemStatus = vi.fn().mockResolvedValue([
    { key: 'chat', name: 'Chat / Voice orchestrator', backendId: 'dev', backendLabel: 'Dev stream', ready: true },
  ] satisfies SystemComponentStatus[]);
});

describe('DeveloperSection async states', () => {
  it('shows a spinner instead of the switch while settings are still loading', () => {
    fakeLoading = true;
    renderSection();
    expect(screen.getByTestId('settings-developer-mode-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-developer-mode-toggle')).not.toBeInTheDocument();
  });

  it('shows the disabled hint and no registry/design-system cards when Developer Mode is off', () => {
    renderSection();
    expect(screen.getByTestId('settings-developer-disabled-hint')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-developer-diagnostics-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-developer-design-system')).not.toBeInTheDocument();
  });

  it('shows a spinner while toggling is saving, then the updated switch once resolved', async () => {
    let resolveUpdate: (v: AppSettings) => void;
    update.mockReturnValue(
      new Promise<AppSettings>((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-developer-mode-toggle'));
    expect(screen.getByTestId('settings-developer-mode-spinner')).toBeInTheDocument();

    resolveUpdate!({ notificationsEnabled: true, developerModeEnabled: true });
    await waitFor(() => expect(screen.getByTestId('settings-developer-mode-toggle')).toBeInTheDocument());
    expect(screen.getByText('Developer Mode enabled')).toBeInTheDocument();
  });

  it('shows an error toast and keeps the control usable when the update rejects', async () => {
    update.mockRejectedValueOnce(new Error('Settings storage unavailable'));
    renderSection();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-developer-mode-toggle'));
    await screen.findByText('Could not update Developer Mode');
    expect(screen.getByText(/Settings storage unavailable/)).toBeInTheDocument();
    expect(screen.getByTestId('settings-developer-mode-toggle')).not.toBeDisabled();
  });

  it('shows the system registry summary and Design System card once Developer Mode is on', async () => {
    fakeSettings = { notificationsEnabled: true, developerModeEnabled: true };
    renderSection();

    const summary = await screen.findByTestId('settings-developer-diagnostics-summary');
    expect(within(summary).getByText('Components')).toBeInTheDocument();
    expect(within(summary).getByText('Ready')).toBeInTheDocument();
    expect(screen.getByTestId('settings-developer-design-system')).toBeInTheDocument();
    expect(screen.getByText('Now in ⌘K')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-developer-disabled-hint')).not.toBeInTheDocument();
  });
});
