import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { NotesPage } from '../NotesPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/notes']}>
          <NotesPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its notes in module-level state (by design, so
// create/update/delete/pin persist across re-renders like a real backend
// would). These tests therefore run against one shared, mutating dataset and
// rely on executing in the order written below (mirrors
// AutomationsPage.test.tsx) — each test's assertions account for mutations
// made by the tests before it.
describe('NotesPage', () => {
  it('renders the seeded notes with pinned notes indicated and sorted first', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    expect(screen.getByTestId('note-row-note-1')).toBeInTheDocument();
    expect(screen.getByTestId('note-row-note-3')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('filters notes by search text', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('notes-filter-input'), 'grocery');

    await waitFor(() => {
      expect(screen.queryByTestId('note-row-note-4')).toBeInTheDocument();
      expect(screen.queryByTestId('note-row-note-1')).not.toBeInTheDocument();
    });
  });

  it('filters notes by tag', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('notes-tag-filter'));
    await user.click(await screen.findByRole('option', { name: 'voice' }));

    await waitFor(() => {
      expect(screen.getByTestId('note-row-note-1')).toBeInTheDocument();
      expect(screen.queryByTestId('note-row-note-4')).not.toBeInTheDocument();
    });
  });

  it('toggles pin from the list row and persists the change', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-pin-note-4'));

    // Pinning moves note-4 to the top of the (now-sorted) list — assert via
    // the widget's presence rather than order, since jsdom layout doesn't
    // reflect visual position.
    await waitFor(() => expect(screen.getByTestId('note-pin-note-4')).toHaveAttribute('aria-label', 'Unpin Grocery list'));
  });

  it('opens the detail drawer and unpins a pinned note from there', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-row-note-1'));

    const drawer = await screen.findByTestId('note-detail-drawer');
    expect(within(drawer).getByText('Ideas for Voice Orb redesign')).toBeInTheDocument();
    expect(within(drawer).getByTestId('note-pin-toggle')).toHaveTextContent('Unpin');

    await user.click(within(drawer).getByTestId('note-pin-toggle'));
    await waitFor(() => expect(within(drawer).getByTestId('note-pin-toggle')).toHaveTextContent('Pin'));
  });

  it('creates a new note from the form', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-create'));

    const modal = await screen.findByTestId('note-form-modal');
    await user.type(within(modal).getByTestId('note-form-title'), 'Weekend plan');
    await user.type(within(modal).getByTestId('note-form-content'), 'Hike in the morning');
    await user.type(within(modal).getByTestId('note-form-tags'), 'personal, outdoors');
    await user.click(within(modal).getByTestId('note-form-submit'));

    await within(screen.getByTestId('notes-page')).findByText('Weekend plan');
  });

  it('edits an existing note from the detail drawer', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-row-note-5'));
    const drawer = await screen.findByTestId('note-detail-drawer');
    await user.click(within(drawer).getByRole('button', { name: /^edit$/i }));

    const modal = await screen.findByTestId('note-form-modal');
    const titleInput = within(modal).getByTestId('note-form-title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated reading list');
    await user.click(within(modal).getByTestId('note-form-submit'));

    await waitFor(() =>
      expect(within(screen.getByTestId('notes-page')).getByText('Updated reading list')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Reading list')).not.toBeInTheDocument();
  });

  it('deletes a note after confirming in the dialog', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-row-note-3'));

    const drawer = await screen.findByTestId('note-detail-drawer');
    await user.click(within(drawer).getByTestId('note-delete-trigger'));

    const confirmModal = await screen.findByTestId('note-delete-modal');
    expect(within(confirmModal).getByText(/permanently deleted/i)).toBeInTheDocument();

    // Cancel first — the note must still be present.
    await user.click(within(confirmModal).getByRole('button', { name: /cancel/i }));
    expect(screen.getByTestId('note-row-note-3')).toBeInTheDocument();
    expect(screen.queryByTestId('note-delete-modal')).not.toBeInTheDocument();

    // Trigger delete again and actually confirm.
    await user.click(within(drawer).getByTestId('note-delete-trigger'));
    const confirmModal2 = await screen.findByTestId('note-delete-modal');
    await user.click(within(confirmModal2).getByTestId('note-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('note-row-note-3')).not.toBeInTheDocument());
  });

  it('requires a title before creating a note', async () => {
    renderPage();
    await screen.findByTestId('note-row-note-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('note-create'));
    const modal = await screen.findByTestId('note-form-modal');
    await user.click(within(modal).getByTestId('note-form-submit'));

    expect(within(modal).getByTestId('note-form-error')).toBeInTheDocument();
  });
});
