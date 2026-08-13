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

describe('Files routing + nav', () => {
  it('registers /files as a live secondary module (real page, not a placeholder)', () => {
    const files = liveSecondaryModules.find((m) => m.path === '/files');
    expect(files).toBeTruthy();
    expect(files?.status).toBe('live');
    expect(files?.ready).toBe(true);
  });

  it('Files is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /^files$/i.test(m.label))).toBe(false);
  });

  it('navigating to /files renders the Files page (not the "coming soon" placeholder)', async () => {
    renderApp('/files');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('files-page', {}, { timeout: 5000 });
    expect(screen.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', async () => {
    renderApp('/files');
    await screen.findByTestId('files-page', {}, { timeout: 5000 });
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
