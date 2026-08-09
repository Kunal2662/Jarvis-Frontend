import { useState } from 'react';
import { Button, FormField, Input, Label, Switch, TextArea } from '../../design-system';
import type { CalendarEvent, CalendarEventInput } from './calendarService';
import { combineLocalDateTime, splitLocalDateTime } from './calendarFormat';

export interface CalendarEventFormProps {
  initial?: CalendarEvent;
  submitLabel: string;
  onSubmit: (input: CalendarEventInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

function defaultTimes(): { startDate: string; startTime: string; endDate: string; endTime: string } {
  const today = new Date().toLocaleDateString('en-CA');
  return { startDate: today, startTime: '09:00', endDate: today, endTime: '10:00' };
}

export function CalendarEventForm({ initial, submitLabel, onSubmit, onCancel, submitting }: CalendarEventFormProps) {
  const initialStart = initial ? splitLocalDateTime(initial.start) : null;
  const initialEnd = initial ? splitLocalDateTime(initial.end) : null;
  const fallback = defaultTimes();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [startDate, setStartDate] = useState(initialStart?.date ?? fallback.startDate);
  const [startTime, setStartTime] = useState(initialStart?.time || fallback.startTime);
  const [endDate, setEndDate] = useState(initialEnd?.date ?? fallback.endDate);
  const [endTime, setEndTime] = useState(initialEnd?.time || fallback.endTime);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!startDate || (!allDay && !endDate)) {
      setError('Start and end dates are required.');
      return;
    }
    const start = combineLocalDateTime(startDate, allDay ? '00:00' : startTime);
    const end = combineLocalDateTime(endDate || startDate, allDay ? '23:59' : endTime);
    if (end < start) {
      setError('End must be on or after start.');
      return;
    }
    setError(undefined);
    void onSubmit({
      title: title.trim(),
      description: description.trim(),
      start,
      end,
      allDay,
      location: location.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="calendar-event-form">
      <FormField label="Title" required error={error && !title.trim() ? error : undefined}>
        {(p) => (
          <Input
            {...p}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design review"
            data-testid="calendar-form-title"
          />
        )}
      </FormField>

      <FormField label="Description">
        {(p) => (
          <TextArea
            {...p}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this event about?"
            data-testid="calendar-form-description"
          />
        )}
      </FormField>

      <FormField label="Location" description="Optional.">
        {(p) => (
          <Input
            {...p}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Conference Room B"
            data-testid="calendar-form-location"
          />
        )}
      </FormField>

      <div className="flex items-center justify-between rounded-lg border border-line-subtle p-3">
        <div className="flex flex-col">
          <Label htmlFor="calendar-form-allday">All day</Label>
          <span className="text-caption text-content-tertiary">No specific start/end time</span>
        </div>
        <Switch
          id="calendar-form-allday"
          checked={allDay}
          onCheckedChange={(checked) => setAllDay(checked === true)}
          data-testid="calendar-form-allday"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={allDay ? 'Start date' : 'Start'} required>
          {(p) => (
            <div className="flex gap-2">
              <Input
                {...p}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="calendar-form-start-date"
              />
              {!allDay && (
                <Input
                  type="time"
                  aria-label="Start time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  data-testid="calendar-form-start-time"
                />
              )}
            </div>
          )}
        </FormField>

        <FormField label={allDay ? 'End date' : 'End'} required>
          {(p) => (
            <div className="flex gap-2">
              <Input
                {...p}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="calendar-form-end-date"
              />
              {!allDay && (
                <Input
                  type="time"
                  aria-label="End time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  data-testid="calendar-form-end-time"
                />
              )}
            </div>
          )}
        </FormField>
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger" data-testid="calendar-form-error">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="calendar-form-submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
