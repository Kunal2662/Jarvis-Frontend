import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TaskInput, TasksService } from '../tasksService';

// Each test gets a fresh module instance so mutations in one test never leak
// into another (the mock adapter keeps its dataset in module-level state).
async function freshMockService(): Promise<TasksService> {
  vi.resetModules();
  const mod = await import('../adapters/mockTasksAdapter');
  return mod.mockTasksService;
}

const sampleInput: TaskInput = {
  title: 'Test task',
  description: 'Created in a test',
  status: 'todo',
  priority: 'medium',
  dueDate: '2026-09-01',
  project: 'Testing',
};

describe('tasks service seam', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('defaults to the mock adapter', async () => {
    const { getTasksService } = await import('../tasksService');
    const { mockTasksService } = await import('../adapters/mockTasksAdapter');
    expect(getTasksService()).toBe(mockTasksService);
    expect(mockTasksService.id).toBe('mock');
    expect(mockTasksService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', async () => {
    const { coreTasksService } = await import('../adapters/coreTasksAdapter');
    expect(coreTasksService.id).toBe('core');
    expect(coreTasksService.ready).toBe(false);
  });

  it('every core adapter method rejects with the unavailable error', async () => {
    const { coreTasksService } = await import('../adapters/coreTasksAdapter');
    const { CoreTasksContractUnavailableError } = await import('../tasksService');
    await expect(coreTasksService.getTasks()).rejects.toBeInstanceOf(CoreTasksContractUnavailableError);
    await expect(coreTasksService.getTask('x')).rejects.toBeInstanceOf(CoreTasksContractUnavailableError);
    await expect(coreTasksService.createTask(sampleInput)).rejects.toBeInstanceOf(
      CoreTasksContractUnavailableError,
    );
    await expect(coreTasksService.updateTask('x', sampleInput)).rejects.toBeInstanceOf(
      CoreTasksContractUnavailableError,
    );
    await expect(coreTasksService.deleteTask('x')).rejects.toBeInstanceOf(CoreTasksContractUnavailableError);
    await expect(coreTasksService.setStatus('x', 'done')).rejects.toBeInstanceOf(
      CoreTasksContractUnavailableError,
    );
    await expect(coreTasksService.toggleComplete('x')).rejects.toBeInstanceOf(
      CoreTasksContractUnavailableError,
    );
  });

  it('seeds 6 realistic tasks with varied statuses, priorities, and projects', async () => {
    const service = await freshMockService();
    const tasks = await service.getTasks();
    expect(tasks).toHaveLength(6);
    const statuses = new Set(tasks.map((t) => t.status));
    expect(statuses).toContain('todo');
    expect(statuses).toContain('in-progress');
    expect(statuses).toContain('done');
    // At least one task has no project — the grouping tag is genuinely optional.
    expect(tasks.some((t) => !t.project)).toBe(true);
  });

  it('getTask returns a single task', async () => {
    const service = await freshMockService();
    const task = await service.getTask('task-1');
    expect(task.title).toBe('Draft Q3 roadmap review');
  });

  it('getTask rejects for an unknown id', async () => {
    const service = await freshMockService();
    await expect(service.getTask('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('createTask adds a new task with the given status', async () => {
    const service = await freshMockService();
    const created = await service.createTask(sampleInput);
    expect(created.title).toBe('Test task');
    expect(created.status).toBe('todo');
    expect(created.completedAt).toBeUndefined();

    const all = await service.getTasks();
    expect(all.find((t) => t.id === created.id)).toBeTruthy();
    expect(all).toHaveLength(7);
  });

  it('createTask with status "done" sets completedAt immediately', async () => {
    const service = await freshMockService();
    const created = await service.createTask({ ...sampleInput, status: 'done' });
    expect(created.status).toBe('done');
    expect(created.completedAt).toBeTruthy();
  });

  it('updateTask overwrites the editable fields', async () => {
    const service = await freshMockService();
    const updated = await service.updateTask('task-1', { ...sampleInput, title: 'Renamed task' });
    expect(updated.title).toBe('Renamed task');
    expect(updated.project).toBe('Testing');
  });

  it('deleteTask removes the task from subsequent listings', async () => {
    const service = await freshMockService();
    const created = await service.createTask(sampleInput);
    await service.deleteTask(created.id);
    const all = await service.getTasks();
    expect(all.find((t) => t.id === created.id)).toBeUndefined();
    expect(all).toHaveLength(6);
  });

  it('setStatus transitions status and manages completedAt', async () => {
    const service = await freshMockService();
    const started = await service.setStatus('task-1', 'in-progress');
    expect(started.status).toBe('in-progress');
    expect(started.completedAt).toBeUndefined();

    const done = await service.setStatus('task-1', 'done');
    expect(done.status).toBe('done');
    expect(done.completedAt).toBeTruthy();

    const reopened = await service.setStatus('task-1', 'todo');
    expect(reopened.status).toBe('todo');
    expect(reopened.completedAt).toBeUndefined();
  });

  it('toggleComplete flips between done and todo', async () => {
    const service = await freshMockService();
    const done = await service.toggleComplete('task-1');
    expect(done.status).toBe('done');
    expect(done.completedAt).toBeTruthy();

    const reopened = await service.toggleComplete('task-1');
    expect(reopened.status).toBe('todo');
    expect(reopened.completedAt).toBeUndefined();
  });
});
