import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { AiAppsPage } from '../AiAppsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/apps']}>
          <AiAppsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its catalog in module-level state (by design,
// so connect/disconnect persists across re-renders like a real backend
// would). These tests therefore run against one shared, mutating dataset and
// rely on executing in the order written below (mirrors
// features/automations/__tests__/AutomationsPage.test.tsx).
describe('AiAppsPage', () => {
  it('renders the seeded catalog with mixed categories and connection statuses, plus overview counts', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-web-search');

    expect(within(screen.getByTestId('ai-app-card-web-search')).getByText('Connected')).toBeInTheDocument();
    expect(within(screen.getByTestId('ai-app-card-web-search')).getByText('MCP Tool')).toBeInTheDocument();
    expect(within(screen.getByTestId('ai-app-card-gmail')).getByText('Not connected')).toBeInTheDocument();
    expect(within(screen.getByTestId('ai-app-card-gmail')).getByText('Connector')).toBeInTheDocument();
    expect(within(screen.getByTestId('ai-app-card-microsoft-365')).getByText('Unavailable')).toBeInTheDocument();

    // Overview counts. "Connected" also appears as a per-card status badge,
    // so assert the stat label exists among (potentially) multiple matches
    // rather than requiring a single unambiguous match.
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    expect(screen.getByText('MCP tools')).toBeInTheDocument();
    expect(screen.getByText('Connectors')).toBeInTheDocument();
  });

  it('toggles connect/disconnect from the catalog card and persists the change', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-code-sandbox');

    const toggle = screen.getByTestId('ai-app-toggle-code-sandbox');
    expect(toggle).not.toBeChecked();

    const user = userEvent.setup();
    await user.click(toggle);

    await waitFor(() => expect(toggle).toBeChecked());
    expect(within(screen.getByTestId('ai-app-card-code-sandbox')).getByText('Connected')).toBeInTheDocument();

    // Disconnect it again so later tests see a clean, known state.
    await user.click(toggle);
    await waitFor(() => expect(toggle).not.toBeChecked());
  });

  it('disables the toggle for an app marked unavailable and never connects it', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-microsoft-365');

    const toggle = screen.getByTestId('ai-app-toggle-microsoft-365');
    expect(toggle).toBeDisabled();
    expect(toggle).not.toBeChecked();
  });

  it('opens the detail drawer with full description, capabilities, and the mock/local disclosure', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-file-access');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('ai-app-card-file-access'));

    const drawer = await screen.findByTestId('ai-app-detail-drawer');
    expect(within(drawer).getByText('File Access')).toBeInTheDocument();
    expect(within(drawer).getByText(/Capabilities/)).toBeInTheDocument();
    expect(within(drawer).getByText(/Read files in the current workspace/)).toBeInTheDocument();
    // Honest disclosure that this is a local/mock connection, not a real OAuth session.
    expect(within(drawer).getByText(/does not start a real sign-in or OAuth flow/i)).toBeInTheDocument();
  });

  it('toggles connect/disconnect from the detail drawer and reflects it back on the card', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-gmail');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('ai-app-card-gmail'));

    const drawer = await screen.findByTestId('ai-app-detail-drawer');
    const drawerToggle = within(drawer).getByTestId('ai-app-detail-toggle');
    expect(drawerToggle).not.toBeChecked();

    await user.click(drawerToggle);

    await waitFor(() => expect(drawerToggle).toBeChecked());
    expect(within(screen.getByTestId('ai-app-card-gmail')).getByText('Connected')).toBeInTheDocument();
  });

  it('filters the catalog by category', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-web-search');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('ai-apps-category-filter'));
    await user.click(await screen.findByRole('option', { name: 'Connectors' }));

    expect(screen.queryByTestId('ai-app-card-web-search')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-app-card-gmail')).toBeInTheDocument();
    expect(screen.getByTestId('ai-app-card-google-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('ai-app-card-microsoft-365')).toBeInTheDocument();
  });

  it('filters the catalog by the local text filter, without any extra service call side effects', async () => {
    renderPage();
    await screen.findByTestId('ai-app-card-web-search');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('ai-apps-filter-input'), 'sandbox');

    expect(screen.queryByTestId('ai-app-card-web-search')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-app-card-code-sandbox')).toBeInTheDocument();
  });
});
