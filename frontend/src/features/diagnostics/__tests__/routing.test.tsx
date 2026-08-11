import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../../design-system';

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
          <MemoryRouter initialEntries={[initialPath]}>
            <App />
          </MemoryRouter>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>,
  );
}

describe('Diagnostics routing + nav', () => {
  it('registers /diagnostics as a live secondary module (real page, not a placeholder)', () => {
    const diagnostics = liveSecondaryModules.find((m) => m.path === '/diagnostics');
    expect(diagnostics).toBeTruthy();
    expect(diagnostics?.status).toBe('live');
    expect(diagnostics?.ready).toBe(true);
    expect(diagnostics?.label).toBe('Diagnostics');
  });

  it('Diagnostics is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /diagnostics/i.test(m.label))).toBe(false);
  });

  it('navigating to /diagnostics renders the Diagnostics page directly', async () => {
    renderApp('/diagnostics');
    expect(screen.getByRole('heading', { name: 'Diagnostics' })).toBeInTheDocument();
    await screen.findByTestId('diagnostics-page');
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('/performance redirects to /diagnostics — Diagnostics + Performance is one combined page', async () => {
    renderApp('/performance');
    expect(await screen.findByRole('heading', { name: 'Diagnostics' })).toBeInTheDocument();
  });

  it('/diagnostics no longer redirects to /settings — it has its own real page now', () => {
    const settings = settingsModules.find((m) => m.path === '/settings');
    expect(settings?.redirectFrom ?? []).not.toContain('/diagnostics');
    expect(settings?.redirectFrom ?? []).not.toContain('/performance');
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar, from /diagnostics', async () => {
    renderApp('/diagnostics');
    await screen.findByTestId('diagnostics-page');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
