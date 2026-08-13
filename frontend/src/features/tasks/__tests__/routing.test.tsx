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

describe('Tasks routing + nav', () => {
  it('registers /tasks as a live secondary module (real page, not a placeholder)', () => {
    const tasks = liveSecondaryModules.find((m) => m.path === '/tasks');
    expect(tasks).toBeTruthy();
    expect(tasks?.status).toBe('live');
    expect(tasks?.ready).toBe(true);
  });

  it('Tasks is not a 5th primary nav item — nav is exactly Home, Chat, Voice, Automations', () => {
    expect(topBarModules.map((m) => m.label)).toEqual(['Home', 'Chat', 'Voice', 'Automations']);
    expect(topBarModules.some((m) => /tasks/i.test(m.label))).toBe(false);
  });

  it('navigating to /tasks renders the Tasks page (not the "coming soon" placeholder)', async () => {
    renderApp('/tasks');
    // Generous timeout: this page is now lazy-loaded (Step 25 route
    // splitting), so a fresh dynamic import() can legitimately take longer
    // than the default 1000ms findBy timeout under load.
    await screen.findByTestId('tasks-page', {}, { timeout: 5000 });
    // level: 1 disambiguates the page's own title from a seeded task that
    // happens to also be titled "Tasks" (an <h3> in its card).
    expect(screen.getByRole('heading', { name: 'Tasks', level: 1 })).toBeInTheDocument();
    expect(screen.queryByText('is coming soon')).not.toBeInTheDocument();
  });

  it('the /projects legacy path redirects to /tasks (Projects is a grouping inside Tasks, not a route)', async () => {
    renderApp('/projects');
    await screen.findByTestId('tasks-page', {}, { timeout: 5000 });
  });

  it('there is no separate /projects page — no Projects nav destination exists', () => {
    expect(liveSecondaryModules.some((m) => /projects/i.test(m.label))).toBe(false);
    expect(topBarModules.some((m) => /projects/i.test(m.label))).toBe(false);
  });

  it('the desktop top nav still shows Home / Chat / Voice / Automations with no sidebar', async () => {
    renderApp('/tasks');
    await screen.findByTestId('tasks-page', {}, { timeout: 5000 });
    for (const label of ['Home', 'Chat', 'Voice', 'Automations']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByRole('navigation', { name: /sidebar/i })).not.toBeInTheDocument();
  });
});
