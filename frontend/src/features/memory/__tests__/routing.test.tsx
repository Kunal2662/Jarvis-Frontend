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

describe('Memory routing + nav', () => {
  it('registers /memory as a live secondary module (real page, not a placeholder)', () => {
    const memory = liveSecondaryModules.find((m) => m.path === '/memory');
    expect(memory).toBeTruthy();
    expect(memory?.status).toBe('live');
    expect(memory?.ready).toBe(true);
    expect(memory?.label).toBe('Memory');
  });

  it('Memory is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /memory/i.test(m.label))).toBe(false);
  });

  it('navigating to /memory renders the Memory page directly (no longer redirects to Settings)', async () => {
    renderApp('/memory');
    expect(screen.getByRole('heading', { name: 'Memory' })).toBeInTheDocument();
    await screen.findByTestId('memory-page');
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
    // The old v1 /memory → /settings redirect must be gone now that Memory
    // has its own real page — Settings no longer lists /memory among its
    // redirectFrom paths.
    const settings = settingsModules.find((m) => m.path === '/settings');
    expect(settings?.redirectFrom).not.toContain('/memory');
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar, from /memory', async () => {
    renderApp('/memory');
    await screen.findByTestId('memory-page');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
