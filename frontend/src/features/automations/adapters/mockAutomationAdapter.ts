import type {
  Automation,
  AutomationExecution,
  AutomationInput,
  AutomationService,
  PauseResumeAction,
} from '../automationService';

/**
 * Frontend in-memory mock adapter for Automations. All mock data + mutation
 * logic lives HERE, separated from presentation. Simulates realistic network
 * latency so loading states are exercised, and mutates real in-memory state so
 * the UI is fully interactive (not static). A future Core adapter can replace
 * this wholesale — no UI change required.
 */

let seq = 100;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 350): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let automations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Morning Brief',
    description: 'Sends a daily summary of calendar, tasks, and top headlines every weekday morning.',
    status: 'active',
    enabled: true,
    trigger: { type: 'schedule', summary: 'Every weekday at 7:00 AM', schedule: '0 7 * * 1-5' },
    conditions: [{ id: 'c1', summary: 'Only when at least one calendar event exists' }],
    actions: [
      { id: 'a1', type: 'notify', summary: 'Send a morning brief notification' },
      { id: 'a2', type: 'run-agent', summary: 'Ask the Research Agent to attach top headlines' },
    ],
    nextRun: '2026-08-10T07:00:00-04:00',
    lastRun: '2026-08-07T07:00:00-04:00',
    lastResult: 'success',
    createdAt: '2026-05-01T09:00:00-04:00',
    updatedAt: '2026-07-20T11:00:00-04:00',
    executionHistory: [
      { id: 'e1', timestamp: '2026-08-07T07:00:00-04:00', status: 'success', durationMs: 1820, result: 'Sent brief with 4 events and 6 tasks.' },
      { id: 'e2', timestamp: '2026-08-06T07:00:00-04:00', status: 'success', durationMs: 1650, result: 'Sent brief with 2 events and 3 tasks.' },
      { id: 'e3', timestamp: '2026-08-05T07:00:00-04:00', status: 'success', durationMs: 1790, result: 'Sent brief with 5 events and 8 tasks.' },
    ],
  },
  {
    id: 'auto-2',
    name: 'Daily System Health Check',
    description: 'Runs a diagnostic sweep of agents, memory, and integrations and alerts on anomalies.',
    status: 'active',
    enabled: true,
    trigger: { type: 'schedule', summary: 'Every day at 2:00 AM', schedule: '0 2 * * *' },
    conditions: [],
    actions: [
      { id: 'a3', type: 'run-agent', summary: 'Run the System Diagnostics agent' },
      { id: 'a4', type: 'notify', summary: 'Notify only if an anomaly is detected' },
    ],
    nextRun: '2026-08-09T02:00:00-04:00',
    lastRun: '2026-08-08T02:00:00-04:00',
    lastResult: 'success',
    createdAt: '2026-04-12T09:00:00-04:00',
    updatedAt: '2026-04-12T09:00:00-04:00',
    executionHistory: [
      { id: 'e4', timestamp: '2026-08-08T02:00:00-04:00', status: 'success', durationMs: 4210, result: 'All systems nominal.' },
      { id: 'e5', timestamp: '2026-08-07T02:00:00-04:00', status: 'success', durationMs: 3980, result: 'All systems nominal.' },
      { id: 'e6', timestamp: '2026-08-06T02:00:00-04:00', status: 'failed', durationMs: 2100, error: 'Timed out reaching the memory index.' },
    ],
  },
  {
    id: 'auto-3',
    name: 'Smart Home Evening Routine',
    description: 'Dims the lights, locks the front door, and sets the thermostat at sunset.',
    status: 'paused',
    enabled: false,
    trigger: { type: 'event', summary: 'On sunset', event: 'sunset' },
    conditions: [{ id: 'c2', summary: 'Only when someone is home' }],
    actions: [
      { id: 'a5', type: 'device', summary: 'Dim living room lights to 40%' },
      { id: 'a6', type: 'device', summary: 'Lock the front door' },
      { id: 'a7', type: 'device', summary: 'Set thermostat to 21°C' },
    ],
    nextRun: undefined,
    lastRun: '2026-07-30T20:14:00-04:00',
    lastResult: 'success',
    createdAt: '2026-03-02T09:00:00-04:00',
    updatedAt: '2026-07-31T08:00:00-04:00',
    executionHistory: [
      { id: 'e7', timestamp: '2026-07-30T20:14:00-04:00', status: 'success', durationMs: 940, result: 'Evening routine applied to 3 devices.' },
      { id: 'e8', timestamp: '2026-07-29T20:11:00-04:00', status: 'success', durationMs: 880, result: 'Evening routine applied to 3 devices.' },
    ],
  },
  {
    id: 'auto-4',
    name: 'Weekly Work Summary',
    description: 'Compiles completed tasks and project updates into a Friday summary.',
    status: 'failed',
    enabled: true,
    trigger: { type: 'schedule', summary: 'Every Friday at 5:00 PM', schedule: '0 17 * * 5' },
    conditions: [],
    actions: [
      { id: 'a8', type: 'run-agent', summary: 'Ask the Productivity Agent to compile the summary' },
      { id: 'a9', type: 'integration', summary: 'Post the summary to the team workspace' },
    ],
    nextRun: '2026-08-14T17:00:00-04:00',
    lastRun: '2026-08-07T17:00:00-04:00',
    lastResult: 'failed',
    createdAt: '2026-06-06T09:00:00-04:00',
    updatedAt: '2026-08-07T17:05:00-04:00',
    executionHistory: [
      { id: 'e9', timestamp: '2026-08-07T17:00:00-04:00', status: 'failed', durationMs: 3200, error: 'Team workspace integration returned 401 Unauthorized.' },
      { id: 'e10', timestamp: '2026-07-31T17:00:00-04:00', status: 'success', durationMs: 2650, result: 'Summary posted with 14 completed tasks.' },
    ],
  },
  {
    id: 'auto-5',
    name: 'Backup Reminder',
    description: 'Reminds you to run a local backup if one has not completed in 7 days.',
    status: 'disabled',
    enabled: false,
    trigger: { type: 'schedule', summary: 'Every day at 9:00 PM', schedule: '0 21 * * *' },
    conditions: [{ id: 'c3', summary: 'Only if last backup is older than 7 days' }],
    actions: [{ id: 'a10', type: 'notify', summary: 'Send a backup reminder notification' }],
    nextRun: undefined,
    lastRun: '2026-07-10T21:00:00-04:00',
    lastResult: 'success',
    createdAt: '2026-02-14T09:00:00-04:00',
    updatedAt: '2026-07-11T09:00:00-04:00',
    executionHistory: [
      { id: 'e11', timestamp: '2026-07-10T21:00:00-04:00', status: 'success', durationMs: 410, result: 'Reminder sent.' },
    ],
  },
];

function statusFromEnabled(current: Automation, enabled: boolean): Automation['status'] {
  if (!enabled) return 'disabled';
  return current.lastResult === 'failed' ? 'failed' : 'active';
}

function clone(a: Automation): Automation {
  return JSON.parse(JSON.stringify(a));
}

function requireAutomation(id: string): Automation {
  const found = automations.find((a) => a.id === id);
  if (!found) throw new Error(`Automation "${id}" was not found.`);
  return found;
}

export const mockAutomationService: AutomationService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,

  async getAutomations(signal?: AbortSignal): Promise<Automation[]> {
    return withAbort(signal, automations.map(clone));
  },

  async getAutomation(id: string, signal?: AbortSignal): Promise<Automation> {
    const found = requireAutomation(id);
    return withAbort(signal, clone(found), 250);
  },

  async createAutomation(input: AutomationInput, signal?: AbortSignal): Promise<Automation> {
    const now = new Date().toISOString();
    const created: Automation = {
      id: nextId('auto'),
      name: input.name,
      description: input.description,
      status: 'active',
      enabled: true,
      trigger: input.trigger,
      conditions: input.conditions,
      actions: input.actions,
      nextRun: undefined,
      lastRun: undefined,
      lastResult: undefined,
      createdAt: now,
      updatedAt: now,
      executionHistory: [],
    };
    automations = [created, ...automations];
    return withAbort(signal, clone(created));
  },

  async updateAutomation(id: string, input: AutomationInput, signal?: AbortSignal): Promise<Automation> {
    const existing = requireAutomation(id);
    const updated: Automation = {
      ...existing,
      name: input.name,
      description: input.description,
      trigger: input.trigger,
      conditions: input.conditions,
      actions: input.actions,
      updatedAt: new Date().toISOString(),
    };
    automations = automations.map((a) => (a.id === id ? updated : a));
    return withAbort(signal, clone(updated));
  },

  async deleteAutomation(id: string, signal?: AbortSignal): Promise<void> {
    requireAutomation(id);
    automations = automations.filter((a) => a.id !== id);
    return withAbort(signal, undefined);
  },

  async setEnabled(id: string, enabled: boolean, signal?: AbortSignal): Promise<Automation> {
    const existing = requireAutomation(id);
    const updated: Automation = {
      ...existing,
      enabled,
      status: statusFromEnabled(existing, enabled),
      nextRun: enabled ? existing.nextRun : undefined,
      updatedAt: new Date().toISOString(),
    };
    automations = automations.map((a) => (a.id === id ? updated : a));
    return withAbort(signal, clone(updated), 250);
  },

  async pauseResume(id: string, action: PauseResumeAction, signal?: AbortSignal): Promise<Automation> {
    const existing = requireAutomation(id);
    const enabled = action === 'resume';
    const updated: Automation = {
      ...existing,
      enabled,
      status: enabled ? statusFromEnabled(existing, true) : 'paused',
      nextRun: enabled ? existing.nextRun : undefined,
      updatedAt: new Date().toISOString(),
    };
    automations = automations.map((a) => (a.id === id ? updated : a));
    return withAbort(signal, clone(updated), 250);
  },

  async getExecutionHistory(id: string, signal?: AbortSignal): Promise<AutomationExecution[]> {
    const existing = requireAutomation(id);
    return withAbort(signal, existing.executionHistory.map((e) => ({ ...e })), 200);
  },
};
