import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../design-system';
import { SettingsProvider } from '../../features/settings/SettingsProvider';

// App.tsx statically pulls in ChatPage, which talks to the raw SSE client —
// stub it so importing the full app tree has no network side effects.
vi.mock('../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../App';

function renderApp(initialPath = '/') {
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
 * Global Command Center (roadmap item 22) — real end-to-end coverage of the
 * enhanced Command Palette: the new "Search" bridge and "Control" (Smart
 * Home scene) groups sit alongside the pre-existing "Go to"/"Actions"
 * groups without disturbing them. Mirrors
 * AppLayoutDeveloperMode.test.tsx / AppLayoutNotifications.test.tsx.
 */
describe('Global Command Center (enhanced Command Palette)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the existing Go to / Actions groups plus the new Search and Control groups', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });

    expect(within(dialog).getByText('Go to')).toBeInTheDocument();
    expect(within(dialog).getByText('Actions')).toBeInTheDocument();
    expect(within(dialog).getByText('Search')).toBeInTheDocument();
    expect(await within(dialog).findByText('Control')).toBeInTheDocument();
    // The three seeded scenes (Good Night, Movie Time, Away Mode) each
    // appear as a real Control command, not a placeholder.
    expect(within(dialog).getByText('Good Night')).toBeInTheDocument();
    expect(within(dialog).getByText('Movie Time')).toBeInTheDocument();
    expect(within(dialog).getByText('Away Mode')).toBeInTheDocument();
  });

  it('never shows an empty "Coming soon" heading — every module is live as of Step 16', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    await within(dialog).findByText('Good Night');

    // Regression guard: comingSoonModules is empty today, so the group
    // must be omitted entirely rather than rendered as a heading with
    // zero items underneath it (a real bug found in Step 26 QA).
    expect(within(dialog).queryByText('Coming soon')).not.toBeInTheDocument();
  });

  it('filtering the palette to a scene name shows only that Control command (search/filtering)', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    await within(dialog).findByText('Good Night');

    const user = userEvent.setup();
    await user.type(within(dialog).getByRole('combobox'), 'Good Night');

    await waitFor(() => {
      expect(within(dialog).getByText('Good Night')).toBeInTheDocument();
      expect(within(dialog).queryByText('Movie Time')).not.toBeInTheDocument();
      expect(within(dialog).queryByText('Away Mode')).not.toBeInTheDocument();
    });
  });

  it('selecting a Control command triggers the real scene via SmartHomeService — the same seam SmartHomePage uses', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const item = await within(dialog).findByText('Good Night');

    const user = userEvent.setup();
    await user.click(item);

    // The palette closes on selection (CommandPalette.tsx), and a real
    // success toast confirms the SmartHomeService call actually ran —
    // never a fake/implied success.
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());
    expect(await screen.findByText(/Good Night (activated|triggered)/)).toBeInTheDocument();
  });

  it('Escape closes the Command Palette (close behavior)', async () => {
    renderApp();
    openCommandPalette();
    await screen.findByRole('dialog', { name: 'Command palette' });

    const user = userEvent.setup();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());
  });

  it('the Search bridge opens the real Universal Search overlay — not a duplicate/second search surface', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const searchItem = await within(dialog).findByText('Search everything…');

    const user = userEvent.setup();
    await user.click(searchItem);

    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
    // Exactly one search surface exists — the pre-existing Universal Search,
    // never a second search index/dialog.
    expect(screen.getAllByRole('dialog', { name: 'Search' })).toHaveLength(1);
  });

  it('existing "Go to" navigation still works unchanged (regression)', async () => {
    renderApp();
    openCommandPalette();
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const chatItem = await within(dialog).findByRole('option', { name: 'Chat' });

    const user = userEvent.setup();
    await user.click(chatItem);

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());
    expect(await screen.findByTestId('chat-input')).toBeInTheDocument();
  });

  it('Developer Mode items still appear only when enabled, alongside the new groups (regression)', async () => {
    renderApp();
    const user = userEvent.setup();

    openCommandPalette();
    let dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(within(dialog).queryByText('Design System')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());

    await user.click(screen.getByTestId('open-settings'));
    // Generous timeout: Settings is now lazy-loaded (Step 25 route splitting).
    await screen.findByTestId('settings-page', {}, { timeout: 5000 });
    await user.click(screen.getByTestId('settings-tab-developer'));
    await user.click(await screen.findByTestId('settings-developer-mode-toggle'));
    await waitFor(() =>
      expect(screen.getByTestId('settings-developer-mode-toggle')).toHaveAttribute('data-state', 'checked'),
    );

    openCommandPalette();
    dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(await within(dialog).findByText('Design System')).toBeInTheDocument();
    // Still alongside the new Search/Control groups — nothing regressed.
    expect(within(dialog).getByText('Search')).toBeInTheDocument();
    expect(within(dialog).getByText('Good Night')).toBeInTheDocument();
  });

  it('⌘⇧K still opens Universal Search directly, and ⌘K still opens the Command Palette (existing shortcut regression)', async () => {
    renderApp();
    fireEvent.keyDown(window, { key: 'K', metaKey: true, shiftKey: true });
    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
  });
});
