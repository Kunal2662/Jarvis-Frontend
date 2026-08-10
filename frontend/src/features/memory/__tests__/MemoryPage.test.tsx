import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { MemoryPage } from '../MemoryPage';

function renderPage(initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/memory']) {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <MemoryPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its memories in module-level state (by
// design, so Forget persists across re-renders like a real backend would).
// These tests therefore run against one shared, mutating dataset and rely
// on executing in the order written below (mirrors DeviceManagementPage.test.tsx).
describe('MemoryPage', () => {
  it('renders the simulation banner, stat cards, and the seeded memory list', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-1');

    expect(screen.getByTestId('memory-simulation-banner')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByTestId('memory-row-mem-3')).toBeInTheDocument();
  });

  it('filters the memory list by search text', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-1');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('memory-filter-input'), 'temperature');

    await waitFor(() => {
      expect(screen.queryByTestId('memory-row-mem-1')).toBeInTheDocument();
      expect(screen.queryByTestId('memory-row-mem-3')).not.toBeInTheDocument();
    });
    await user.clear(screen.getByTestId('memory-filter-input'));
    await screen.findByTestId('memory-row-mem-3');
  });

  it('filters the memory list by type', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('memory-type-filter'));
    await user.click(await screen.findByRole('option', { name: 'Instruction' }));

    await waitFor(() => {
      expect(screen.getByTestId('memory-row-mem-3')).toBeInTheDocument();
      expect(screen.getByTestId('memory-row-mem-8')).toBeInTheDocument();
      expect(screen.queryByTestId('memory-row-mem-1')).not.toBeInTheDocument();
    });

    // Reset back to all types for subsequent tests in this shared-dataset file.
    await user.click(screen.getByTestId('memory-type-filter'));
    await user.click(await screen.findByRole('option', { name: 'All types' }));
    await screen.findByTestId('memory-row-mem-1');
  });

  it('opens the detail drawer for a memory with its content, source, and importance', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('memory-row-mem-1'));

    const drawer = await screen.findByTestId('memory-detail-drawer');
    expect(within(drawer).getByText('Preferred home temperature is 23°C.')).toBeInTheDocument();
    expect(within(drawer).getByText('High importance')).toBeInTheDocument();
    expect(within(drawer).getByText('Chat')).toBeInTheDocument();
  });

  it('never displays a raw secret/credential anywhere in the memory list or detail view', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-1');
    const secretPattern = /password|api[_-]?key|token|secret/i;
    expect(document.body.textContent).not.toMatch(secretPattern);
  });

  it('forgets a memory after confirming, closing the drawer and dropping it from the list', async () => {
    renderPage();
    await screen.findByTestId('memory-row-mem-9');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('memory-row-mem-9'));
    await screen.findByTestId('memory-detail-drawer');

    await user.click(screen.getByTestId('memory-forget-trigger'));
    const modal = await screen.findByTestId('memory-forget-modal');
    expect(within(modal).getByText('Forget this memory?')).toBeInTheDocument();
    expect(within(modal).getByText('This memory will be removed from local development data.')).toBeInTheDocument();
    await user.click(within(modal).getByTestId('memory-forget-confirm'));

    await waitFor(() => expect(screen.getByText('Memory forgotten')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('memory-row-mem-9')).not.toBeInTheDocument());
    expect(screen.queryByTestId('memory-detail-drawer')).not.toBeInTheDocument();
  });

  it('deep-links to a specific memory and opens its drawer directly', async () => {
    renderPage([{ pathname: '/memory', state: { memoryId: 'mem-4' } }]);

    const drawer = await screen.findByTestId('memory-detail-drawer');
    expect(within(drawer).getByText('Living room is the primary entertainment area.')).toBeInTheDocument();
  });
});
