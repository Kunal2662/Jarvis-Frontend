import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { KnowledgeItem, KnowledgeService } from '../knowledgeService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors
// features/automations/__tests__/AutomationsPageStates.test.tsx.
let fakeService: KnowledgeService;

vi.mock('../knowledgeService', () => ({
  getKnowledgeService: () => fakeService,
}));

import { KnowledgePage } from '../KnowledgePage';

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/knowledge']}>
          <KnowledgePage />
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<KnowledgeService>): KnowledgeService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getKnowledgeItems: vi.fn().mockResolvedValue([]),
    getKnowledgeItem: vi.fn(),
    ...overrides,
  };
}

const sampleItems: KnowledgeItem[] = [
  {
    id: 'know-a',
    title: 'Workshop Safety Checklist',
    snippet: 'Ventilation and lockout procedures.',
    content: 'Full checklist content goes here.',
    sourceType: 'file',
    tags: ['safety'],
    updatedAt: '2026-07-28T10:00:00-04:00',
  },
  {
    id: 'know-b',
    title: 'Reading List — Materials',
    snippet: 'Papers on lightweight alloys.',
    content: 'Full reading list content goes here.',
    sourceType: 'note',
    tags: ['research'],
    updatedAt: '2026-07-15T18:30:00-04:00',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('KnowledgePage async states', () => {
  it('shows a loading state while knowledge items are being fetched', () => {
    fakeService = baseService({ getKnowledgeItems: vi.fn(() => new Promise<KnowledgeItem[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no knowledge documents', async () => {
    fakeService = baseService({ getKnowledgeItems: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No knowledge documents yet');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getKnowledgeItems = vi.fn().mockRejectedValueOnce(new Error('knowledge index unreachable'));
    fakeService = baseService({ getKnowledgeItems });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/knowledge index unreachable/)).toBeInTheDocument();

    getKnowledgeItems.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getKnowledgeItems).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getKnowledgeItems: vi.fn().mockRejectedValue(new Error('Core knowledge contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});

describe('KnowledgePage list + detail', () => {
  it('renders every fetched knowledge item in the list', async () => {
    fakeService = baseService({ getKnowledgeItems: vi.fn().mockResolvedValue(sampleItems) });
    renderPage();
    await screen.findByTestId('knowledge-item-know-a');
    expect(screen.getByTestId('knowledge-item-know-b')).toBeInTheDocument();
    expect(screen.getByText('Workshop Safety Checklist')).toBeInTheDocument();
    expect(screen.getByText('Reading List — Materials')).toBeInTheDocument();
  });

  it('opens the detail drawer with full content when a row is clicked', async () => {
    fakeService = baseService({ getKnowledgeItems: vi.fn().mockResolvedValue(sampleItems) });
    renderPage();
    const row = await screen.findByTestId('knowledge-item-know-a');

    const user = userEvent.setup();
    await user.click(row);

    const drawer = await screen.findByTestId('knowledge-detail-drawer');
    expect(drawer).toHaveTextContent('Full checklist content goes here.');
  });

  it('filters the list by the local text filter (title/snippet/tags), without any page reload', async () => {
    fakeService = baseService({ getKnowledgeItems: vi.fn().mockResolvedValue(sampleItems) });
    renderPage();
    await screen.findByTestId('knowledge-item-know-a');

    const user = userEvent.setup();
    await user.type(screen.getByTestId('knowledge-filter-input'), 'materials');

    expect(screen.queryByTestId('knowledge-item-know-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('knowledge-item-know-b')).toBeInTheDocument();
    expect(fakeService.getKnowledgeItems).toHaveBeenCalledTimes(1);
  });
});
