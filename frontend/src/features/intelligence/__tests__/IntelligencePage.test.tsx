import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { Insight, IntelligenceService } from '../intelligenceService';

// Deterministic async-state coverage via a fully controllable fake service —
// mirrors features/automations/__tests__/AutomationsPageStates.test.tsx.
let fakeService: IntelligenceService;

vi.mock('../intelligenceService', () => ({
  getIntelligenceService: () => fakeService,
}));

import { IntelligencePage } from '../IntelligencePage';

function LocationMarker() {
  const location = useLocation();
  return <div data-testid="automations-marker">{location.pathname}</div>;
}

function renderPage() {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/intelligence']}>
          <Routes>
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/automations" element={<LocationMarker />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </TooltipProvider>,
  );
}

function baseService(overrides: Partial<IntelligenceService>): IntelligenceService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getInsights: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

const sampleInsights: Insight[] = [
  {
    id: 'insight-a',
    title: '3 automations haven’t run in 2 weeks',
    description: 'Review them if they are no longer needed.',
    category: 'automation',
    tone: 'warning',
    generatedAt: '2026-08-08T07:00:00-04:00',
    relatedPath: '/automations',
    relatedLabel: 'Review automations',
  },
  {
    id: 'insight-b',
    title: 'Frequently discussed topic this week: suit diagnostics',
    description: 'Based on recent chat activity.',
    category: 'usage',
    tone: 'info',
    generatedAt: '2026-08-07T09:00:00-04:00',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('IntelligencePage async states', () => {
  it('shows a loading state while insights are being fetched', () => {
    fakeService = baseService({ getInsights: vi.fn(() => new Promise<Insight[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no insights', async () => {
    fakeService = baseService({ getInsights: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No insights yet');
  });

  it('shows an error state with retry when loading fails', async () => {
    const getInsights = vi.fn().mockRejectedValueOnce(new Error('intelligence feed unreachable'));
    fakeService = baseService({ getInsights });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/intelligence feed unreachable/)).toBeInTheDocument();

    getInsights.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getInsights).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getInsights: vi.fn().mockRejectedValue(new Error('Core intelligence contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});

describe('IntelligencePage list', () => {
  it('renders every fetched insight, with tone conveyed by icon + text (not color alone)', async () => {
    fakeService = baseService({ getInsights: vi.fn().mockResolvedValue(sampleInsights) });
    renderPage();
    const cardA = await screen.findByTestId('insight-card-insight-a');
    const cardB = screen.getByTestId('insight-card-insight-b');
    expect(within(cardA).getByText('Attention')).toBeInTheDocument();
    expect(within(cardB).getByText('Info')).toBeInTheDocument();
  });

  it('has no dismiss/edit/delete controls — Intelligence is read-only', async () => {
    fakeService = baseService({ getInsights: vi.fn().mockResolvedValue(sampleInsights) });
    renderPage();
    await screen.findByTestId('insight-card-insight-a');
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('a related-path link navigates to the linked page', async () => {
    fakeService = baseService({ getInsights: vi.fn().mockResolvedValue(sampleInsights) });
    renderPage();
    await screen.findByTestId('insight-navigate-insight-a');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('insight-navigate-insight-a'));

    expect(await screen.findByTestId('automations-marker')).toHaveTextContent('/automations');
  });
});
