import type { HomeService, HomeSnapshot } from '../homeService';

/**
 * Frontend mock adapter for the Command Center. All Home mock data lives HERE,
 * separated from presentation (no large literals inside JSX). Static + synchronous
 * — no timers, no polling. A future Core adapter can replace this wholesale.
 */
const snapshot: HomeSnapshot = {
  presence: 'ready',
  system: {
    activeAgents: 12,
    tasksDue: 7,
    memoryItems: '1.2k',
    health: '99.9%',
    cpu: 34,
    memory: 58,
  },
  suggestions: [
    'Summarize my unread emails',
    "What's on my schedule today?",
    'Draft the Mark III project plan',
    'Show tasks due today',
  ],
  tasks: [
    { id: 't1', label: 'Finish the Mark III report', due: 'Today', done: false },
    { id: 't2', label: 'Reply to Pepper about the gala', due: 'Today', done: false },
    { id: 't3', label: 'Review lab safety checklist', due: 'Tomorrow', done: false },
    { id: 't4', label: 'Approve Q3 budget', due: 'Fri', done: true },
  ],
  events: [
    { id: 'e1', time: '10:00', label: 'Design review — Mark III', tone: 'accent' },
    { id: 'e2', time: '13:00', label: 'Lunch with Sarah', tone: 'success' },
    { id: 'e3', time: '16:30', label: 'Investor sync', tone: 'warning' },
  ],
  automations: [
    { id: 'a1', name: 'Morning digest', status: 'active', lastRun: '7:00 AM' },
    { id: 'a2', name: 'Inbox triage', status: 'active', lastRun: '20m ago' },
    { id: 'a3', name: 'Nightly backup', status: 'paused', lastRun: 'Yesterday' },
  ],
  devices: [
    { id: 'd1', name: 'Lab lights', room: 'Workshop', on: true, kind: 'light' },
    { id: 'd2', name: 'Thermostat', room: 'Living', on: true, kind: 'thermostat', value: '21°C' },
    { id: 'd3', name: 'Front door', room: 'Entry', on: false, kind: 'lock', value: 'Locked' },
    { id: 'd4', name: 'Speakers', room: 'Studio', on: false, kind: 'media' },
  ],
  activity: [
    { id: 'ac1', kind: 'agent', text: 'Research Agent completed a market brief', time: '2m' },
    { id: 'ac2', kind: 'memory', text: 'Saved 12 highlights from “Mark III specs.pdf”', time: '18m' },
    { id: 'ac3', kind: 'automation', text: 'Morning digest ran successfully', time: '1h' },
    { id: 'ac4', kind: 'conversation', text: 'You asked Jarvis to summarize your inbox', time: '2h' },
    { id: 'ac5', kind: 'smart-home', text: 'Workshop lights turned on automatically', time: '3h' },
    { id: 'ac6', kind: 'knowledge', text: 'Linked “Pepper Potts” to 3 new projects', time: '5h' },
  ],
};

export const mockHomeService: HomeService = {
  id: 'mock',
  label: 'Frontend mock',
  ready: true,
  async getSnapshot(signal?: AbortSignal): Promise<HomeSnapshot> {
    // Structured async access point so the Core adapter can slot in unchanged.
    await Promise.resolve();
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    return snapshot;
  },
};
