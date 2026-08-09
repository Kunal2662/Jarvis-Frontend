import { CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '../../design-system';
import type { CalendarEvent } from './calendarService';
import { formatDateTime, formatDayHeading, formatEventTime, dayKey } from './calendarFormat';

export interface CalendarEventDetailDrawerProps {
  event: CalendarEvent | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export function CalendarEventDetailDrawer({
  event,
  loading,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CalendarEventDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="calendar-event-detail-drawer">
        {loading || !event ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{event.title}</DrawerTitle>
                {event.allDay && (
                  <Badge variant="accent" size="sm">
                    <CalendarDays />
                    All day
                  </Badge>
                )}
              </div>
              <DrawerDescription>
                {formatDayHeading(dayKey(event.start))} · {formatEventTime(event)}
              </DrawerDescription>
            </DrawerHeader>

            {event.location && (
              <div className="flex items-center gap-1.5 text-body-sm text-content-secondary">
                <MapPin className="size-4 shrink-0 text-content-tertiary" />
                {event.location}
              </div>
            )}

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Description</h3>
              <p className="whitespace-pre-wrap rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                {event.description || 'No description.'}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Timeline</h3>
              <p className="rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                Created {formatDateTime(event.createdAt)} · Updated {formatDateTime(event.updatedAt)}
              </p>
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
              <Button variant="secondary" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(event)}>
                Edit
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onDelete(event)}
                className="ml-auto"
                data-testid="calendar-event-delete-trigger"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
