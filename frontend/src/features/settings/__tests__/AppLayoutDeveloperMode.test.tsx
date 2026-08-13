import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';
import { SettingsProvider } from '../SettingsProvider';

vi.mock('../../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../../App';

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

function openCommandPalette() {
  fireEvent.keyDown(window, { key: 'k', metaKey: true });
}

/**
 * Real end-to-end verification that Settings → Developer → "Developer
 * Mode" actually changes AppLayout's Command Palette contents (per this
 * step's "no fake toggle" requirement) — not just that the switch itself
 * flips. Mirrors AppLayoutNotifications.test.tsx.
 */
describe('Developer Mode setting gates the Command Palette', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('the Design System page is absent from ⌘K by default, and appears only after enabling Developer Mode', async () => {
    renderApp('/');
    const user = userEvent.setup();

    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByText('Design System')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());

    await user.click(screen.getByTestId('open-settings'));
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    await screen.findByTestId('settings-page', {}, { timeout: 5000 });
    await user.click(screen.getByTestId('settings-tab-developer'));
    await user.click(await screen.findByTestId('settings-developer-mode-toggle'));
    // The Switch is swapped for a spinner while the request is in flight
    // (see DeveloperSection.tsx) — re-query rather than reuse a stale
    // pre-click element reference, which would never observe the update.
    await waitFor(() =>
      expect(screen.getByTestId('settings-developer-mode-toggle')).toHaveAttribute('data-state', 'checked'),
    );

    openCommandPalette();
    const reopened = await screen.findByRole('dialog', { name: 'Command palette' });
    // Scoped to the palette dialog: the Settings → Developer tab underneath
    // it (still mounted) also shows a "Design System" card, so an
    // unscoped query would be ambiguous.
    expect(await within(reopened).findByText('Design System')).toBeInTheDocument();
  });

  it('/design is still reachable by direct navigation even when Developer Mode is off (discoverability only, never a route block)', async () => {
    renderApp('/design');
    // Generous timeout: Design System is now lazy-loaded (Step 25 route splitting).
    expect(
      await screen.findByRole('heading', { name: /design system/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('turning Developer Mode back off hides the Design System page from ⌘K again', async () => {
    renderApp('/');
    const user = userEvent.setup();

    await user.click(screen.getByTestId('open-settings'));
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    await screen.findByTestId('settings-page', {}, { timeout: 5000 });
    await user.click(screen.getByTestId('settings-tab-developer'));
    await user.click(await screen.findByTestId('settings-developer-mode-toggle'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-developer-mode-toggle')).toHaveAttribute('data-state', 'checked'),
    );

    await user.click(screen.getByTestId('settings-developer-mode-toggle'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-developer-mode-toggle')).toHaveAttribute('data-state', 'unchecked'),
    );

    openCommandPalette();
    await screen.findByRole('dialog', { name: 'Command palette' });
    expect(screen.queryByText('Design System')).not.toBeInTheDocument();
  });
});
