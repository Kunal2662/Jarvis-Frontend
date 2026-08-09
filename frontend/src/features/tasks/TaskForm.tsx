import { useState } from 'react';
import {
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextArea,
} from '../../design-system';
import type { Task, TaskInput, TaskPriority, TaskStatus } from './tasksService';
import { PRIORITY_LABEL, STATUS_LABEL } from './tasksFormat';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high'];

export interface TaskFormProps {
  initial?: Task;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function TaskForm({ initial, submitLabel, onSubmit, onCancel, submitting }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [project, setProject] = useState(initial?.project ?? '');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError(undefined);
    void onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate.trim() || undefined,
      project: project.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="task-form">
      <FormField label="Title" required error={error && !title.trim() ? error : undefined}>
        {(p) => (
          <Input
            {...p}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft Q3 roadmap review"
            data-testid="task-form-title"
          />
        )}
      </FormField>

      <FormField label="Description">
        {(p) => (
          <TextArea
            {...p}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to happen?"
            data-testid="task-form-description"
          />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Status">
          {(p) => (
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger id={p.id} data-testid="task-form-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField label="Priority">
          {(p) => (
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger id={p.id} data-testid="task-form-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((pr) => (
                  <SelectItem key={pr} value={pr}>
                    {PRIORITY_LABEL[pr]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Due date" description="Optional.">
          {(p) => (
            <Input
              {...p}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="task-form-due-date"
            />
          )}
        </FormField>

        <FormField label="Project" description="Optional grouping tag, e.g. Website Redesign.">
          {(p) => (
            <Input
              {...p}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Website Redesign"
              data-testid="task-form-project"
            />
          )}
        </FormField>
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger" data-testid="task-form-error">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} data-testid="task-form-submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
