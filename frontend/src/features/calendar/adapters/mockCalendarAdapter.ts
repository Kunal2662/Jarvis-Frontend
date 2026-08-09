import type { CalendarEvent, CalendarEventInput, CalendarEventRange, CalendarService } from '../calendarService';

/**
 * Frontend in-memory mock adapter for Calendar. All mock data + mutation
 * logic lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state
 * so the UI is fully interactive (not static). A future Core adapter can
 * replace this wholesale — no UI change required. Mirrors
 * mockNotesAdapter.ts / mockTasksAdapter.ts's shape/style.
 *
 * Seeded events are anchored to a fixed "today" (2026-08-09) spanning a
 * couple of days in the past, two events today (one timed, one all-day),
 * and several across the upcoming week+, so both the default "all" view and
 * the today/this-week/upcoming filters have real data to show.
 */

let seq = 100;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let events: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Dentist checkup',
    description: 'Routine cleaning and checkup.',
    start: '2026-08-05T10:00',
    end: '2026-08-05T10:45',
    allDay: false,
    location: 'Bright Smile Dental',
    createdAt: '2026-07-20T09:00:00-04:00',
    updatedAt: '2026-07-20T09:00:00-04:00',
  },
  {
    id: 'cal-2',
    title: 'Team retro call',
    description: 'Walk through Steps 8-11 delivery with the team.',
    start: '2026-08-07T14:00',
    end: '2026-08-07T15:00',
    allDay: false,
    location: undefined,
    createdAt: '2026-07-25T11:00:00-04:00',
    updatedAt: '2026-07-25T11:00:00-04:00',
  },
  {
    id: 'cal-3',
    title: 'Quick jog',
    description: '5K loop around the block before the day starts.',
    start: '2026-08-09T07:00',
    end: '2026-08-09T07:45',
    allDay: false,
    location: 'Riverside Park',
    createdAt: '2026-08-01T08:00:00-04:00',
    updatedAt: '2026-08-01T08:00:00-04:00',
  },
  {
    id: 'cal-4',
    title: "Mom's birthday",
    description: 'Call in the evening and send the flowers.',
    start: '2026-08-09T00:00',
    end: '2026-08-09T23:59',
    allDay: true,
    location: undefined,
    createdAt: '2026-06-01T08:00:00-04:00',
    updatedAt: '2026-06-01T08:00:00-04:00',
  },
  {
    id: 'cal-5',
    title: 'Team standup',
    description: 'Quick sync on open follow-ups and this week\'s priorities.',
    start: '2026-08-10T09:00',
    end: '2026-08-10T09:15',
    allDay: false,
    location: undefined,
    createdAt: '2026-08-03T09:00:00-04:00',
    updatedAt: '2026-08-03T09:00:00-04:00',
  },
  {
    id: 'cal-6',
    title: 'Design review — Voice UI redesign',
    description: 'Walk through the softer pulse animation and the low-power listening ring.',
    start: '2026-08-12T13:00',
    end: '2026-08-12T14:00',
    allDay: false,
    location: 'Conference Room B',
    createdAt: '2026-08-02T10:00:00-04:00',
    updatedAt: '2026-08-02T10:00:00-04:00',
  },
  {
    id: 'cal-7',
    title: 'Pick up dry cleaning',
    description: '',
    start: '2026-08-14T18:00',
    end: '2026-08-14T18:30',
    allDay: false,
    location: 'Main Street Cleaners',
    createdAt: '2026-08-06T12:00:00-04:00',
    updatedAt: '2026-08-06T12:00:00-04:00',
  },
  {
    id: 'cal-8',
    title: 'New router delivery window',
    description: 'Backup router arriving — swap the old one that keeps dropping Wi-Fi.',
    start: '2026-08-18T00:00',
    end: '2026-08-18T23:59',
    allDay: true,
    location: undefined,
    createdAt: '2026-08-06T19:30:00-04:00',
    updatedAt: '2026-08-06T19:30:00-04:00',
  },
];

function clone(e: CalendarEvent): CalendarEvent {
  return { ...e };
}

function requireEvent(id: string): CalendarEvent {
  const found = events.find((e) => e.id === id);
  if (!found) throw new Error(`Calendar event "${id}" was not found.`);
  return found;
}

function inRange(event: CalendarEvent, range?: CalendarEventRange): boolean {
  if (!range) return true;
  if (range.from && event.start < range.from) return false;
  if (range.to && event.start > range.to) return false;
  return true;
}

export const mockCalendarService: CalendarService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getEvents(range?: CalendarEventRange, signal?: AbortSignal): Promise<CalendarEvent[]> {
    const filtered = events.filter((e) => inRange(e, range)).map(clone);
    return withAbort(signal, filtered);
  },

  async getEvent(id: string, signal?: AbortSignal): Promise<CalendarEvent> {
    const found = requireEvent(id);
    return withAbort(signal, clone(found), 200);
  },

  async createEvent(input: CalendarEventInput, signal?: AbortSignal): Promise<CalendarEvent> {
    const now = new Date().toISOString();
    const created: CalendarEvent = {
      id: nextId('cal'),
      title: input.title,
      description: input.description,
      start: input.start,
      end: input.end,
      allDay: input.allDay,
      location: input.location,
      createdAt: now,
      updatedAt: now,
    };
    events = [...events, created];
    return withAbort(signal, clone(created));
  },

  async updateEvent(id: string, input: CalendarEventInput, signal?: AbortSignal): Promise<CalendarEvent> {
    const existing = requireEvent(id);
    const updated: CalendarEvent = {
      ...existing,
      title: input.title,
      description: input.description,
      start: input.start,
      end: input.end,
      allDay: input.allDay,
      location: input.location,
      updatedAt: new Date().toISOString(),
    };
    events = events.map((e) => (e.id === id ? updated : e));
    return withAbort(signal, clone(updated));
  },

  async deleteEvent(id: string, signal?: AbortSignal): Promise<void> {
    requireEvent(id);
    events = events.filter((e) => e.id !== id);
    return withAbort(signal, undefined);
  },
};
