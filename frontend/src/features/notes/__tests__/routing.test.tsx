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

describe('Notes routing + nav', () => {
  it('registers /notes as a live secondary module (real page, not a placeholder)', () => {
    const notes = liveSecondaryModules.find((m) => m.path === '/notes');
    expect(notes).toBeTruthy();
    expect(notes?.status).toBe('live');
    expect(notes?.ready).toBe(true);
  });

  it('Notes is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /notes/i.test(m.label))).toBe(false);
  });

  it('navigating to /notes renders the Notes page (not the "coming soon" placeholder)', async () => {
    renderApp('/notes');
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    await screen.findByTestId('notes-page');
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', async () => {
    renderApp('/notes');
    await screen.findByTestId('notes-page');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
