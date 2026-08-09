import type { Task, TaskInput, TasksService, TaskStatus } from '../tasksService';

/**
 * Frontend in-memory mock adapter for Tasks. All mock data + mutation logic
 * lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state
 * so the UI is fully interactive (not static). A future Core adapter can
 * replace this wholesale — no UI change required. Mirrors
 * mockAutomationAdapter.ts / mockNotesAdapter.ts's shape/style.
 */

let seq = 100;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Draft Q3 roadmap review',
    description: 'Summarize Steps 8-11 progress and propose the M11 Productivity sequence.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-08-12',
    project: 'Roadmap',
    createdAt: '2026-08-01T09:00:00-04:00',
    updatedAt: '2026-08-01T09:00:00-04:00',
  },
  {
    id: 'task-2',
    title: 'Fix Voice Overlay animation glitch',
    description: 'The wake-word pulse stutters on the first frame after a cold load.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-08-10',
    project: 'Frontend Polish',
    createdAt: '2026-08-03T11:30:00-04:00',
    updatedAt: '2026-08-07T15:00:00-04:00',
  },
  {
    id: 'task-3',
    title: 'Review Smart Home connectivity PR',
    description: 'Check the MQTT reconnect backoff logic before it merges.',
    status: 'todo',
    priority: 'medium',
    dueDate: undefined,
    project: 'Smart Home',
    createdAt: '2026-08-05T10:00:00-04:00',
    updatedAt: '2026-08-05T10:00:00-04:00',
  },
  {
    id: 'task-4',
    title: 'Write onboarding doc for new agents',
    description: 'Short doc covering the adapter seam pattern and CLAUDE.md rules.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-08-20',
    project: 'Docs',
    createdAt: '2026-07-28T09:00:00-04:00',
    updatedAt: '2026-07-28T09:00:00-04:00',
  },
  {
    id: 'task-5',
    title: 'Renew home Wi-Fi router firmware',
    description: '',
    status: 'done',
    priority: 'low',
    dueDate: '2026-07-15',
    project: undefined,
    createdAt: '2026-07-10T08:00:00-04:00',
    updatedAt: '2026-07-15T18:20:00-04:00',
    completedAt: '2026-07-15T18:20:00-04:00',
  },
  {
    id: 'task-6',
    title: 'Back up family photos',
    description: 'Copy the last two months to the NAS.',
    status: 'done',
    priority: 'low',
    dueDate: undefined,
    project: 'Personal',
    createdAt: '2026-07-20T20:00:00-04:00',
    updatedAt: '2026-07-22T21:00:00-04:00',
    completedAt: '2026-07-22T21:00:00-04:00',
  },
];

function clone(t: Task): Task {
  return { ...t };
}

function requireTask(id: string): Task {
  const found = tasks.find((t) => t.id === id);
  if (!found) throw new Error(`Task "${id}" was not found.`);
  return found;
}

function applyStatus(task: Task, status: TaskStatus): Task {
  return {
    ...task,
    status,
    completedAt: status === 'done' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };
}

export const mockTasksService: TasksService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getTasks(signal?: AbortSignal): Promise<Task[]> {
    return withAbort(signal, tasks.map(clone));
  },

  async getTask(id: string, signal?: AbortSignal): Promise<Task> {
    const found = requireTask(id);
    return withAbort(signal, clone(found), 200);
  },

  async createTask(input: TaskInput, signal?: AbortSignal): Promise<Task> {
    const now = new Date().toISOString();
    const created: Task = {
      id: nextId('task'),
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      project: input.project,
      createdAt: now,
      updatedAt: now,
      completedAt: input.status === 'done' ? now : undefined,
    };
    tasks = [created, ...tasks];
    return withAbort(signal, clone(created));
  },

  async updateTask(id: string, input: TaskInput, signal?: AbortSignal): Promise<Task> {
    const existing = requireTask(id);
    const updated: Task = {
      ...existing,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      project: input.project,
      updatedAt: new Date().toISOString(),
      completedAt: input.status === 'done' ? existing.completedAt ?? new Date().toISOString() : undefined,
    };
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    return withAbort(signal, clone(updated));
  },

  async deleteTask(id: string, signal?: AbortSignal): Promise<void> {
    requireTask(id);
    tasks = tasks.filter((t) => t.id !== id);
    return withAbort(signal, undefined);
  },

  async setStatus(id: string, status: TaskStatus, signal?: AbortSignal): Promise<Task> {
    const existing = requireTask(id);
    const updated = applyStatus(existing, status);
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    return withAbort(signal, clone(updated), 200);
  },

  async toggleComplete(id: string, signal?: AbortSignal): Promise<Task> {
    const existing = requireTask(id);
    const updated = applyStatus(existing, existing.status === 'done' ? 'todo' : 'done');
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    return withAbort(signal, clone(updated), 200);
  },
};
