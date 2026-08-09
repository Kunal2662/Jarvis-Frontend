import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleDot, ListTodo, Plus, SquareCheck } from 'lucide-react';
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
import { getTasksService, type Task, type TaskInput, type TaskPriority, type TaskStatus } from './tasksService';
import { TaskRow } from './TaskRow';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskForm } from './TaskForm';
import { isOverdue, nextStatus, PRIORITY_LABEL, STATUS_LABEL } from './tasksFormat';

type FormMode = { mode: 'create' } | { mode: 'edit'; task: Task } | null;
type StatusFilter = TaskStatus | 'all';
type PriorityFilter = TaskPriority | 'all';
type ProjectFilter = string | 'all' | 'none';

function matches(task: Task, term: string): boolean {
  const haystack = `${task.title} ${task.description} ${task.project ?? ''}`.toLowerCase();
  return haystack.includes(term);
}

export function TasksPage() {
  const service = useMemo(() => getTasksService(), []);
  const list = useAsync<Task[]>((signal) => service.getTasks(signal));
  const location = useLocation();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<FormMode>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');

  // Local, patchable copy of the list — mirrors AutomationsPage/NotesPage so a
  // toggle/create/edit/delete never flashes the whole page back to loading.
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (list.data) setTasks(list.data);
  }, [list.data]);

  // Deep-link support (mirrors AutomationsPage/NotesPage): Universal Search
  // navigates here with `state: { taskId }` when a task result is selected.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const taskId = (location.state as { taskId?: string } | null)?.taskId;
    if (!taskId || consumedDeepLink.current) return;
    if (tasks.some((t) => t.id === taskId)) {
      consumedDeepLink.current = true;
      setSelectedId(taskId);
      window.history.replaceState({}, '');
    }
  }, [location.state, tasks]);

  const selected = selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null;

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && tasks.length === 0
      ? 'empty'
      : list.status;

  const withPending = useCallback((id: string, fn: () => Promise<void>) => {
    setPendingIds((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }, []);

  const patchTask = (updated: Task) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const handleToggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    void withPending(id, async () => {
      try {
        const updated = await service.toggleComplete(id);
        patchTask(updated);
        toast({
          title: updated.status === 'done' ? 'Task completed' : 'Task reopened',
          description: task?.title,
          variant: updated.status === 'done' ? 'success' : 'info',
        });
      } catch (err) {
        toast({
          title: 'Could not update task',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const handleAdvanceStatus = (task: Task) => {
    void withPending(task.id, async () => {
      try {
        const updated = await service.setStatus(task.id, nextStatus(task.status));
        patchTask(updated);
        toast({ title: `Status: ${STATUS_LABEL[updated.status]}`, description: task.title });
      } catch (err) {
        toast({
          title: 'Could not update task',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const handleCreate = () => setFormState({ mode: 'create' });
  const handleEdit = (task: Task) => setFormState({ mode: 'edit', task });

  const handleFormSubmit = async (input: TaskInput) => {
    setFormSubmitting(true);
    try {
      if (formState?.mode === 'edit') {
        const updated = await service.updateTask(formState.task.id, input);
        patchTask(updated);
        toast({ title: 'Task updated', description: input.title, variant: 'success' });
      } else {
        const created = await service.createTask(input);
        setTasks((prev) => [created, ...prev]);
        toast({ title: 'Task created', description: input.title, variant: 'success' });
      }
      setFormState(null);
    } catch (err) {
      toast({
        title: 'Could not save task',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast({ title: 'Task deleted', description: deleteTarget.title });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not delete task',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const allProjects = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.project).filter((p): p is string => !!p))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [tasks],
  );

  const term = filterText.trim().toLowerCase();
  const filtered = tasks
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter((t) => {
      if (projectFilter === 'all') return true;
      if (projectFilter === 'none') return !t.project;
      return t.project === projectFilter;
    })
    .filter((t) => !term || matches(t, term))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter(isOverdue).length,
  };

  return (
    <>
      <ModulePage
        title="Tasks"
        description={
          service.ready
            ? 'A personal task list, with an optional project tag for lightweight grouping. Data shown here is local to this frontend session.'
            : `${service.label} — task data is not connected yet.`
        }
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="task-create">
            New task
          </Button>
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No tasks yet',
                description: 'Create your first task to start tracking your to-dos.',
                action: (
                  <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="task-create-empty">
                    New task
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="tasks-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Total" value={counts.total} icon={<ListTodo />} />
            <StatCard label="To do" value={counts.todo} icon={<SquareCheck />} />
            <StatCard label="In progress" value={counts.inProgress} icon={<CircleDot />} />
            <StatCard label="Done" value={counts.done} icon={<CheckCircle2 />} />
            <StatCard label="Overdue" value={counts.overdue} icon={<AlertTriangle />} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Search
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClear={() => setFilterText('')}
              placeholder="Filter tasks…"
              aria-label="Filter tasks"
              data-testid="tasks-filter-input"
              className="sm:max-w-sm"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger aria-label="Filter by status" className="sm:w-[160px]" data-testid="tasks-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">{STATUS_LABEL.todo}</SelectItem>
                <SelectItem value="in-progress">{STATUS_LABEL['in-progress']}</SelectItem>
                <SelectItem value="done">{STATUS_LABEL.done}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
              <SelectTrigger aria-label="Filter by priority" className="sm:w-[160px]" data-testid="tasks-priority-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">{PRIORITY_LABEL.low}</SelectItem>
                <SelectItem value="medium">{PRIORITY_LABEL.medium}</SelectItem>
                <SelectItem value="high">{PRIORITY_LABEL.high}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
              <SelectTrigger aria-label="Filter by project" className="sm:w-[180px]" data-testid="tasks-project-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                <SelectItem value="none">No project</SelectItem>
                {allProjects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Widget
            title="Tasks"
            icon={<ListTodo />}
            status={filtered.length === 0 ? 'empty' : 'ready'}
            emptyTitle="No matching tasks"
            emptyDescription="Try a different search term or filter."
          >
            <List className="divide-y divide-line-subtle" data-testid="tasks-list">
              {filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onOpen={setSelectedId}
                  onToggleComplete={handleToggleComplete}
                  toggling={pendingIds.has(task.id)}
                />
              ))}
            </List>
          </Widget>
        </div>
      </ModulePage>

      <TaskDetailDrawer
        task={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={(task) => {
          setSelectedId(null);
          handleEdit(task);
        }}
        onDelete={(task) => setDeleteTarget(task)}
        onAdvanceStatus={handleAdvanceStatus}
        busy={selected ? pendingIds.has(selected.id) : false}
      />

      <Modal open={formState !== null} onOpenChange={(open) => !open && setFormState(null)}>
        <ModalContent size="lg" data-testid="task-form-modal">
          <ModalHeader>
            <ModalTitle>{formState?.mode === 'edit' ? 'Edit task' : 'New task'}</ModalTitle>
            <ModalDescription>Track a to-do, with optional priority, due date and project tag.</ModalDescription>
          </ModalHeader>
          <TaskForm
            initial={formState?.mode === 'edit' ? formState.task : undefined}
            submitLabel={formState?.mode === 'edit' ? 'Save changes' : 'Create task'}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            submitting={formSubmitting}
          />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="task-delete-modal">
          <ModalHeader>
            <ModalTitle>Delete task?</ModalTitle>
            <ModalDescription>
              {deleteTarget ? `"${deleteTarget.title}" will be permanently deleted. This cannot be undone.` : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete} data-testid="task-delete-confirm">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
