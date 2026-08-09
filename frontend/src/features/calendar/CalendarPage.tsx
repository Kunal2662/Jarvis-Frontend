import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarClock, CalendarDays, CalendarRange, Plus } from 'lucide-react';
import {
  Button,
  List,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModulePage,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  useAsync,
  useToast,
  Widget,
} from '../../design-system';
import { getCalendarService, type CalendarEvent, type CalendarEventInput } from './calendarService';
import { CalendarEventRow } from './CalendarEventRow';
import { CalendarEventDetailDrawer } from './CalendarEventDetailDrawer';
import { CalendarEventForm } from './CalendarEventForm';
import { formatDayHeading, groupByDay, isThisWeek, isToday, isUpcoming } from './calendarFormat';

type FormMode = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null;
type TimeFilter = 'all' | 'today' | 'week' | 'upcoming';

const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'upcoming', label: 'All upcoming' },
];

function matches(event: CalendarEvent, term: string): boolean {
  const haystack = `${event.title} ${event.description} ${event.location ?? ''}`.toLowerCase();
  return haystack.includes(term);
}

export function CalendarPage() {
  const service = useMemo(() => getCalendarService(), []);
  const list = useAsync<CalendarEvent[]>((signal) => service.getEvents(undefined, signal));
  const location = useLocation();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormMode>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Local, patchable copy of the list — mirrors NotesPage/TasksPage so a
  // create/edit/delete never flashes the whole page back to loading.
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  useEffect(() => {
    if (list.data) setEvents(list.data);
  }, [list.data]);

  // Deep-link support (mirrors NotesPage/TasksPage): Universal Search
  // navigates here with `state: { eventId }` when a calendar result is
  // selected, so it can open straight to that event's drawer.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const eventId = (location.state as { eventId?: string } | null)?.eventId;
    if (!eventId || consumedDeepLink.current) return;
    if (events.some((e) => e.id === eventId)) {
      consumedDeepLink.current = true;
      setSelectedId(eventId);
      window.history.replaceState({}, '');
    }
  }, [location.state, events]);

  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null;

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && events.length === 0
      ? 'empty'
      : list.status;

  const handleCreate = () => setFormState({ mode: 'create' });
  const handleEdit = (event: CalendarEvent) => setFormState({ mode: 'edit', event });

  const handleFormSubmit = async (input: CalendarEventInput) => {
    setFormSubmitting(true);
    try {
      if (formState?.mode === 'edit') {
        const updated = await service.updateEvent(formState.event.id, input);
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        toast({ title: 'Event updated', description: input.title, variant: 'success' });
      } else {
        const created = await service.createEvent(input);
        setEvents((prev) => [...prev, created]);
        toast({ title: 'Event created', description: input.title, variant: 'success' });
      }
      setFormState(null);
    } catch (err) {
      toast({
        title: 'Could not save event',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast({ title: 'Event deleted', description: deleteTarget.title });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not delete event',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, selectedId, service, toast]);

  const term = filterText.trim().toLowerCase();
  const filtered = events
    .filter((e) => {
      if (timeFilter === 'today') return isToday(e);
      if (timeFilter === 'week') return isThisWeek(e);
      if (timeFilter === 'upcoming') return isUpcoming(e);
      return true;
    })
    .filter((e) => !term || matches(e, term))
    .sort((a, b) => a.start.localeCompare(b.start));

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const counts = {
    total: events.length,
    today: events.filter(isToday).length,
    week: events.filter(isThisWeek).length,
    upcoming: events.filter(isUpcoming).length,
  };

  return (
    <>
      <ModulePage
        title="Calendar"
        description={
          service.ready
            ? "JARVIS's own local calendar — an agenda view of your events. Data shown here is local to this frontend session."
            : `${service.label} — calendar data is not connected yet.`
        }
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="calendar-create">
            New event
          </Button>
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No events yet',
                description: 'Create your first event to start filling out your agenda.',
                action: (
                  <Button
                    leftIcon={<Plus className="size-4" />}
                    onClick={handleCreate}
                    data-testid="calendar-create-empty"
                  >
                    New event
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="calendar-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={counts.total} icon={<CalendarRange />} />
            <StatCard label="Today" value={counts.today} icon={<CalendarClock />} />
            <StatCard label="This week" value={counts.week} icon={<CalendarDays />} />
            <StatCard label="Upcoming" value={counts.upcoming} icon={<CalendarRange />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter events…"
              aria-label="Filter events"
              data-testid="calendar-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger aria-label="Filter by time range" className="sm:w-[180px]" data-testid="calendar-time-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Agenda"
            icon={<CalendarDays />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching events"
            emptyDescription="Try a different search term or time filter."
          >
            <div className="flex flex-col gap-4" data-testid="calendar-agenda">
              {groups.map((group) => (
                <div key={group.key}>
                  <h3 className="px-1 pb-1.5 text-overline uppercase text-content-tertiary">
                    {formatDayHeading(group.key)}
                  </h3>
                  <List className="divide-y divide-line-subtle" data-testid={`calendar-day-${group.key}`}>
                    {group.events.map((event) => (
                      <CalendarEventRow key={event.id} event={event} onOpen={setSelectedId} />
                    ))}
                  </List>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      </ModulePage>

      <CalendarEventDetailDrawer
        event={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={(event) => {
          setSelectedId(null);
          handleEdit(event);
        }}
        onDelete={(event) => setDeleteTarget(event)}
      />

      <Modal open={formState !== null} onOpenChange={(open) => !open && setFormState(null)}>
        <ModalContent size="lg" data-testid="calendar-form-modal">
          <ModalHeader>
            <ModalTitle>{formState?.mode === 'edit' ? 'Edit event' : 'New event'}</ModalTitle>
            <ModalDescription>Add an event to your local JARVIS agenda.</ModalDescription>
          </ModalHeader>
          <CalendarEventForm
            initial={formState?.mode === 'edit' ? formState.event : undefined}
            submitLabel={formState?.mode === 'edit' ? 'Save changes' : 'Create event'}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            submitting={formSubmitting}
          />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="calendar-delete-modal">
          <ModalHeader>
            <ModalTitle>Delete event?</ModalTitle>
            <ModalDescription>
              {deleteTarget ? `"${deleteTarget.title}" will be permanently deleted. This cannot be undone.` : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete} data-testid="calendar-delete-confirm">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
