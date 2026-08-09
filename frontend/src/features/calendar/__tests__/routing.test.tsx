import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';

// App.tsx statically pulls in ChatPage, which talks to the raw SSE client —
// stub it so importing the full app tree has no network side effects.
vi.mock('../../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../../App';
import { liveSecondaryModules, topBarModules } from '../../../app/modules';

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

describe('Calendar routing + nav', () => {
  it('registers /calendar as a live secondary module (real page, not a placeholder)', () => {
    const calendar = liveSecondaryModules.find((m) => m.path === '/calendar');
    expect(calendar).toBeTruthy();
    expect(calendar?.status).toBe('live');
    expect(calendar?.ready).toBe(true);
  });

  it('Calendar is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /calendar/i.test(m.label))).toBe(false);
  });

  it('navigating to /calendar renders the Calendar page (not the "coming soon" placeholder)', async () => {
    renderApp('/calendar');
    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument();
    await screen.findByTestId('calendar-page');
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', async () => {
    renderApp('/calendar');
    await screen.findByTestId('calendar-page');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
