/**
 * Tasks data seam — the transport-agnostic contract the Tasks UI depends on.
 *
 *   TasksPage → task state/presentation → TasksService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice/Home/Automations/Notes seams (Steps 4-8, 12). Tasks
 * is user-authored content — the frontend owns full CRUD here, the same
 * shape as Automations (Step 8) and Notes. Per the README's Phase 10 note
 * ("Projects becomes a grouping inside them — not a navigation destination"),
 * `project` is a lightweight free-text grouping tag on each task, NOT a
 * separate Projects entity/route/service. Swapping the in-memory mock for a
 * real JARVIS Core Tasks API later is a matter of implementing a new adapter
 * and selecting it here — no UI changes required. We do NOT invent Core
 * endpoints; see docs/CORE_TASKS_CONTRACT_REQUIRED.md.
 */

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO date (no time) — optional. */
  dueDate?: string;
  /** Lightweight grouping tag, e.g. "Website Redesign". Optional, free-text. */
  project?: string;
  createdAt: string;
  updatedAt: string;
  /** Set when status transitions to 'done'; cleared on reopen. */
  completedAt?: string;
}

/** Fields the create/edit form collects. */
export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  project?: string;
}

/**
 * The contract every tasks backend adapter must satisfy.
 */
export interface TasksService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  /** True once this adapter is wired to a real, verified Core contract. */
  readonly ready: boolean;
  getTasks(signal?: AbortSignal): Promise<Task[]>;
  getTask(id: string, signal?: AbortSignal): Promise<Task>;
  createTask(input: TaskInput, signal?: AbortSignal): Promise<Task>;
  updateTask(id: string, input: TaskInput, signal?: AbortSignal): Promise<Task>;
  deleteTask(id: string, signal?: AbortSignal): Promise<void>;
  setStatus(id: string, status: TaskStatus, signal?: AbortSignal): Promise<Task>;
  /** Quick toggle used by the list checkbox: 'done' ⇄ 'todo'. */
  toggleComplete(id: string, signal?: AbortSignal): Promise<Task>;
}

/** Thrown when a not-yet-implemented backend adapter is invoked. */
export class CoreTasksContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core tasks contract is not available yet.') {
    super(message);
    this.name = 'CoreTasksContractUnavailableError';
  }
}

import { mockTasksService } from './adapters/mockTasksAdapter';
import { coreTasksService } from './adapters/coreTasksAdapter';

/**
 * Which backend feeds Tasks. Defaults to the frontend in-memory mock (Core
 * APIs are not required for this step). Set `VITE_TASKS_BACKEND=core` once
 * Claude Code has implemented + verified a Core tasks adapter.
 */
const TASKS_BACKEND = (import.meta.env.VITE_TASKS_BACKEND as string | undefined) ?? 'mock';

export function getTasksService(): TasksService {
  return TASKS_BACKEND === 'core' ? coreTasksService : mockTasksService;
}
