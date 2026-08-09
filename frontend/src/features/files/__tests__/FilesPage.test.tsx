import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';

import { FilesPage } from '../FilesPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/files']}>
          <FilesPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

// NOTE: the mock adapter keeps its entries in module-level state (by design,
// so create/delete persist across re-renders like a real backend would).
// These tests therefore run against one shared, mutating dataset and rely on
// executing in the order written below (mirrors NotesPage.test.tsx).
describe('FilesPage', () => {
  it('renders the seeded root folders and files', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    expect(screen.getByTestId('file-row-folder-1')).toBeInTheDocument();
    expect(screen.getByTestId('file-row-file-1')).toBeInTheDocument();
    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(screen.getByText('Total size')).toBeInTheDocument();
  });

  it('filters the current folder by search text', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('files-filter-input'), 'budget');

    await waitFor(() => {
      expect(screen.queryByTestId('file-row-file-1')).toBeInTheDocument();
      expect(screen.queryByTestId('file-row-folder-1')).not.toBeInTheDocument();
    });

    await user.clear(screen.getByTestId('files-filter-input'));
  });

  it('navigates into a folder and back up via the breadcrumb', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('file-row-folder-1'));

    await screen.findByTestId('file-row-file-3');
    expect(screen.getByTestId('file-row-file-4')).toBeInTheDocument();
    expect(screen.queryByTestId('file-row-folder-1')).not.toBeInTheDocument();

    const breadcrumb = screen.getByTestId('files-breadcrumb');
    expect(within(breadcrumb).getByText('Documents')).toBeInTheDocument();

    await user.click(within(breadcrumb).getByRole('button', { name: /files/i }));
    await screen.findByTestId('file-row-folder-1');
  });

  it('opens the detail drawer for a file with its metadata', async () => {
    renderPage();
    await screen.findByTestId('file-row-file-2');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('file-row-file-2'));

    const drawer = await screen.findByTestId('file-detail-drawer');
    expect(within(drawer).getByText('Welcome to JARVIS.pdf')).toBeInTheDocument();
    // "application/pdf" appears twice (drawer subtitle + the Type field) — both are correct.
    expect(within(drawer).getAllByText('application/pdf').length).toBeGreaterThan(0);
  });

  it('creates a new folder at the current level', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('files-new-folder'));

    const modal = await screen.findByTestId('new-folder-modal');
    await user.type(within(modal).getByTestId('new-folder-name'), 'Receipts');
    await user.click(within(modal).getByTestId('new-folder-submit'));

    await within(screen.getByTestId('files-page')).findByText('Receipts');
  });

  it('requires a name before creating a folder', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('files-new-folder'));
    const modal = await screen.findByTestId('new-folder-modal');
    await user.click(within(modal).getByTestId('new-folder-submit'));

    expect(within(modal).getByText(/folder name is required/i)).toBeInTheDocument();
  });

  it('adds a mock file entry with an explicit "not a real upload" disclosure', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('files-add-file'));

    const modal = await screen.findByTestId('add-file-modal');
    expect(within(modal).getByText(/no real file is uploaded or stored/i)).toBeInTheDocument();
    await user.type(within(modal).getByTestId('add-file-name'), 'Meeting notes.docx');
    await user.click(within(modal).getByTestId('add-file-submit'));

    await screen.findByText('Meeting notes.docx');
  });

  it('deletes a file from its row after confirming, and can be cancelled', async () => {
    renderPage();
    await screen.findByTestId('file-row-file-1');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('file-delete-file-1'));

    const confirmModal = await screen.findByTestId('file-delete-modal');
    expect(within(confirmModal).getByText(/permanently deleted/i)).toBeInTheDocument();

    // Cancel first — the file must still be present.
    await user.click(within(confirmModal).getByRole('button', { name: /cancel/i }));
    expect(screen.getByTestId('file-row-file-1')).toBeInTheDocument();

    // Delete again and actually confirm.
    await user.click(screen.getByTestId('file-delete-file-1'));
    const confirmModal2 = await screen.findByTestId('file-delete-modal');
    await user.click(within(confirmModal2).getByTestId('file-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('file-row-file-1')).not.toBeInTheDocument());
  });

  it('deleting a folder warns that its contents are deleted too, and cascades on confirm', async () => {
    renderPage();
    await screen.findByTestId('file-row-folder-2');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('file-delete-folder-2'));

    const confirmModal = await screen.findByTestId('file-delete-modal');
    expect(within(confirmModal).getByText(/and everything inside it/i)).toBeInTheDocument();
    await user.click(within(confirmModal).getByTestId('file-delete-confirm'));

    await waitFor(() => expect(screen.queryByTestId('file-row-folder-2')).not.toBeInTheDocument());
  });
});
