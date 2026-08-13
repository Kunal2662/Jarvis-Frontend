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

describe('Smart Home routing + nav', () => {
  it('registers /smart-home as a live secondary module (real page, not a placeholder)', () => {
    const smartHome = liveSecondaryModules.find((m) => m.path === '/smart-home');
    expect(smartHome).toBeTruthy();
    expect(smartHome?.status).toBe('live');
    expect(smartHome?.ready).toBe(true);
    expect(smartHome?.label).toBe('Smart Home');
  });

  it('Smart Home is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /smart home/i.test(m.label))).toBe(false);
  });

  it('navigating to /smart-home renders the Smart Home page (not the "coming soon" placeholder)', async () => {
    renderApp('/smart-home');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('smart-home-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Smart Home' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar, from /smart-home', async () => {
    renderApp('/smart-home');
    await screen.findByTestId('smart-home-page', {}, { timeout: 5000 });
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });

  it('navigating to /smart-home/devices renders Device Management (not the "coming soon" placeholder)', async () => {
    renderApp('/smart-home/devices');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('device-management-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Device Management' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('navigating to /smart-home/integrations renders Integrations (not the "coming soon" placeholder)', async () => {
    renderApp('/smart-home/integrations');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('integrations-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Integrations' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });
});
