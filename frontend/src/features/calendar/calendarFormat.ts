import type { CalendarEvent } from './calendarService';

/** Shared, presentation-only formatting/grouping helpers for the Calendar
 *  feature. Event `start`/`end` are local-naive datetime strings
 *  ("YYYY-MM-DDTHH:mm") — parsing them with `new Date(...)` treats them as
 *  local time in whatever timezone the browser/runtime is in, so grouping
 *  and "Today"/"Tomorrow" labeling stay internally consistent without
 *  depending on a hardcoded offset. */

/** Local YYYY-MM-DD day key for an ISO-ish datetime string. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString('en-CA');
}

export function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** "Today" / "Tomorrow" / "Yesterday" / "Wed, Aug 12" style day heading. */
export function formatDayHeading(key: string): string {
  const diff = daysBetween(todayKey(), key);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "9:00 AM – 9:45 AM" for timed events, "All day" for all-day ones. */
export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'All day';
  return `${formatTime(event.start)} – ${formatTime(event.end)}`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function isToday(event: CalendarEvent): boolean {
  return dayKey(event.start) === todayKey();
}

/** Within the next 7 days from (and including) today. */
export function isThisWeek(event: CalendarEvent): boolean {
  const diff = daysBetween(todayKey(), dayKey(event.start));
  return diff >= 0 && diff < 7;
}

/** Today or later (never strictly in the past). */
export function isUpcoming(event: CalendarEvent): boolean {
  return daysBetween(todayKey(), dayKey(event.start)) >= 0;
}

/** Groups already-sorted events by local day, preserving day order. */
export function groupByDay(sorted: CalendarEvent[]): { key: string; events: CalendarEvent[] }[] {
  const groups: { key: string; events: CalendarEvent[] }[] = [];
  for (const event of sorted) {
    const key = dayKey(event.start);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      groups.push({ key, events: [event] });
    }
  }
  return groups;
}

/** Splits a "YYYY-MM-DDTHH:mm" (or similar) local datetime into its date and
 *  time parts, for feeding separate `<input type="date">` / `<input
 *  type="time">` controls. */
export function splitLocalDateTime(iso: string): { date: string; time: string } {
  const [date = '', time = ''] = iso.split('T');
  return { date, time: time.slice(0, 5) };
}

export function combineLocalDateTime(date: string, time: string): string {
  return `${date}T${time || '00:00'}`;
}
