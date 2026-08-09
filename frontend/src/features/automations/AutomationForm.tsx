import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  FormField,
  IconButton,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextArea,
} from '../../design-system';
import type {
  Automation,
  AutomationActionType,
  AutomationCondition,
  AutomationInput,
  AutomationTriggerType,
} from './automationService';

const ACTION_TYPES: { value: AutomationActionType; label: string }[] = [
  { value: 'notify', label: 'Send notification' },
  { value: 'run-agent', label: 'Run agent' },
  { value: 'device', label: 'Control device' },
  { value: 'integration', label: 'Call integration' },
];

let draftSeq = 0;
function draftId(prefix: string): string {
  draftSeq += 1;
  return `${prefix}-draft-${draftSeq}`;
}

interface DraftAction {
  id: string;
  type: AutomationActionType;
  summary: string;
}

export interface AutomationFormProps {
  initial?: Automation;
  submitLabel: string;
  onSubmit: (input: AutomationInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function AutomationForm({ initial, submitLabel, onSubmit, onCancel, submitting }: AutomationFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>(initial?.trigger.type ?? 'schedule');
  const [schedule, setSchedule] = useState(initial?.trigger.schedule ?? '');
  const [event, setEvent] = useState(initial?.trigger.event ?? '');
  const [triggerSummary, setTriggerSummary] = useState(initial?.trigger.summary ?? '');
  const [conditions, setConditions] = useState<AutomationCondition[]>(
    initial?.conditions.map((c) => ({ ...c })) ?? [],
  );
  const [actions, setActions] = useState<DraftAction[]>(
    (initial?.actions ?? []).map((a) => ({ ...a })),
  );
  const [error, setError] = useState<string | undefined>();

  const addCondition = () => setConditions((prev) => [...prev, { id: draftId('cond'), summary: '' }]);
  const removeCondition = (id: string) => setConditions((prev) => prev.filter((c) => c.id !== id));
  const updateCondition = (id: string, summary: string) =>
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, summary } : c)));

  const addAction = () => setActions((prev) => [...prev, { id: draftId('act'), type: 'notify', summary: '' }]);
  const removeAction = (id: string) => setActions((prev) => prev.filter((a) => a.id !== id));
  const updateAction = (id: string, patch: Partial<DraftAction>) =>
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (actions.length === 0 || actions.some((a) => !a.summary.trim())) {
      setError('At least one action is required, and every action needs a summary.');
      return;
    }
    setError(undefined);
    void onSubmit({
      name: name.trim(),
      description: description.trim(),
      trigger: {
        type: triggerType,
        summary: triggerSummary.trim() || (triggerType === 'schedule' ? schedule : event) || 'Untitled trigger',
        schedule: triggerType === 'schedule' ? schedule.trim() || undefined : undefined,
        event: triggerType === 'event' ? event.trim() || undefined : undefined,
      },
      conditions: conditions.filter((c) => c.summary.trim()).map((c) => ({ ...c, summary: c.summary.trim() })),
      actions: actions.map((a) => ({ id: a.id, type: a.type, summary: a.summary.trim() })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="automation-form">
      <FormField label="Name" required error={error && !name.trim() ? error : undefined}>
        {(p) => (
          <Input
            {...p}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Brief"
            data-testid="automation-form-name"
          />
        )}
      </FormField>

      <FormField label="Description">
        {(p) => (
          <TextArea
            {...p}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this automation do?"
            data-testid="automation-form-description"
          />
        )}
      </FormField>

      <div className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
        <span className="text-body-sm font-semibold text-content">Trigger</span>
        <FormField label="Type">
          {(p) => (
            <Select value={triggerType} onValueChange={(v) => setTriggerType(v as AutomationTriggerType)}>
              <SelectTrigger id={p.id} data-testid="automation-form-trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule">Schedule</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField label="Summary" description="Human-readable description shown in the automation list.">
          {(p) => (
            <Input
              {...p}
              value={triggerSummary}
              onChange={(e) => setTriggerSummary(e.target.value)}
              placeholder="e.g. Every weekday at 7:00 AM"
              data-testid="automation-form-trigger-summary"
            />
          )}
        </FormField>
        {triggerType === 'schedule' ? (
          <FormField label="Schedule (cron)" description="Optional cron expression.">
            {(p) => (
              <Input
                {...p}
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 7 * * 1-5"
              />
            )}
          </FormField>
        ) : (
          <FormField label="Event name">
            {(p) => (
              <Input
                {...p}
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="e.g. new-email"
              />
            )}
          </FormField>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-semibold text-content">Conditions</span>
          <Button type="button" variant="ghost" size="sm" leftIcon={<Plus />} onClick={addCondition}>
            Add condition
          </Button>
        </div>
        {conditions.length === 0 && (
          <p className="text-caption text-content-tertiary">No conditions — this automation always runs on trigger.</p>
        )}
        {conditions.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <Input
              value={c.summary}
              onChange={(e) => updateCondition(c.id, e.target.value)}
              placeholder="e.g. Only on weekdays"
              aria-label="Condition"
              className="flex-1"
            />
            <IconButton
              type="button"
              label="Remove condition"
              variant="ghost"
              onClick={() => removeCondition(c.id)}
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-semibold text-content">Actions</span>
          <Button type="button" variant="ghost" size="sm" leftIcon={<Plus />} onClick={addAction}>
            Add action
          </Button>
        </div>
        {actions.length === 0 && (
          <p className="text-caption text-content-tertiary">Add at least one action to run when this automation fires.</p>
        )}
        {actions.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <Select value={a.type} onValueChange={(v) => updateAction(a.id, { type: v as AutomationActionType })}>
              <SelectTrigger aria-label="Action type" className="w-[160px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={a.summary}
              onChange={(e) => updateAction(a.id, { summary: e.target.value })}
              placeholder="e.g. Send a morning brief notification"
              aria-label="Action summary"
              className="flex-1"
            />
            <IconButton type="button" label="Remove action" variant="ghost" onClick={() => removeAction(a.id)}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger" data-testid="automation-form-error">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="automation-form-submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
