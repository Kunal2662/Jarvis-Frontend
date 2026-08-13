import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ToastProvider, TooltipProvider } from '../../design-system';

// App.tsx statically pulls in ChatPage, which talks to the raw SSE client —
// stub it so importing the full app tree has no network side effects.
vi.mock('../../lib/chatClient', () => ({ streamChat: vi.fn() }));

import { App } from '../../App';

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

/**
 * Step 25 — the primary strip (Home/Chat/Automations; Voice has no route of
 * its own) must stay eagerly bundled so it's on-screen the instant the app
 * boots, while every secondary surface is React.lazy so its code only
 * downloads once someone actually navigates there. This is a behavioral
 * regression guard for that split, not an implementation-detail test: it
 * asserts what a user actually sees, not which import statement was used.
 */
describe('Route code-splitting (Step 25)', () => {
  it('Home renders synchronously — no Suspense fallback, no lazy-loading gap', () => {
    renderApp('/');
    // If Home were behind a Suspense boundary, only the fallback would be
    // present at this point and this testid would not exist yet.
    expect(screen.getByTestId('command-center')).toBeInTheDocument();
  });

  it('a secondary route (Knowledge) shows the shared loading fallback before its content resolves', async () => {
    renderApp('/knowledge');
    // Synchronously right after render, the lazy chunk has not resolved yet.
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.queryByTestId('knowledge-page')).not.toBeInTheDocument();
    await screen.findByTestId('knowledge-page', {}, { timeout: 5000 });
    expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
  });
});
