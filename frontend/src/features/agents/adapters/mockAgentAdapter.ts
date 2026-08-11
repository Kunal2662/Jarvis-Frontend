import type { Agent, AgentRun, AgentService } from '../agentService';

/**
 * Frontend in-memory mock adapter for Agents. All mock data + mutation
 * logic lives HERE, separated from presentation. Simulates realistic
 * network latency so loading states are exercised, and mutates real
 * in-memory state so `setEnabled` is fully interactive. A future Core
 * adapter can replace this wholesale — no UI change required.
 *
 * These are fictional named roles illustrating what the single, existing
 * AgentOrchestrator (Steps 4-5) can be labeled as when reporting activity —
 * never independent services, never something this file actually executes.
 * No real Core AgentOrchestrator is ever contacted anywhere in this file,
 * and no run history here reflects a real conversation or task (see
 * docs/CORE_AGENTS_CONTRACT_REQUIRED.md).
 */

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function withAbort<T>(signal: AbortSignal | undefined, value: T, ms = 300): Promise<T> {
  const result = await delay(value, ms);
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
  return result;
}

let agents: Agent[] = [
  {
    id: 'agent-research',
    name: 'Research Agent',
    description: 'Looks up and summarizes information from your knowledge base and the web when you ask Jarvis a research question.',
    status: 'active',
    capabilities: ['Web research', 'Summarization'],
    lastRunAt: '2026-08-10T09:15:00-04:00',
  },
  {
    id: 'agent-briefing',
    name: 'Daily Briefing Agent',
    description: 'Compiles your morning briefing from calendar, tasks, and overnight activity.',
    status: 'idle',
    capabilities: ['Morning summary', 'Calendar review'],
    lastRunAt: '2026-08-10T07:00:00-04:00',
  },
  {
    id: 'agent-health',
    name: 'System Health Agent',
    description: 'Runs periodic diagnostics on JARVIS itself and flags anything that needs attention.',
    status: 'active',
    capabilities: ['Diagnostics', 'Anomaly detection'],
    lastRunAt: '2026-08-10T04:00:00-04:00',
  },
  {
    id: 'agent-planning',
    name: 'Task Planning Agent',
    description: 'Breaks a larger request down into smaller tasks and suggests priorities.',
    status: 'idle',
    capabilities: ['Task breakdown', 'Prioritization'],
    lastRunAt: '2026-08-08T16:30:00-04:00',
  },
  {
    id: 'agent-smarthome',
    name: 'Smart Home Agent',
    description: 'Watches for smart-home context (device status, routines) relevant to a conversation. Currently disabled.',
    status: 'disabled',
    capabilities: ['Device status monitoring', 'Routine suggestions'],
  },
];

const runs: AgentRun[] = [
  {
    id: 'run-1',
    agentId: 'agent-research',
    status: 'completed',
    startedAt: '2026-08-10T09:14:40-04:00',
    completedAt: '2026-08-10T09:15:00-04:00',
    summary: 'Completed a market brief for the Mark III project.',
  },
  {
    id: 'run-2',
    agentId: 'agent-research',
    status: 'completed',
    startedAt: '2026-08-09T14:02:10-04:00',
    completedAt: '2026-08-09T14:02:45-04:00',
    summary: 'Summarized three competitor product pages.',
  },
  {
    id: 'run-3',
    agentId: 'agent-briefing',
    status: 'completed',
    startedAt: '2026-08-10T06:59:30-04:00',
    completedAt: '2026-08-10T07:00:00-04:00',
    summary: "Sent this morning's briefing.",
  },
  {
    id: 'run-4',
    agentId: 'agent-briefing',
    status: 'failed',
    startedAt: '2026-08-09T06:59:20-04:00',
    completedAt: '2026-08-09T06:59:35-04:00',
    summary: 'Could not reach the calendar source in time — briefing skipped.',
  },
  {
    id: 'run-5',
    agentId: 'agent-health',
    status: 'completed',
    startedAt: '2026-08-10T03:58:00-04:00',
    completedAt: '2026-08-10T04:00:00-04:00',
    summary: 'Completed nightly diagnostics — all systems nominal.',
  },
  {
    id: 'run-6',
    agentId: 'agent-health',
    status: 'completed',
    startedAt: '2026-08-09T03:58:00-04:00',
    completedAt: '2026-08-09T04:00:00-04:00',
    summary: 'Flagged elevated CPU usage; resolved automatically.',
  },
  {
    id: 'run-7',
    agentId: 'agent-planning',
    status: 'completed',
    startedAt: '2026-08-08T16:29:10-04:00',
    completedAt: '2026-08-08T16:30:00-04:00',
    summary: 'Broke the Q3 roadmap review down into five subtasks.',
  },
  // agent-smarthome intentionally has zero runs — exercises the "no runs
  // yet" empty state honestly (it is also seeded disabled).
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function requireAgent(id: string): Agent {
  const found = agents.find((a) => a.id === id);
  if (!found) throw new Error(`Agent "${id}" was not found.`);
  return found;
}

export const mockAgentService: AgentService = {
  id: 'mock',
  label: 'Frontend mock (local development agents)',
  ready: true,

  async getAgents(signal?: AbortSignal): Promise<Agent[]> {
    return withAbort(signal, agents.map(clone));
  },

  async getAgent(id: string, signal?: AbortSignal): Promise<Agent> {
    const agent = requireAgent(id);
    return withAbort(signal, clone(agent));
  },

  async getRuns(agentId: string, signal?: AbortSignal): Promise<AgentRun[]> {
    requireAgent(agentId);
    const found = runs
      .filter((r) => r.agentId === agentId)
      .slice()
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return withAbort(signal, found.map(clone));
  },

  async setEnabled(id: string, enabled: boolean, signal?: AbortSignal): Promise<Agent> {
    const agent = requireAgent(id);
    const updated: Agent = { ...agent, status: enabled ? 'idle' : 'disabled' };
    agents = agents.map((a) => (a.id === id ? updated : a));
    return withAbort(signal, clone(updated));
  },
};
