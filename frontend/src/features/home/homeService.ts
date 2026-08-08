/**
 * Home / Command Center data seam.
 *
 *   Home → useHomeSnapshot → HomeService → adapter → (mock | JARVIS Core)
 *
 * Mirrors the Chat/Voice seams (Steps 4–5). The Command Center renders only
 * against `HomeSnapshot`; it never knows where the data came from. Swapping the
 * mock for real JARVIS Core later means implementing a new adapter and selecting
 * it here — no Home redesign. We do NOT invent Core endpoints.
 */

export type HomePresence = 'ready' | 'listening' | 'thinking' | 'speaking' | 'offline';

export type ActivityKind =
  | 'conversation'
  | 'memory'
  | 'automation'
  | 'agent'
  | 'knowledge'
  | 'smart-home';

export interface SystemVitals {
  activeAgents: number;
  tasksDue: number;
  memoryItems: string;
  health: string;
  cpu: number;
  memory: number;
}

export interface TaskItem {
  id: string;
  label: string;
  due: string;
  done: boolean;
}

export interface CalendarEvent {
  id: string;
  time: string;
  label: string;
  tone: 'accent' | 'success' | 'warning';
}

export interface AutomationSummary {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
}

export interface SmartHomeDevice {
  id: string;
  name: string;
  room: string;
  on: boolean;
  kind: 'light' | 'thermostat' | 'lock' | 'media';
  value?: string;
}

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  text: string;
  time: string;
}

export interface HomeSnapshot {
  presence: HomePresence;
  system: SystemVitals;
  suggestions: string[];
  tasks: TaskItem[];
  events: CalendarEvent[];
  automations: AutomationSummary[];
  devices: SmartHomeDevice[];
  activity: ActivityEntry[];
}

export interface HomeService {
  readonly id: 'mock' | 'core';
  readonly label: string;
  readonly ready: boolean;
  getSnapshot(signal?: AbortSignal): Promise<HomeSnapshot>;
}

/** Thrown when a not-yet-implemented Home adapter is invoked. */
export class CoreHomeContractUnavailableError extends Error {
  constructor(message = 'JARVIS Core home data contract is not available yet.') {
    super(message);
    this.name = 'CoreHomeContractUnavailableError';
  }
}

import { mockHomeService } from './adapters/mockHomeAdapter';
import { coreHomeService } from './adapters/coreHomeAdapter';

/**
 * Which backend feeds Home. Defaults to the frontend mock (Core APIs are not
 * required for this step). Set `VITE_HOME_BACKEND=core` once Claude Code has
 * implemented + verified a Core home adapter.
 */
const HOME_BACKEND = (import.meta.env.VITE_HOME_BACKEND as string | undefined) ?? 'mock';

export function getHomeService(): HomeService {
  return HOME_BACKEND === 'core' ? coreHomeService : mockHomeService;
}
