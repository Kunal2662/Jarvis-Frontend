import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Note, NotesService } from '../notesService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors AutomationsPageStates.test.tsx.
let fakeService: NotesService;

vi.mock('../notesService', () => ({
  getNotesService: () => fakeService,
}));

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

function baseService(overrides: Partial<NotesService>): NotesService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getNotes: vi.fn().mockResolvedValue([]),
    getNote: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    setPinned: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotesPage async states', () => {
  it('shows a loading state while notes are being fetched', () => {
    fakeService = baseService({ getNotes: vi.fn(() => new Promise<Note[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state with a create action when there are no notes', async () => {
    fakeService = baseService({ getNotes: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No notes yet');
    expect(screen.getByTestId('note-create-empty')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const getNotes = vi.fn().mockRejectedValueOnce(new Error('notes store unreachable'));
    fakeService = baseService({ getNotes });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/notes store unreachable/)).toBeInTheDocument();

    getNotes.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getNotes).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getNotes: vi.fn().mockRejectedValue(new Error('Core notes contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
