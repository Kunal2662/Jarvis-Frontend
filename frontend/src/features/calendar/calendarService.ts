/**
 * Calendar data seam — the transport-agnostic contract the Calendar UI
 * depends on.
 *
 *   CalendarPage → event state/presentation → CalendarService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Notes/Tasks seams (Steps 4-8, 12).
 * Like Notes/Tasks, Calendar events here are user-authored, local-first
 * content — the frontend owns full CRUD while a real JARVIS Core M11
 * contract does not exist. This is JARVIS's own calendar surface, not a
 * Google Calendar/Microsoft 365 client — third-party calendar *connectors*
 * are represented separately as AI Apps catalog entries (Step 11,
 * `features/aiApps/`); no OAuth flow is built here. Swapping the in-memory
 * mock for a real JARVIS Core Calendar API later is a matter of implementing
 * a new adapter and selecting it here — no UI changes required. We do NOT
 * invent Core endpoints; see docs/CORE_CALENDAR_CONTRACT_REQUIRED.md.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  /**
   * ISO 8601 local datetime, minute precision, deliberately WITHOUT a
   * timezone offset (e.g. "2026-08-10T09:00") — the same shape a native
   * `<input type="datetime-local">` produces. A real Core contract must
   * define how timezones are represented; see
   * docs/CORE_CALENDAR_CONTRACT_REQUIRED.md.
   */
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields the create/edit form collects. */
export interface CalendarEventInput {
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

/** Optional bounds for `getEvents` — an inclusive [from, to] window over
 *  each event's `start`, using the same local-datetime string shape. */
export interface CalendarEventRange {
  from?: string;
  to?: string;
}

/**
 * The contract every calendar backend adapter must satisfy.
 */
export interface CalendarService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getEvents(range?: CalendarEventRange, signal?: AbortSignal): Promise<CalendarEvent[]>;
  getEvent(id: string, signal?: AbortSignal): Promise<CalendarEvent>;
  createEvent(input: CalendarEventInput, signal?: AbortSignal): Promise<CalendarEvent>;
  updateEvent(id: string, input: CalendarEventInput, signal?: AbortSignal): Promise<CalendarEvent>;
  deleteEvent(id: string, signal?: AbortSignal): Promise<void>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreCalendarContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core calendar contract is not available yet.') {
    super(message);
    this.name = 'CoreCalendarContractUnavailableError';
  }
}

import { mockCalendarService } from './adapters/mockCalendarAdapter';
import { coreCalendarService } from './adapters/coreCalendarAdapter';

/**
 * Which backend feeds Calendar. Defaults to the frontend in-memory mock
 * (Core APIs are not required for this step). Set `VITE_CALENDAR_BACKEND=core`
 * once Claude Code has implemented + verified a Core calendar adapter.
 */
const CALENDAR_BACKEND = (import.meta.env.VITE_CALENDAR_BACKEND as string | undefined) ?? 'mock';

export function getCalendarService(): CalendarService {
  return CALENDAR_BACKEND === 'core' ? coreCalendarService : mockCalendarService;
}
