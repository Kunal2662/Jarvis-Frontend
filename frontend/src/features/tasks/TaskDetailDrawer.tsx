import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
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
import type { Task } from './tasksService';
import { formatDate, formatDateTime, isOverdue, NEXT_STATUS_LABEL } from './tasksFormat';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';

export interface TaskDetailDrawerProps {
  task: Task | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAdvanceStatus: (task: Task) => void;
  busy?: boolean;
}

export function TaskDetailDrawer({
  task,
  loading,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onAdvanceStatus,
  busy,
}: TaskDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="task-detail-drawer">
        {loading || !task ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{task.title}</DrawerTitle>
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <DrawerDescription>{task.description || 'No description provided.'}</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Due date</div>
                <div className={isOverdue(task) ? 'text-danger' : 'text-content'}>
                  {formatDate(task.dueDate)}
                  {isOverdue(task) && (
                    <Badge variant="danger" size="sm" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Project</div>
                <div className="text-content">{task.project || '—'}</div>
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Timeline</h3>
              <p className="rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                Created {formatDateTime(task.createdAt)} · Updated {formatDateTime(task.updatedAt)}
                {task.completedAt ? ` · Completed ${formatDateTime(task.completedAt)}` : ''}
              </p>
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
              <Button variant="secondary" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(task)}>
                Edit
              </Button>
              <Button
                variant="secondary"
                leftIcon={<ArrowRight className="size-4" />}
                onClick={() => onAdvanceStatus(task)}
                disabled={busy}
                data-testid="task-advance-status"
              >
                {NEXT_STATUS_LABEL[task.status]}
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onDelete(task)}
                className="ml-auto"
                data-testid="task-delete-trigger"
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
