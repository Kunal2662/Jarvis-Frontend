import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { SearchResultGroup, SearchService } from '../searchService';

// Deterministic async-state coverage via a fully controllable fake service —
// no reliance on the mock adapter's simulated latency or seed data (mirrors
// features/automations/__tests__/AutomationsPageStates.test.tsx).
let fakeService: SearchService;
vi.mock('../searchService', () => ({ getSearchService: () => fakeService }));

import { UniversalSearch } from '../UniversalSearch';

function baseService(overrides: Partial<SearchService> = {}): SearchService {
  return {
    id: 'mock',
    label: 'Frontend mock (client-side filtering)',
    ready: true,
    search: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

const sampleGroups: SearchResultGroup[] = [
  {
    category: 'automation',
    label: 'Automations',
    results: [
      {
        id: 'automation-auto-1',
        category: 'automation',
        title: 'Morning Brief',
        description: 'Sends a daily summary every weekday morning.',
        path: '/automations',
        navState: { automationId: 'auto-1' },
      },
    ],
  },
  {
    category: 'app',
    label: 'Pages',
    results: [{ id: 'app-chat', category: 'app', title: 'Chat', description: 'Go to Chat', path: '/chat' }],
  },
];

function LocationMarker({ testId }: { testId: string }) {
  const location = useLocation();
  return <div data-testid={testId}>{JSON.stringify(location.state ?? null)}</div>;
}

function renderSearch(props: Partial<React.ComponentProps<typeof UniversalSearch>> = {}) {
  const onOpenChange = vi.fn();
  render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<UniversalSearch open onOpenChange={onOpenChange} {...props} />} />
            <Route path="/automations" element={<LocationMarker testId="automations-marker" />} />
            <Route path="/chat" element={<LocationMarker testId="chat-marker" />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
  return { onOpenChange };
}

function getInput() {
  return screen.getByRole('combobox', { name: /search/i });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('UniversalSearch', () => {
  it('shows a lightweight prompt when no query has been typed and there are no recent searches', () => {
    fakeService = baseService();
    renderSearch();
    expect(screen.getByTestId('search-idle-state')).toBeInTheDocument();
    expect(screen.getByText(/search pages, automations, and your recent chat messages/i)).toBeInTheDocument();
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', () => {
    fakeService = baseService({ id: 'core', label: 'JARVIS Core (contract pending)', ready: false });
    renderSearch();
    expect(screen.getByText('Not connected')).toBeInTheDocument();
  });

  it('shows a loading state while a query is being searched', async () => {
    fakeService = baseService({ search: vi.fn(() => new Promise<SearchResultGroup[]>(() => {})) });
    renderSearch();
    await userEvent.type(getInput(), 'brief');
    await waitFor(() => expect(screen.getByText('Searching…')).toBeInTheDocument());
  });

  it('shows a no-results state for a query that matches nothing', async () => {
    fakeService = baseService({ search: vi.fn().mockResolvedValue([]) });
    renderSearch();
    await userEvent.type(getInput(), 'zzzznomatch');
    await waitFor(() => expect(screen.getByText('No results for "zzzznomatch"')).toBeInTheDocument());
  });

  it('shows an error state when the adapter rejects', async () => {
    fakeService = baseService({ search: vi.fn().mockRejectedValue(new Error('search backend down')) });
    renderSearch();
    await userEvent.type(getInput(), 'brief');
    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
    expect(screen.getByText('search backend down')).toBeInTheDocument();
  });

  it('renders grouped, categorized results for a query', async () => {
    fakeService = baseService({ search: vi.fn().mockResolvedValue(sampleGroups) });
    renderSearch();
    await userEvent.type(getInput(), 'br');

    const list = await screen.findByTestId('search-results-list');
    expect(list).toHaveAttribute('role', 'listbox');
    expect(screen.getByText('Automations')).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByTestId('search-result-automation-auto-1')).toBeInTheDocument();
    expect(screen.getByTestId('search-result-app-chat')).toBeInTheDocument();
  });

  it('clicking a result navigates (with its navState) and closes the overlay', async () => {
    fakeService = baseService({ search: vi.fn().mockResolvedValue(sampleGroups) });
    const { onOpenChange } = renderSearch();
    await userEvent.type(getInput(), 'br');
    await screen.findByTestId('search-result-automation-auto-1');

    await userEvent.click(screen.getByTestId('search-result-automation-auto-1'));

    const marker = await screen.findByTestId('automations-marker');
    expect(marker).toHaveTextContent('automationId');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports arrow-key navigation and Enter-to-select across the flattened result list', async () => {
    fakeService = baseService({ search: vi.fn().mockResolvedValue(sampleGroups) });
    const { onOpenChange } = renderSearch();
    await userEvent.type(getInput(), 'br');
    await screen.findByTestId('search-result-automation-auto-1');

    // First result is active by default.
    expect(screen.getByTestId('search-result-automation-auto-1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('search-result-app-chat')).toHaveAttribute('aria-selected', 'false');

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByTestId('search-result-app-chat')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('search-result-automation-auto-1')).toHaveAttribute('aria-selected', 'false');

    await userEvent.keyboard('{Enter}');

    await screen.findByTestId('chat-marker');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('a "Voice" result opens the voice overlay via onOpenVoice instead of navigating', async () => {
    const voiceGroups: SearchResultGroup[] = [
      {
        category: 'app',
        label: 'Pages',
        results: [
          { id: 'app-voice', category: 'app', title: 'Voice', description: 'Open a voice session', path: '/voice', action: 'voice' },
        ],
      },
    ];
    fakeService = baseService({ search: vi.fn().mockResolvedValue(voiceGroups) });
    const onOpenVoice = vi.fn();
    const { onOpenChange } = renderSearch({ onOpenVoice });
    await userEvent.type(getInput(), 'voi');
    await screen.findByTestId('search-result-app-voice');

    await userEvent.click(screen.getByTestId('search-result-app-voice'));

    expect(onOpenVoice).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
