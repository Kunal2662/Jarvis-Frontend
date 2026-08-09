import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEventInput, CalendarService } from '../calendarService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its dataset in module-level state).
async function freshMockService(): Promise<CalendarService> {
  vi.resetModules();
  const mod = await import('../adapters/mockCalendarAdapter');
  return mod.mockCalendarService;
}

const sampleInput: CalendarEventInput = {
  title: 'Test event',
  description: 'Created in a test',
  start: '2026-08-20T10:00',
  end: '2026-08-20T11:00',
  allDay: false,
  location: 'Test room',
};

describe('calendar service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getCalendarService } = await import('../calendarService');
    const { mockCalendarService } = await import('../adapters/mockCalendarAdapter');
    expect(getCalendarService()).toBe(mockCalendarService);
    expect(mockCalendarService.id).toBe('mock');
    expect(mockCalendarService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreCalendarService } = await import('../adapters/coreCalendarAdapter');
    expect(coreCalendarService.id).toBe('core');
    expect(coreCalendarService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreCalendarService } = await import('../adapters/coreCalendarAdapter');
    const { CoreCalendarContractUnavailableError } = await import('../calendarService');
    await expect(coreCalendarService.getEvents()).rejects.toBeInstanceOf(CoreCalendarContractUnavailableError);
    await expect(coreCalendarService.getEvent('x')).rejects.toBeInstanceOf(CoreCalendarContractUnavailableError);
    await expect(coreCalendarService.createEvent(sampleInput)).rejects.toBeInstanceOf(
      CoreCalendarContractUnavailableError,
    );
    await expect(coreCalendarService.updateEvent('x', sampleInput)).rejects.toBeInstanceOf(
      CoreCalendarContractUnavailableError,
    );
    await expect(coreCalendarService.deleteEvent('x')).rejects.toBeInstanceOf(CoreCalendarContractUnavailableError);
  });

  it('seeds 8 realistic events spanning past, today, and upcoming dates', async () => {
    const service = await freshMockService();
    const events = await service.getEvents();
    expect(events).toHaveLength(8);
    // At least one all-day and one timed event.
    expect(events.some((e) => e.allDay)).toBe(true);
    expect(events.some((e) => !e.allDay)).toBe(true);
  });

  it('getEvent returns a single event', async () => {
    const service = await freshMockService();
    const event = await service.getEvent('cal-1');
    expect(event.title).toBe('Dentist checkup');
    expect(event.allDay).toBe(false);
  });

  it('getEvent rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getEvent('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('getEvents(range) filters by the `from`/`to` window over each event\'s start', async () => {
    const service = await freshMockService();
    const inWindow = await service.getEvents({ from: '2026-08-09T00:00', to: '2026-08-09T23:59' });
    expect(inWindow.every((e) => e.start.startsWith('2026-08-09'))).toBe(true);
    expect(inWindow.length).toBeGreaterThan(0);
  });

  it('createEvent adds a new event', async () => {
    const service = await freshMockService();
    const created = await service.createEvent(sampleInput);
    expect(created.title).toBe('Test event');
    expect(created.allDay).toBe(false);
    expect(created.createdAt).toBe(created.updatedAt);

    const all = await service.getEvents();
    expect(all.find((e) => e.id === created.id)).toBeTruthy();
    expect(all).toHaveLength(9);
  });

  it('updateEvent overwrites the editable fields', async () => {
    const service = await freshMockService();
    const updated = await service.updateEvent('cal-1', { ...sampleInput, title: 'Renamed event' });
    expect(updated.title).toBe('Renamed event');
    expect(updated.location).toBe('Test room');
  });

  it('deleteEvent removes the event from subsequent listings', async () => {
    const service = await freshMockService();
    const created = await service.createEvent(sampleInput);
    await service.deleteEvent(created.id);
    const all = await service.getEvents();
    expect(all.find((e) => e.id === created.id)).toBeUndefined();
    expect(all).toHaveLength(8);
  });

  it('deleteEvent rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.deleteEvent('does-not-exist')).rejects.toThrow(/not found/i);
  });
});
