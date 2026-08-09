import { Checkbox, ListRow } from '../../design-system';
import type { Task } from './tasksService';
import { formatDate, isOverdue } from './tasksFormat';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';

export interface TaskRowProps {
  task: Task;
  onOpen: (id: string) => void;
  onToggleComplete: (id: string) => void;
  toggling?: boolean;
}

export function TaskRow({ task, onOpen, onToggleComplete, toggling }: TaskRowProps) {
  const done = task.status === 'done';
  const overdue = isOverdue(task);

  return (
    <ListRow
      leading={
        <Checkbox
          checked={done}
          disabled={toggling}
          aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={() => onToggleComplete(task.id)}
          data-testid={`task-complete-${task.id}`}
        />
      }
      title={<span className={done ? 'text-content-tertiary line-through' : undefined}>{task.title}</span>}
      subtitle={task.project ?? undefined}
      trailing={
        <span className="flex items-center gap-2">
          {task.dueDate && (
            <span className={overdue ? 'whitespace-nowrap text-caption text-danger' : 'whitespace-nowrap text-caption text-content-tertiary'}>
              {overdue ? 'Overdue ' : 'Due '}
              {formatDate(task.dueDate)}
            </span>
          )}
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </span>
      }
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
      data-testid={`task-row-${task.id}`}
      aria-label={`Open ${task.title}`}
    />
  );
}
