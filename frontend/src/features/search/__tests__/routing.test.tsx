import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';

// App.tsx statically pulls in ChatPage, which talks to the raw SSE client —
// stub it so importing the full app tree has no network side effects.
vi.mock('../../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../../App';
import { topBarModules } from '../../../app/modules';

function renderApp(initialPath: string) {
  return render(
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <App />
          </MemoryRouter>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>,
  );
}

describe('Universal Search wiring + nav', () => {
  it('Universal Search is a cross-cutting overlay, not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /search/i.test(m.label))).toBe(false);
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', () => {
    renderApp('/');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });

  it('the topbar search icon opens the Universal Search overlay (not the Command Palette)', async () => {
    renderApp('/');
    const user = userEvent.setup();
    await user.click(screen.getByTestId('open-search'));

    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search pages, automations, chat/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
  });

  it('⌘K keeps opening the Command Palette (its existing command-execution role, left intact)', async () => {
    renderApp('/');
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('⌘⇧K opens Universal Search directly', async () => {
    renderApp('/');
    fireEvent.keyDown(window, { key: 'K', metaKey: true, shiftKey: true });

    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeInTheDocument();
  });
});
