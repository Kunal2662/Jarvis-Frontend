import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Memory, MemoryService } from '../memoryService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors SmartHomePageStates.test.tsx /
// NotesPageStates.test.tsx.
let fakeService: MemoryService;

vi.mock('../memoryService', () => ({
  getMemoryService: () => fakeService,
}));

import { MemoryPage } from '../MemoryPage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/memory']}>
          <MemoryPage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<MemoryService>): MemoryService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getMemories: vi.fn().mockResolvedValue([]),
    getMemory: vi.fn(),
    forgetMemory: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MemoryPage async states', () => {
  it('shows a loading state while memories are being fetched', () => {
    fakeService = baseService({ getMemories: vi.fn(() => new Promise<Memory[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no memories', async () => {
    fakeService = baseService({ getMemories: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('Nothing remembered yet');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getMemories = vi.fn().mockRejectedValueOnce(new Error('Memory data unreachable'));
    fakeService = baseService({ getMemories });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/Memory data unreachable/)).toBeInTheDocument();

    getMemories.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getMemories).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getMemories: vi.fn().mockRejectedValue(new Error('JARVIS Core memory contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });

  it('shows the ready state with seeded memories once loaded', async () => {
    const memories: Memory[] = [
      {
        id: 'mem-x',
        content: 'Prefers short status updates.',
        type: 'Preference',
        source: 'chat',
        importance: 'medium',
        createdAt: '2026-08-01T09:00:00-04:00',
      },
    ];
    fakeService = baseService({ getMemories: vi.fn().mockResolvedValue(memories) });
    renderPage();

    await screen.findByTestId('memory-row-mem-x');
    expect(screen.getByTestId('memory-simulation-banner')).toBeInTheDocument();
  });

  it('shows a no-results state when a search/filter matches nothing', async () => {
    const memories: Memory[] = [
      {
        id: 'mem-y',
        content: 'Prefers short status updates.',
        type: 'Preference',
        source: 'chat',
        importance: 'medium',
        createdAt: '2026-08-01T09:00:00-04:00',
      },
    ];
    fakeService = baseService({ getMemories: vi.fn().mockResolvedValue(memories) });
    renderPage();
    await screen.findByTestId('memory-row-mem-y');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('memory-filter-input'), 'no such memory content anywhere');
    await screen.findByText('No matching memories');
  });
});
