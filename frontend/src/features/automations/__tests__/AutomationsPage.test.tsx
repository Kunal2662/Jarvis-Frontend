import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { AutomationsPage } from '../AutomationsPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/automations']}>
          <AutomationsPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its automations in module-level state (by
// design, so create/update/delete/enable persist across re-renders like a
// real backend would). These tests therefore run against one shared,
// mutating dataset and rely on executing in the order written below —
// each test's assertions account for mutations made by the tests before it.
describe('AutomationsPage', () => {
  it('renders the seeded automations with active, paused and failed status badges', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    expect(screen.getByTestId('automation-card-auto-1')).toBeInTheDocument();
    expect(within(screen.getByTestId('automation-card-auto-1')).getByText('Active')).toBeInTheDocument();
    expect(within(screen.getByTestId('automation-card-auto-3')).getByText('Paused')).toBeInTheDocument();
    expect(within(screen.getByTestId('automation-card-auto-4')).getByText('Failed')).toBeInTheDocument();

    // Overview counts.
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('toggles enable/disable from the list and persists the change', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    const toggle = screen.getByTestId('automation-toggle-auto-3');
    expect(toggle).not.toBeChecked();

    const user = userEvent.setup();
    await user.click(toggle);

    await waitFor(() => expect(toggle).toBeChecked());
    expect(within(screen.getByTestId('automation-card-auto-3')).getByText('Active')).toBeInTheDocument();
  });

  it('opens the detail drawer, pauses an active automation, and reflects the new status', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('automation-card-auto-1'));

    const drawer = await screen.findByTestId('automation-detail-drawer');
    expect(within(drawer).getByText('Morning Brief')).toBeInTheDocument();
    expect(within(drawer).getByTestId('execution-history-list')).toBeInTheDocument();

    await user.click(within(drawer).getByTestId('automation-pause-resume'));

    await waitFor(() =>
      expect(within(screen.getByTestId('automation-card-auto-1')).getByText('Paused')).toBeInTheDocument(),
    );
  });

  it('deletes an automation after confirming in the dialog', async () => {
    renderPage();
    await screen.findByText('Backup Reminder');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('automation-card-auto-5'));

    const drawer = await screen.findByTestId('automation-detail-drawer');
    await user.click(within(drawer).getByTestId('automation-delete-trigger'));

    const confirmModal = await screen.findByTestId('automation-delete-modal');
    expect(within(confirmModal).getByText(/permanently deleted/i)).toBeInTheDocument();

    // Cancel first — the automation must still be present, and the detail
    // drawer (which was never closed) stays open underneath.
    await user.click(within(confirmModal).getByRole('button', { name: /cancel/i }));
    expect(screen.getByTestId('automation-card-auto-5')).toBeInTheDocument();
    expect(screen.queryByTestId('automation-delete-modal')).not.toBeInTheDocument();

    // Trigger delete again from the still-open drawer and actually confirm.
    await user.click(within(drawer).getByTestId('automation-delete-trigger'));
    const confirmModal2 = await screen.findByTestId('automation-delete-modal');
    await user.click(within(confirmModal2).getByTestId('automation-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('automation-card-auto-5')).not.toBeInTheDocument());
  });

  it('creates a new automation from the form', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('automation-create'));

    const modal = await screen.findByTestId('automation-form-modal');
    await user.type(within(modal).getByTestId('automation-form-name'), 'Evening Wind-down');
    await user.click(screen.getByRole('button', { name: /add action/i }));
    await user.type(screen.getByLabelText('Action summary'), 'Dim the lights');

    await user.click(within(modal).getByTestId('automation-form-submit'));

    // Scope to the list container — a toast with the same automation name
    // also briefly renders (as a portal at the document root).
    await within(screen.getByTestId('automations-page')).findByText('Evening Wind-down');
  });

  it('edits an existing automation from the detail drawer', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('automation-card-auto-2'));
    const drawer = await screen.findByTestId('automation-detail-drawer');
    await user.click(within(drawer).getByRole('button', { name: /^edit$/i }));

    const modal = await screen.findByTestId('automation-form-modal');
    const nameInput = within(modal).getByTestId('automation-form-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nightly Health Check');
    await user.click(within(modal).getByTestId('automation-form-submit'));

    await waitFor(() =>
      expect(
        within(screen.getByTestId('automation-card-auto-2')).getByText('Nightly Health Check'),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText('Daily System Health Check')).not.toBeInTheDocument();
  });

  it('requires at least one action before creating an automation', async () => {
    renderPage();
    await screen.findByTestId('automation-card-auto-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('automation-create'));
    const modal = await screen.findByTestId('automation-form-modal');
    await user.type(within(modal).getByTestId('automation-form-name'), 'Incomplete automation');
    await user.click(within(modal).getByTestId('automation-form-submit'));

    expect(within(modal).getByTestId('automation-form-error')).toBeInTheDocument();
    // The modal stays open — no new card is rendered.
    expect(screen.queryByText('Incomplete automation')).not.toBeInTheDocument();
  });
});
