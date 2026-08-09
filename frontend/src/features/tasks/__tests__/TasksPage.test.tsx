import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { TasksPage } from '../TasksPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/tasks']}>
          <TasksPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its tasks in module-level state (by design, so
// create/update/delete/status changes persist across re-renders like a real
// backend would). These tests therefore run against one shared, mutating
// dataset and rely on executing in the order written below (mirrors
// AutomationsPage.test.tsx).
describe('TasksPage', () => {
  it('renders the seeded tasks with status/priority reflected, plus overview counts', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    expect(within(screen.getByTestId('task-row-task-2')).getByText('In progress')).toBeInTheDocument();
    expect(within(screen.getByTestId('task-row-task-1')).getByText('High')).toBeInTheDocument();
    expect(within(screen.getByTestId('task-row-task-5')).getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('In progress').length).toBeGreaterThan(0);
  });

  it('filters tasks by search text', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('tasks-filter-input'), 'photos');

    await waitFor(() => {
      expect(screen.getByTestId('task-row-task-6')).toBeInTheDocument();
      expect(screen.queryByTestId('task-row-task-1')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by status', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('tasks-status-filter'));
    await user.click(await screen.findByRole('option', { name: 'Done' }));

    await waitFor(() => {
      expect(screen.getByTestId('task-row-task-5')).toBeInTheDocument();
      expect(screen.queryByTestId('task-row-task-1')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by priority', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('tasks-priority-filter'));
    await user.click(await screen.findByRole('option', { name: 'High' }));

    await waitFor(() => {
      expect(screen.getByTestId('task-row-task-2')).toBeInTheDocument();
      expect(screen.queryByTestId('task-row-task-3')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by project, including "No project"', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('tasks-project-filter'));
    await user.click(await screen.findByRole('option', { name: 'No project' }));

    await waitFor(() => {
      expect(screen.getByTestId('task-row-task-5')).toBeInTheDocument();
      expect(screen.queryByTestId('task-row-task-1')).not.toBeInTheDocument();
    });
  });

  it('toggles completion from the list checkbox and persists the change', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const checkbox = screen.getByTestId('task-complete-task-3');
    expect(checkbox).not.toBeChecked();

    const user = userEvent.setup();
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(within(screen.getByTestId('task-row-task-3')).getByText('Done')).toBeInTheDocument();

    // Reopen it so later tests see a clean, known state.
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it('opens the detail drawer and advances status via the dynamic action button', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('task-row-task-4'));

    const drawer = await screen.findByTestId('task-detail-drawer');
    expect(within(drawer).getByText('Write onboarding doc for new agents')).toBeInTheDocument();
    expect(within(drawer).getByTestId('task-advance-status')).toHaveTextContent('Start');

    await user.click(within(drawer).getByTestId('task-advance-status'));
    await waitFor(() => expect(within(drawer).getByTestId('task-advance-status')).toHaveTextContent('Mark done'));

    await user.click(within(drawer).getByTestId('task-advance-status'));
    await waitFor(() => expect(within(drawer).getByTestId('task-advance-status')).toHaveTextContent('Reopen'));
  });

  it('creates a new task from the form', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('task-create'));

    const modal = await screen.findByTestId('task-form-modal');
    await user.type(within(modal).getByTestId('task-form-title'), 'Plan release notes');
    await user.type(within(modal).getByTestId('task-form-project'), 'Docs');
    await user.click(within(modal).getByTestId('task-form-submit'));

    await within(screen.getByTestId('tasks-page')).findByText('Plan release notes');
  });

  it('edits an existing task from the detail drawer', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('task-row-task-1'));
    const drawer = await screen.findByTestId('task-detail-drawer');
    await user.click(within(drawer).getByRole('button', { name: /^edit$/i }));

    const modal = await screen.findByTestId('task-form-modal');
    const titleInput = within(modal).getByTestId('task-form-title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Draft Q3 roadmap review (v2)');
    await user.click(within(modal).getByTestId('task-form-submit'));

    await waitFor(() =>
      expect(within(screen.getByTestId('tasks-page')).getByText('Draft Q3 roadmap review (v2)')).toBeInTheDocument(),
    );
  });

  it('deletes a task after confirming in the dialog', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('task-row-task-6'));

    const drawer = await screen.findByTestId('task-detail-drawer');
    await user.click(within(drawer).getByTestId('task-delete-trigger'));

    const confirmModal = await screen.findByTestId('task-delete-modal');
    expect(within(confirmModal).getByText(/permanently deleted/i)).toBeInTheDocument();

    // Cancel first — the task must still be present.
    await user.click(within(confirmModal).getByRole('button', { name: /cancel/i }));
    expect(screen.getByTestId('task-row-task-6')).toBeInTheDocument();
    expect(screen.queryByTestId('task-delete-modal')).not.toBeInTheDocument();

    // Trigger delete again and actually confirm.
    await user.click(within(drawer).getByTestId('task-delete-trigger'));
    const confirmModal2 = await screen.findByTestId('task-delete-modal');
    await user.click(within(confirmModal2).getByTestId('task-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('task-row-task-6')).not.toBeInTheDocument());
  });

  it('requires a title before creating a task', async () => {
    renderPage();
    await screen.findByTestId('task-row-task-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('task-create'));
    const modal = await screen.findByTestId('task-form-modal');
    await user.click(within(modal).getByTestId('task-form-submit'));

    expect(within(modal).getByTestId('task-form-error')).toBeInTheDocument();
  });
});
