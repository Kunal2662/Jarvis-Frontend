import { render, screen, waitFor } from '@testing-library/react';
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

/**
 * Real end-to-end verification that Settings → Notifications actually
 * changes AppLayout's behavior (per this step's explicit "no fake toggle"
 * requirement) — not just that the switch itself flips.
 */
describe('Notifications setting gates AppLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('turning notifications off empties the bell menu and hides the unread badge', async () => {
    renderApp('/');
    const user = userEvent.setup();

    expect(await screen.findByTestId('notifications-unread-badge')).toBeInTheDocument();
    await user.click(screen.getByTestId('open-notifications'));
    expect(await screen.findByText('Research Agent finished')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByTestId('open-settings'));
    await screen.findByTestId('settings-page');
    await user.click(screen.getByTestId('settings-tab-notifications'));
    await user.click(await screen.findByTestId('settings-notifications-toggle'));
    // The Switch is swapped for a spinner while the request is in flight
    // (see NotificationsSection.tsx) — re-query rather than reuse a stale
    // pre-click element reference, which would never observe the update.
    await waitFor(() => expect(screen.getByTestId('settings-notifications-toggle')).toHaveAttribute('data-state', 'unchecked'));

    expect(screen.queryByTestId('notifications-unread-badge')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('open-notifications'));
    expect(await screen.findByText("You're all caught up")).toBeInTheDocument();
    expect(screen.queryByText('Research Agent finished')).not.toBeInTheDocument();
  });
});
