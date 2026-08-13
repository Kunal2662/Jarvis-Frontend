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

describe('Agents routing + nav', () => {
  it('registers /agents as a live secondary module (real page, not a placeholder)', () => {
    const agents = liveSecondaryModules.find((m) => m.path === '/agents');
    expect(agents).toBeTruthy();
    expect(agents?.status).toBe('live');
    expect(agents?.ready).toBe(true);
    expect(agents?.label).toBe('Agents');
  });

  it('Agents is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /agents/i.test(m.label))).toBe(false);
  });

  it('navigating to /agents renders the Agents page directly (no longer redirects to Chat)', async () => {
    renderApp('/agents');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('agents-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Agents' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
    // The old v1 /agents → /chat redirect must be gone now that Agents has
    // its own real page — Chat no longer lists /agents among its
    // redirectFrom paths.
    const chat = topBarModules.find((m) => m.path === '/chat');
    expect(chat?.redirectFrom ?? []).not.toContain('/agents');
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar, from /agents', async () => {
    renderApp('/agents');
    await screen.findByTestId('agents-page', {}, { timeout: 5000 });
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
