import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, TooltipProvider } from '../../../design-system';
import type { CalendarEvent, CalendarService } from '../calendarService';

// Deterministic async-state coverage (loading / empty / error / unavailable) via
// a fully controllable fake service — mirrors NotesPageStates.test.tsx.
let fakeService: CalendarService;

vi.mock('../calendarService', () => ({
  getCalendarService: () => fakeService,
}));

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

function baseService(overrides: Partial<CalendarService>): CalendarService {
  return {
    id: 'mock',
    label: 'Frontend mock',
    ready: true,
    getEvents: vi.fn().mockResolvedValue([]),
    getEvent: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CalendarPage async states', () => {
  it('shows a loading state while events are being fetched', () => {
    fakeService = baseService({ getEvents: vi.fn(() => new Promise<CalendarEvent[]>(() => {})) });
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state with a create action when there are no events', async () => {
    fakeService = baseService({ getEvents: vi.fn().mockResolvedValue([]) });
    renderPage();
    await screen.findByText('No events yet');
    expect(screen.getByTestId('calendar-create-empty')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const getEvents = vi.fn().mockRejectedValueOnce(new Error('calendar store unreachable'));
    fakeService = baseService({ getEvents });
    renderPage();
    await screen.findByText('Something went wrong');
    expect(screen.getByText(/calendar store unreachable/)).toBeInTheDocument();

    getEvents.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(getEvents).toHaveBeenCalledTimes(2));
  });

  it('shows an unavailable state when the Core adapter is selected (not ready)', async () => {
    fakeService = baseService({
      id: 'core',
      label: 'JARVIS Core (contract pending)',
      ready: false,
      getEvents: vi.fn().mockRejectedValue(new Error('Core calendar contract is not available yet.')),
    });
    renderPage();
    await screen.findByText('Not connected');
  });
});
