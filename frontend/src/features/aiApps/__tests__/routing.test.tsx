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

describe('AI Apps routing + nav', () => {
  it('registers /apps as a live secondary module (real page, not a placeholder)', () => {
    const aiApps = liveSecondaryModules.find((m) => m.path === '/apps');
    expect(aiApps).toBeTruthy();
    expect(aiApps?.status).toBe('live');
    expect(aiApps?.ready).toBe(true);
  });

  it('AI Apps is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /ai apps/i.test(m.label))).toBe(false);
  });

  it('navigating to /apps renders the AI Apps page (not the "coming soon" placeholder)', async () => {
    renderApp('/apps');
    expect(screen.getByRole('heading', { name: 'AI Apps' })).toBeInTheDocument();
    await screen.findByTestId('ai-apps-page');
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the /plugins legacy path redirects to /apps', async () => {
    renderApp('/plugins');
    await screen.findByTestId('ai-apps-page');
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', async () => {
    renderApp('/apps');
    await screen.findByTestId('ai-apps-page');
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
