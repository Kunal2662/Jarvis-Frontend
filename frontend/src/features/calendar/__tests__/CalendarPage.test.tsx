import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { CalendarPage } from '../CalendarPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/calendar']}>
          <CalendarPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its events in module-level state (by design, so
// create/update/delete persist across re-renders like a real backend would).
// These tests therefore run against one shared, mutating dataset and rely on
// executing in the order written below (mirrors NotesPage.test.tsx).
describe('CalendarPage', () => {
  it('renders the seeded events grouped by day, with all-day and timed events shown distinctly', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-1');

    expect(screen.getByTestId('calendar-event-row-cal-1')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-event-row-cal-4')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    // "Today" appears both as a stat label and as the agenda's day heading.
    expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
    // cal-4 is the seeded all-day event — rendered with an "All day" marker.
    const allDayRow = screen.getByTestId('calendar-event-row-cal-4');
    expect(within(allDayRow).getByText('All day')).toBeInTheDocument();
  });

  it('filters events by search text', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-1');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('calendar-filter-input'), 'dentist');

    await waitFor(() => {
      expect(screen.queryByTestId('calendar-event-row-cal-1')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-event-row-cal-5')).not.toBeInTheDocument();
    });
  });

  it('filters events to only today via the time filter', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-time-filter'));
    await user.click(await screen.findByRole('option', { name: 'Today' }));

    await waitFor(() => {
      expect(screen.getByTestId('calendar-event-row-cal-3')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-event-row-cal-4')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-event-row-cal-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('calendar-event-row-cal-5')).not.toBeInTheDocument();
    });

    // Reset back to all events for subsequent tests in this shared-dataset file.
    await user.click(screen.getByTestId('calendar-time-filter'));
    await user.click(await screen.findByRole('option', { name: 'All events' }));
    await screen.findByTestId('calendar-event-row-cal-1');
  });

  it('opens the detail drawer for an event', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-2');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-event-row-cal-2'));

    const drawer = await screen.findByTestId('calendar-event-detail-drawer');
    expect(within(drawer).getByText('Team retro call')).toBeInTheDocument();
  });

  it('creates a new event from the form', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-create'));

    const modal = await screen.findByTestId('calendar-form-modal');
    await user.type(within(modal).getByTestId('calendar-form-title'), 'Weekend hike');
    await user.type(within(modal).getByTestId('calendar-form-description'), 'Trail near the reservoir');
    await user.click(within(modal).getByTestId('calendar-form-submit'));

    await within(screen.getByTestId('calendar-page')).findByText('Weekend hike');
  });

  it('edits an existing event from the detail drawer', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-5');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-event-row-cal-5'));
    const drawer = await screen.findByTestId('calendar-event-detail-drawer');
    await user.click(within(drawer).getByRole('button', { name: /^edit$/i }));

    const modal = await screen.findByTestId('calendar-form-modal');
    const titleInput = within(modal).getByTestId('calendar-form-title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated team standup');
    await user.click(within(modal).getByTestId('calendar-form-submit'));

    await waitFor(() =>
      expect(within(screen.getByTestId('calendar-page')).getByText('Updated team standup')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Team standup')).not.toBeInTheDocument();
  });

  it('deletes an event after confirming in the dialog', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-7');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-event-row-cal-7'));

    const drawer = await screen.findByTestId('calendar-event-detail-drawer');
    await user.click(within(drawer).getByTestId('calendar-event-delete-trigger'));

    const confirmModal = await screen.findByTestId('calendar-delete-modal');
    expect(within(confirmModal).getByText(/permanently deleted/i)).toBeInTheDocument();

    // Cancel first — the event must still be present.
    await user.click(within(confirmModal).getByRole('button', { name: /cancel/i }));
    expect(screen.getByTestId('calendar-event-row-cal-7')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-delete-modal')).not.toBeInTheDocument();

    // Trigger delete again and actually confirm.
    await user.click(within(drawer).getByTestId('calendar-event-delete-trigger'));
    const confirmModal2 = await screen.findByTestId('calendar-delete-modal');
    await user.click(within(confirmModal2).getByTestId('calendar-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('calendar-event-row-cal-7')).not.toBeInTheDocument());
  });

  it('requires a title before creating an event', async () => {
    renderPage();
    await screen.findByTestId('calendar-event-row-cal-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('calendar-create'));
    const modal = await screen.findByTestId('calendar-form-modal');
    await user.click(within(modal).getByTestId('calendar-form-submit'));

    expect(within(modal).getByTestId('calendar-form-error')).toBeInTheDocument();
  });
});
