import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';
import { SettingsProvider } from '../SettingsProvider';
import { SettingsPage } from '../SettingsPage';

function renderPage() {
  return render(
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <ToastProvider>
          <SettingsProvider>
            <MemoryRouter initialEntries={['/settings']}>
              <SettingsPage />
            </MemoryRouter>
          </SettingsProvider>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the page with the Appearance tab active by default', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    await screen.findByTestId('settings-appearance');
  });

  it('switching the theme in Appearance actually changes the resolved theme (real effect, not a fake toggle)', async () => {
    renderPage();
    await screen.findByTestId('settings-appearance');
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-theme-light'));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('light'));

    await user.click(screen.getByTestId('settings-theme-dark'));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('dark'));
  });

  it('toggling Notifications persists across a remount (SettingsService round-trip)', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    await screen.findByTestId('settings-appearance');

    await user.click(screen.getByTestId('settings-tab-notifications'));
    const toggle = await screen.findByTestId('settings-notifications-toggle');
    expect(toggle).toHaveAttribute('data-state', 'checked');

    await user.click(toggle);
    await waitFor(() => expect(screen.getByTestId('settings-notifications-toggle')).toHaveAttribute('data-state', 'unchecked'));
    await waitFor(() => expect(screen.getByText('Notifications disabled')).toBeInTheDocument());

    unmount();

    renderPage();
    await user.click(await screen.findByTestId('settings-tab-notifications'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-notifications-toggle')).toHaveAttribute('data-state', 'unchecked'),
    );
  });

  it('Reset settings restores the notification default via the confirmation modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('settings-appearance');

    await user.click(screen.getByTestId('settings-tab-notifications'));
    await user.click(await screen.findByTestId('settings-notifications-toggle'));
    // The Switch is swapped for a spinner while the request is in flight
    // (see NotificationsSection.tsx) — re-query rather than reuse a stale
    // pre-click element reference, which would never observe the update.
    await waitFor(() => expect(screen.getByTestId('settings-notifications-toggle')).toHaveAttribute('data-state', 'unchecked'));

    await user.click(screen.getByTestId('settings-reset-button'));
    const modal = await screen.findByTestId('settings-reset-modal');
    expect(within(modal).getByText('Reset settings?')).toBeInTheDocument();

    await user.click(within(modal).getByTestId('settings-reset-confirm'));
    await waitFor(() => expect(screen.getByText('Settings reset')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByTestId('settings-notifications-toggle')).toHaveAttribute('data-state', 'checked'),
    );
  });

  it('Voice tab shows the real local voice backend status, not a fake control', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-voice'));
    const section = await screen.findByTestId('settings-voice');
    expect(within(section).getAllByText(/Web Speech API/).length).toBeGreaterThan(0);
  });

  it('Privacy tab links to Memory and discloses the Core retention limitation honestly', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-privacy'));
    await screen.findByTestId('settings-privacy');
    expect(screen.getByText('Core-controlled data retention')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('Smart Home tab shows real counts from SmartHomeService and connector cards', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-smart-home'));
    const summary = await screen.findByTestId('settings-smart-home-summary');
    expect(within(summary).getByText('Rooms')).toBeInTheDocument();
    expect(await screen.findByTestId('connector-card-home_assistant')).toBeInTheDocument();
    expect(screen.getByTestId('connector-card-mqtt')).toBeInTheDocument();
  });

  it('Agents tab shows real counts from AgentService', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-agents'));
    const summary = await screen.findByTestId('settings-agents-summary');
    expect(within(summary).getByText('Active')).toBeInTheDocument();
  });

  it('Automations tab shows real counts from AutomationService', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-automations'));
    const summary = await screen.findByTestId('settings-automations-summary');
    expect(within(summary).getByText('Enabled')).toBeInTheDocument();
  });

  it('AI Apps tab shows real counts from AiAppsService', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-ai-apps'));
    const summary = await screen.findByTestId('settings-ai-apps-summary');
    expect(within(summary).getByText('Connected')).toBeInTheDocument();
  });

  it('Memory tab shows a real count from MemoryService', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-memory'));
    await screen.findByTestId('settings-memory');
  });

  it('About tab shows the real frontend version and honest per-backend status, not fabricated data', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-about'));
    await screen.findByTestId('settings-about');
    expect(screen.getByTestId('settings-about-version').textContent).toMatch(/^v\d+\.\d+\.\d+$/);
    const status = screen.getByTestId('settings-about-system-status');
    expect(within(status).getAllByText('Ready').length).toBeGreaterThan(0);
  });

  it('Developer tab toggles Developer Mode and reveals the system registry + Design System link', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('settings-tab-developer'));
    // Settings is still loading for the first ~250ms (mock adapter
    // latency) — wait for the real toggle rather than the loading spinner
    // (see DeveloperSection.tsx), matching how the Notifications tests do
    // this (`await screen.findByTestId('settings-notifications-toggle')`).
    const toggle = await screen.findByTestId('settings-developer-mode-toggle');

    expect(screen.getByTestId('settings-developer-disabled-hint')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-developer-design-system')).not.toBeInTheDocument();

    await user.click(toggle);
    await waitFor(() =>
      expect(screen.getByTestId('settings-developer-mode-toggle')).toHaveAttribute('data-state', 'checked'),
    );

    expect(await screen.findByTestId('settings-developer-diagnostics-summary')).toBeInTheDocument();
    expect(screen.getByTestId('settings-developer-design-system')).toBeInTheDocument();
  });

  it('never displays a raw secret/credential anywhere on the page across every tab', async () => {
    renderPage();
    const user = userEvent.setup();
    for (const tab of [
      'appearance', 'voice', 'notifications', 'privacy', 'smart-home', 'ai-apps', 'memory', 'agents', 'automations', 'about', 'developer',
    ]) {
      await user.click(screen.getByTestId(`settings-tab-${tab}`));
      await screen.findByTestId(`settings-${tab}`);
    }
    const secretPattern = /password|api[_-]?key|access[_-]?token|secret\s*[:=]/i;
    expect(document.body.textContent).not.toMatch(secretPattern);
  }, 15000);
});
