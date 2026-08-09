import { CalendarClock, CalendarDays, MapPin } from 'lucide-react';
import { Badge, ListRow } from '../../design-system';
import type { CalendarEvent } from './calendarService';
import { formatEventTime, formatTime } from './calendarFormat';

export interface CalendarEventRowProps {
  event: CalendarEvent;
  onOpen: (id: string) => void;
}

export function CalendarEventRow({ event, onOpen }: CalendarEventRowProps) {
  return (
    <ListRow
      leading={
        event.allDay ? (
          <Badge variant="outline" size="sm">
            All day
          </Badge>
        ) : (
          <span className="flex w-[74px] shrink-0 flex-col text-caption font-medium text-content-secondary">
            {formatTime(event.start)}
          </span>
        )
      }
      title={event.title}
      subtitle={
        event.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            {event.location}
          </span>
        ) : event.allDay ? (
          // The leading badge already says "All day" — don't repeat it here.
          undefined
        ) : (
          formatEventTime(event)
        )
      }
      trailing={event.allDay ? <CalendarDays /> : <CalendarClock />}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(event.id);
        }
      }}
      data-testid={`calendar-event-row-${event.id}`}
      aria-label={`Open ${event.title}`}
    />
  );
}
