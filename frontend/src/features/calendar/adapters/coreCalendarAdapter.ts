import {
  CoreCalendarContractUnavailableError,
  type CalendarEvent,
  type CalendarEventInput,
  type CalendarEventRange,
  type CalendarService,
} from '../calendarService';

/**
 * JARVIS Core calendar adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core calendar contract (list/get/create/update/delete,
 * owned by JARVIS Core M11 — Intelligent Workspace & Productivity, which is
 * only 🟡 Active/Not fully closed on the Core side) is not yet available.
 * Per project rules we do NOT invent an endpoint. This adapter is the plug
 * point: once the Core calendar contract is verified, implement each method
 * here (map Core → CalendarEvent types), set `ready: true`, and select it
 * via `VITE_CALENDAR_BACKEND=core`. No CalendarPage/UI change is needed.
 *
 * See docs/CORE_CALENDAR_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreCalendarContractUnavailableError().message);
  }
  throw new CoreCalendarContractUnavailableError();
}

export const coreCalendarService: CalendarService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getEvents(_range?: CalendarEventRange): Promise<CalendarEvent[]> {
    return unavailable();
  },
  async getEvent(): Promise<CalendarEvent> {
    return unavailable();
  },
  async createEvent(_input: CalendarEventInput): Promise<CalendarEvent> {
    return unavailable();
  },
  async updateEvent(_id: string, _input: CalendarEventInput): Promise<CalendarEvent> {
    return unavailable();
  },
  async deleteEvent(): Promise<void> {
    return unavailable();
  },
};
