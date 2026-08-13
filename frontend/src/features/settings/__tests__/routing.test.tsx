import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';
import { SettingsProvider } from '../SettingsProvider';

// App.tsx statically pulls in ChatPage, which talks to the raw SSE client —
// stub it so importing the full app tree has no network side effects.
vi.mock('../../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../../App';
import { liveSecondaryModules, settingsModules, topBarModules } from '../../../app/modules';

function renderApp(initialPath: string) {
  return render(
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <ToastProvider>
          <SettingsProvider>
            <MemoryRouter initialEntries={[initialPath]}>
              <App />
            </MemoryRouter>
          </SettingsProvider>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>,
  );
}

describe('Settings routing + nav', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers /settings as a live settings-surface module (real page, not a placeholder)', () => {
    const settings = settingsModules.find((m) => m.path === '/settings');
    expect(settings).toBeTruthy();
    expect(settings?.status).toBe('live');
    expect(settings?.ready).toBe(true);
    expect(settings?.label).toBe('Settings');
  });

  it('Settings is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /settings/i.test(m.label))).toBe(false);
  });

  it('Settings is not a secondary (command-palette "Go to") module — it stays in the settings surface', () => {
    expect(liveSecondaryModules.some((m) => m.path === '/settings')).toBe(false);
  });

  it('navigating to /settings renders the SettingsPage directly (no longer the shared placeholder)', async () => {
    renderApp('/settings');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting) on top of SettingsProvider's own simulated-latency fetch,
    // so reaching the heading can legitimately take longer than the
    // default 1000ms findBy timeout under load.
    await screen.findByTestId('settings-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the existing /google, /microsoft redirects to /settings still work', async () => {
    renderApp('/google');
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    expect(
      await screen.findByRole('heading', { name: 'Settings' }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('/diagnostics and /performance no longer redirect to /settings — Diagnostics (Step 20) has its own page', () => {
    const settings = settingsModules.find((m) => m.path === '/settings');
    expect(settings?.redirectFrom ?? []).not.toContain('/diagnostics');
    expect(settings?.redirectFrom ?? []).not.toContain('/performance');
  });

  it('the topbar Settings icon button navigates to /settings', async () => {
    renderApp('/');
    const user = userEvent.setup();
    await user.click(screen.getByTestId('open-settings'));
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    expect(
      await screen.findByRole('heading', { name: 'Settings' }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar, from /settings', async () => {
    renderApp('/settings');
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    await screen.findByTestId('settings-page', {}, { timeout: 5000 });
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
