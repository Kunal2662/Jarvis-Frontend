import {
  CoreTasksContractUnavailableError,
  type Task,
  type TaskInput,
  type TasksService,
  type TaskStatus,
} from '../tasksService';

/**
 * JARVIS Core tasks adapter — INTENTIONALLY UNIMPLEMENTED.
 *
 * The real JARVIS Core tasks contract (list/get/create/update/delete/status,
 * owned by JARVIS Core M11 — Intelligent Workspace & Productivity, which is
 * only 🟡 Active/Not fully closed on the Core side) is not yet available.
 * Per project rules we do NOT invent an endpoint. This adapter is the plug
 * point: once the Core tasks contract is verified, implement each method
 * here (map Core → Task types), set `ready: true`, and select it via
 * `VITE_TASKS_BACKEND=core`. No TasksPage/UI change is needed.
 *
 * See docs/CORE_TASKS_CONTRACT_REQUIRED.md for exactly what must be
 * provided.
 */
function unavailable(): never {
  if (import.meta.env.DEV) {
    console.warn(new CoreTasksContractUnavailableError().message);
  }
  throw new CoreTasksContractUnavailableError();
}

export const coreTasksService: TasksService = {
  id: 'core',
  label: 'JARVIS Core (contract pending)',
  ready: false,

  async getTasks(): Promise<Task[]> {
    return unavailable();
  },
  async getTask(): Promise<Task> {
    return unavailable();
  },
  async createTask(_input: TaskInput): Promise<Task> {
    return unavailable();
  },
  async updateTask(_id: string, _input: TaskInput): Promise<Task> {
    return unavailable();
  },
  async deleteTask(): Promise<void> {
    return unavailable();
  },
  async setStatus(_id: string, _status: TaskStatus): Promise<Task> {
    return unavailable();
  },
  async toggleComplete(): Promise<Task> {
    return unavailable();
  },
};
