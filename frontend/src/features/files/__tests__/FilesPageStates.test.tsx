import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { FileEntry, FilesService } from '../filesService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors NotesPageStates.test.tsx.
let fakeService: FilesService;

vi.mock('../filesService', () => ({
  getFilesService: () => fakeService,
}));

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

function baseService(overrides: Partial<FilesService>): FilesService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getFiles: vi.fn().mockResolvedValue([]),
    getFile: vi.fn(),
    createFolder: vi.fn(),
    deleteFile: vi.fn(),
    uploadFile: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FilesPage async states', () => {
  it('shows a loading state while files are being fetched', () => {
    fakeService = baseService({ getFiles: vi.fn(() => new Promise<FileEntry[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state with a create action when the folder has no entries', async () => {
    fakeService = baseService({ getFiles: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('This folder is empty');
    expect(screen.getByTestId('files-new-folder-empty')).toBeInTheDocument();
  });

  it('still shows the breadcrumb toolbar in the empty state so navigation is not lost', async () => {
    fakeService = baseService({ getFiles: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('This folder is empty');
    expect(screen.getByTestId('files-breadcrumb')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const getFiles = vi.fn().mockRejectedValueOnce(new Error('files store unreachable'));
    fakeService = baseService({ getFiles });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/files store unreachable/)).toBeInTheDocument();

    getFiles.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getFiles).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getFiles: vi.fn().mockRejectedValue(new Error('Core files contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
